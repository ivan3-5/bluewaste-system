import "dart:async";
import "dart:io";

import "package:bluewaste_mobile_flutter/src/core/network/api_exception.dart";
import "package:bluewaste_mobile_flutter/src/core/providers.dart";
import "package:bluewaste_mobile_flutter/src/core/storage/session_storage.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/data/offline_service.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/data/report_service.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/domain/report_models.dart";
import "package:dio/dio.dart";
import "package:flutter/services.dart";
import "package:flutter/widgets.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:flutter_test/flutter_test.dart";
import "package:hive/hive.dart";

class _Session extends SessionStorage {
  @override
  Future<String?> readToken() async => "token";

  @override
  Future<Map<String, dynamic>> readUserJson() async => {"id": "owner"};
}

class _FailingSession extends _Session {
  var reads = 0;

  @override
  Future<String?> readToken() async {
    if (reads++ == 0) throw StateError("Storage temporarily unavailable");
    return super.readToken();
  }
}

class _Reports extends ReportService {
  _Reports() : super(Dio());

  Future<ReportRecord> Function()? onCreate;
  var creates = 0;
  var uploads = 0;
  var storedPhotos = 0;

  ReportRecord get report => ReportRecord.fromJson({
    "id": "report-id",
    "images": List.generate(storedPhotos, (_) => {"type": "REPORT"}),
  });

  @override
  Future<ReportRecord> createReportFromData(Map<String, dynamic> data) async {
    creates++;
    final create = onCreate;
    return create == null ? report : await create();
  }

  @override
  Future<PaginatedData<ReportRecord>> getMyReports({
    int page = 1,
    int limit = 20,
    String? status,
  }) async => const PaginatedData(
    data: [],
    pagination: PaginationMeta(page: 1, limit: 20, total: 0, totalPages: 0),
  );

  @override
  Future<void> uploadQueuedImages({
    required String reportId,
    required List<String> imagePaths,
  }) async {
    uploads += imagePaths.length;
    storedPhotos += imagePaths.length;
  }

  @override
  Future<ReportRecord> getReportById(String reportId) async => report;
}

void main() {
  final binding = TestWidgetsFlutterBinding.ensureInitialized();
  final messenger = binding.defaultBinaryMessenger;
  const connectivity = MethodChannel("dev.fluttercommunity.plus/connectivity");
  const connectivityEvents = MethodChannel(
    "dev.fluttercommunity.plus/connectivity_status",
  );
  const pathProvider = MethodChannel("plugins.flutter.io/path_provider");
  const reportData = {"latitude": 7.3, "longitude": 125.7};

  late Directory directory;
  late _Reports reports;
  late OfflineService service;

  setUp(() async {
    directory = await Directory.systemTemp.createTemp("offline_sync_test");
    Hive.init(directory.path);
    messenger.setMockMethodCallHandler(connectivity, (_) async => "none");
    messenger.setMockMethodCallHandler(
      pathProvider,
      (_) async => directory.path,
    );
    reports = _Reports();
    service = OfflineService(reports, _Session());
  });

  tearDown(() async {
    service.dispose();
    messenger.setMockMethodCallHandler(connectivity, null);
    messenger.setMockMethodCallHandler(connectivityEvents, null);
    messenger.setMockMethodCallHandler(pathProvider, null);
    await Hive.close();
    await directory.delete(recursive: true);
  });

  test("Wi-Fi, mobile data, and app resume trigger automatic sync", () async {
    messenger.setMockMethodCallHandler(connectivityEvents, (_) async => null);
    final originalState = binding.lifecycleState;
    binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
    addTearDown(() {
      if (originalState != null) {
        binding.handleAppLifecycleStateChanged(originalState);
      }
    });

    for (final trigger in ["wifi", "mobile", "resume"]) {
      await service.queueReport(data: reportData, imagePaths: []);
      reports.onCreate = () async =>
          throw ApiException("No connection", isTimeoutOrNetworkError: true);
      service.startSyncListener();
      final offline = await service.syncOfflineReports(retryIfBusy: false);
      expect(offline.offline, isTrue);
      expect((await service.getQueuedReports()).single.attempts, 0);

      final synced = Completer<void>();
      reports.onCreate = () async {
        synced.complete();
        return reports.report;
      };
      if (trigger == "resume") {
        binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);
        binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      } else {
        await messenger.handlePlatformMessage(
          connectivityEvents.name,
          const StandardMethodCodec().encodeSuccessEnvelope(trigger),
          (_) {},
        );
      }

      await synced.future.timeout(const Duration(seconds: 3));
      final result = await service.syncOfflineReports(retryIfBusy: false);
      expect(result.uploaded, 1);
      expect((await service.queueSummary()).total, 0);
    }
  });

  test(
    "manual sync reaches the server even when connectivity says offline",
    () async {
      await service.queueReport(data: reportData, imagePaths: []);

      final result = await service.syncOfflineReports();

      expect(result.uploaded, 1);
      expect(reports.creates, 1);
      expect((await service.queueSummary()).total, 0);
    },
  );

  test("a sync requested during a network failure runs a fresh pass", () async {
    await service.queueReport(data: reportData, imagePaths: []);
    final started = Completer<void>();
    final firstRequest = Completer<ReportRecord>();
    reports.onCreate = () {
      started.complete();
      return firstRequest.future;
    };

    final first = service.syncOfflineReports();
    await started.future;
    final retry = service.syncOfflineReports();
    reports.onCreate = null;
    firstRequest.completeError(
      ApiException("Network changed", isTimeoutOrNetworkError: true),
    );

    final result = await retry;
    expect(await first, same(result));
    expect(result.uploaded, 1);
    expect(result.offline, isFalse);
    expect(reports.creates, 2);
    expect((await service.queueSummary()).total, 0);
  });

  test(
    "retry keeps a photo the server received before the disconnect",
    () async {
      final photo = await File(
        "${directory.path}/report.jpg",
      ).writeAsString("photo");
      await service.queueReport(
        data: reportData,
        imagePaths: [photo.path],
        remoteReportId: "report-id",
      );
      reports.storedPhotos = 1;

      final result = await service.syncOfflineReports();

      expect(result.uploaded, 1);
      expect(reports.creates, 0);
      expect(reports.uploads, 0);
      expect((await service.queueSummary()).total, 0);
    },
  );

  test("server confirmation uses the backend's versioned route", () async {
    final dio = Dio(BaseOptions(baseUrl: "https://example.test/api"));
    addTearDown(dio.close);
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (request, handler) {
          expect(request.uri.path, "/api/v1/reports/report-id");
          handler.resolve(
            Response(
              requestOptions: request,
              data: {"id": "report-id", "images": []},
            ),
          );
        },
      ),
    );

    expect(
      (await ReportService(dio).getReportById("report-id")).id,
      "report-id",
    );
  });

  test("a secure storage error releases the queued HTTP interceptor", () async {
    final container = ProviderContainer(
      overrides: [sessionStorageProvider.overrideWithValue(_FailingSession())],
    );
    addTearDown(container.dispose);
    final dio = container.read(dioProvider);
    addTearDown(dio.close);
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (request, handler) {
          handler.resolve(
            Response(
              requestOptions: request,
              data: request.headers["Authorization"],
            ),
          );
        },
      ),
    );

    await expectLater(dio.get("/reports"), throwsA(isA<DioException>()));
    expect((await dio.get("/reports")).data, "Bearer token");
  });
}
