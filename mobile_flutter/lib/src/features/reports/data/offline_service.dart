import "dart:async";
import "dart:convert";
import "dart:io";

import "package:connectivity_plus/connectivity_plus.dart";
import "package:flutter/foundation.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:hive/hive.dart";
import "package:path_provider/path_provider.dart";

import "../../../core/network/api_exception.dart";
import "../../../core/providers.dart";
import "../../../core/storage/session_storage.dart";
import "report_service.dart";

class OfflineReportPayload {
  OfflineReportPayload({
    required this.id,
    required this.data,
    required this.imagePaths,
    this.userId,
    this.remoteReportId,
  });

  final String id;
  final Map<String, dynamic> data;
  final List<String> imagePaths;

  /// Owner of the report; entries are only synced for the signed-in user.
  final String? userId;

  /// Set once the report exists on the server, so a retry only uploads images.
  final String? remoteReportId;

  OfflineReportPayload copyWith({String? remoteReportId}) {
    return OfflineReportPayload(
      id: id,
      data: data,
      imagePaths: imagePaths,
      userId: userId,
      remoteReportId: remoteReportId ?? this.remoteReportId,
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "data": data,
    "imagePaths": imagePaths,
    "userId": userId,
    "remoteReportId": remoteReportId,
  };

  factory OfflineReportPayload.fromJson(Map<String, dynamic> json) {
    return OfflineReportPayload(
      id: json["id"] as String,
      data: Map<String, dynamic>.from(json["data"] as Map),
      imagePaths: List<String>.from(json["imagePaths"] as List),
      userId: json["userId"] as String?,
      remoteReportId: json["remoteReportId"] as String?,
    );
  }
}

class OfflineService {
  OfflineService(this._reportService, this._storage, {this.onSynced});

  final ReportService _reportService;
  final SessionStorage _storage;

  /// Called after at least one queued report finished uploading.
  final VoidCallback? onSynced;

  static const String boxName = "offline_reports";
  bool _isSyncing = false;
  StreamSubscription<ConnectivityResult>? _connectivitySub;
  Timer? _retryTimer;
  static const Duration _retryInterval = Duration(seconds: 30);

  /// Persists the report and copies its images out of the picker's cache,
  /// which the OS may clear before connectivity returns.
  Future<void> queueReport({
    required Map<String, dynamic> data,
    required List<String> imagePaths,
    String? remoteReportId,
  }) async {
    final id = DateTime.now().microsecondsSinceEpoch.toString();
    final userJson = await _storage.readUserJson();
    final durablePaths = await _copyImages(id, imagePaths);

    await _save(
      OfflineReportPayload(
        id: id,
        data: data,
        imagePaths: durablePaths,
        userId: userJson?["id"]?.toString(),
        remoteReportId: remoteReportId,
      ),
    );
  }

  Future<void> _save(OfflineReportPayload payload) async {
    final box = await Hive.openBox<String>(boxName);
    await box.put(payload.id, jsonEncode(payload.toJson()));
  }

  Future<Directory> _reportDir(String id) async {
    final root = await getApplicationDocumentsDirectory();
    return Directory("${root.path}/offline_reports/$id");
  }

  Future<List<String>> _copyImages(String id, List<String> sourcePaths) async {
    final dir = await _reportDir(id);
    await dir.create(recursive: true);

    final copied = <String>[];
    for (var i = 0; i < sourcePaths.length; i++) {
      final source = sourcePaths[i];
      try {
        final name = source.split(Platform.pathSeparator).last;
        final target = "${dir.path}/${i}_$name";
        await File(source).copy(target);
        copied.add(target);
      } catch (e) {
        debugPrint("[OfflineService] Could not copy $source: $e");
        copied.add(source);
      }
    }
    return copied;
  }

  Future<List<OfflineReportPayload>> getQueuedReports() async {
    final box = await Hive.openBox<String>(boxName);
    final reports = <OfflineReportPayload>[];
    final keysToDelete = <dynamic>[];
    for (final key in box.keys) {
      final value = box.get(key);
      if (value != null) {
        try {
          reports.add(OfflineReportPayload.fromJson(jsonDecode(value)));
        } catch (e) {
          debugPrint(
            "[OfflineService] Deleting corrupted entry for key: $key ($e)",
          );
          keysToDelete.add(key);
        }
      }
    }
    if (keysToDelete.isNotEmpty) {
      await box.deleteAll(keysToDelete);
    }
    return reports;
  }

  Future<void> removeQueuedReport(String id) async {
    final box = await Hive.openBox<String>(boxName);
    await box.delete(id);
    try {
      final dir = await _reportDir(id);
      if (await dir.exists()) {
        await dir.delete(recursive: true);
      }
    } catch (e) {
      debugPrint("[OfflineService] Could not delete images for $id: $e");
    }
  }

  Future<void> syncOfflineReports() async {
    if (_isSyncing) return;

    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return;
    }

    final token = await _storage.readToken();
    if (token == null || token.isEmpty) {
      return;
    }
    final userId = (await _storage.readUserJson())?["id"]?.toString();

    _isSyncing = true;
    var uploaded = false;
    try {
      final reports = await getQueuedReports();
      for (final report in reports) {
        if (report.userId != null && report.userId != userId) continue;

        try {
          var current = report;
          if (current.remoteReportId == null) {
            final created = await _reportService.createReportFromData(
              current.data,
            );
            current = current.copyWith(remoteReportId: created.id);
            await _save(current);
          }

          await _reportService.uploadQueuedImages(
            reportId: current.remoteReportId!,
            imagePaths: current.imagePaths,
          );
          await removeQueuedReport(current.id);
          uploaded = true;
        } on ApiException catch (e) {
          debugPrint("[OfflineService] Failed to sync report ${report.id}: $e");
          // Offline again or signed out: the rest would fail the same way.
          if (e.isTimeoutOrNetworkError || e.statusCode == 401) break;
        } catch (e) {
          debugPrint("[OfflineService] Failed to sync report ${report.id}: $e");
        }
      }
    } finally {
      _isSyncing = false;
      if (uploaded) onSynced?.call();
    }
  }

  void startSyncListener() {
    _connectivitySub?.cancel();
    _connectivitySub = Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        syncOfflineReports();
      }
    });
    // Reports can also fail while online (e.g. a server error), which no
    // connectivity change would retry, so keep trying periodically.
    _retryTimer?.cancel();
    _retryTimer = Timer.periodic(_retryInterval, (_) => syncOfflineReports());
    // Flush anything queued before the app was last closed.
    syncOfflineReports();
  }
}

/// Bumped whenever queued reports finish uploading so lists can reload.
final reportsSyncedProvider = StateProvider<int>((ref) => 0);

/// Number of reports waiting to upload; updates live as the queue changes.
final pendingReportCountProvider = StreamProvider.autoDispose<int>((
  ref,
) async* {
  final box = await Hive.openBox<String>(OfflineService.boxName);
  yield box.length;
  await for (final _ in box.watch()) {
    yield box.length;
  }
});

final offlineServiceProvider = Provider<OfflineService>((ref) {
  return OfflineService(
    ref.watch(reportServiceProvider),
    ref.watch(sessionStorageProvider),
    onSynced: () => ref.read(reportsSyncedProvider.notifier).state++,
  );
});
