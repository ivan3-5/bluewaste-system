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
import "../domain/report_models.dart";
import "report_service.dart";

class OfflineReportPayload {
  OfflineReportPayload({
    required this.id,
    required this.data,
    required this.imagePaths,
    this.userId,
    this.remoteReportId,
    this.uploadedCount = 0,
    this.attempts = 0,
    this.maybeCreated = false,
    this.failed = false,
    this.lastError,
  });

  final String id;
  final Map<String, dynamic> data;
  final List<String> imagePaths;

  /// Owner of the report; entries are only synced for the signed-in user.
  final String? userId;

  /// Set once the report exists on the server, so a retry only uploads images.
  final String? remoteReportId;

  /// Images (in order) already stored on the server, so a retry resumes
  /// instead of uploading duplicates.
  final int uploadedCount;

  /// Failed attempts that were not plain connectivity problems.
  final int attempts;

  /// A create request was sent but its response never arrived, so the report
  /// may already exist on the server.
  final bool maybeCreated;

  /// Gave up retrying; kept so the user can retry or discard it.
  final bool failed;

  final String? lastError;

  OfflineReportPayload copyWith({
    String? remoteReportId,
    List<String>? imagePaths,
    int? uploadedCount,
    int? attempts,
    bool? maybeCreated,
    bool? failed,
    String? lastError,
    bool clearError = false,
  }) {
    return OfflineReportPayload(
      id: id,
      data: data,
      imagePaths: imagePaths ?? this.imagePaths,
      userId: userId,
      remoteReportId: remoteReportId ?? this.remoteReportId,
      uploadedCount: uploadedCount ?? this.uploadedCount,
      attempts: attempts ?? this.attempts,
      maybeCreated: maybeCreated ?? this.maybeCreated,
      failed: failed ?? this.failed,
      lastError: clearError ? null : (lastError ?? this.lastError),
    );
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "data": data,
    "imagePaths": imagePaths,
    "userId": userId,
    "remoteReportId": remoteReportId,
    "uploadedCount": uploadedCount,
    "attempts": attempts,
    "maybeCreated": maybeCreated,
    "failed": failed,
    "lastError": lastError,
  };

  factory OfflineReportPayload.fromJson(Map<String, dynamic> json) {
    return OfflineReportPayload(
      id: json["id"] as String,
      data: Map<String, dynamic>.from(json["data"] as Map),
      imagePaths: List<String>.from(json["imagePaths"] as List),
      userId: json["userId"] as String?,
      remoteReportId: json["remoteReportId"] as String?,
      uploadedCount: json["uploadedCount"] as int? ?? 0,
      attempts: json["attempts"] as int? ?? 0,
      maybeCreated: json["maybeCreated"] as bool? ?? false,
      failed: json["failed"] as bool? ?? false,
      lastError: json["lastError"] as String?,
    );
  }
}

/// Outcome of one sync pass, used to give the user feedback.
class SyncResult {
  const SyncResult({
    this.uploaded = 0,
    this.failed = 0,
    this.remaining = 0,
    this.lastError,
    this.offline = false,
  });

  final int uploaded;
  final int failed;
  final int remaining;
  final String? lastError;
  final bool offline;
}

/// Live counts of the offline queue for the UI.
class QueueSummary {
  const QueueSummary({this.pending = 0, this.failed = 0, this.lastError});

  final int pending;
  final int failed;
  final String? lastError;

  int get total => pending + failed;
}

class OfflineService {
  OfflineService(this._reportService, this._storage, {this.onSynced});

  final ReportService _reportService;
  final SessionStorage _storage;

  /// Called after at least one queued report finished uploading.
  final VoidCallback? onSynced;

  static const String boxName = "offline_reports";
  Future<SyncResult>? _inFlight;
  StreamSubscription<ConnectivityResult>? _connectivitySub;
  Timer? _retryTimer;
  static const Duration _retryInterval = Duration(seconds: 30);

  /// Persists the report and copies its images out of the picker's cache,
  /// which the OS may clear before connectivity returns.
  Future<void> queueReport({
    required Map<String, dynamic> data,
    required List<String> imagePaths,
    String? remoteReportId,
    int uploadedCount = 0,
    bool maybeCreated = false,
    String? lastError,
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
        uploadedCount: uploadedCount,
        maybeCreated: maybeCreated,
        lastError: lastError,
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

  /// Removes a queued report and its copied images from this phone.
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

  /// Deletes image folders that no longer belong to a queued report.
  Future<void> _purgeOrphanedImages() async {
    try {
      final box = await Hive.openBox<String>(boxName);
      final root = await getApplicationDocumentsDirectory();
      final base = Directory("${root.path}/offline_reports");
      if (!await base.exists()) return;

      final keep = box.keys.map((k) => k.toString()).toSet();
      await for (final entity in base.list()) {
        if (entity is! Directory) continue;
        final name = entity.path.split(Platform.pathSeparator).last;
        if (!keep.contains(name)) {
          await entity.delete(recursive: true);
        }
      }
    } catch (e) {
      debugPrint("[OfflineService] Could not purge orphaned images: $e");
    }
  }

  /// Puts every failed report back in the queue and syncs again.
  Future<SyncResult> retryFailed() async {
    for (final report in await getQueuedReports()) {
      if (report.failed) {
        await _save(
          report.copyWith(failed: false, attempts: 0, clearError: true),
        );
      }
    }
    return syncOfflineReports();
  }

  /// Discards reports that could not be uploaded.
  Future<void> discardFailed() async {
    for (final report in await getQueuedReports()) {
      if (report.failed) await removeQueuedReport(report.id);
    }
  }

  static const int _maxAttempts = 6;

  /// Worth retrying later: connectivity problems, server errors, auth refresh.
  bool _isTransient(ApiException e) {
    final status = e.statusCode ?? 0;
    return e.isTimeoutOrNetworkError ||
        status >= 500 ||
        status == 401 ||
        status == 408 ||
        status == 429;
  }

  /// Finds a report the server already created for [payload] when the create
  /// response was lost, so a retry doesn't submit a duplicate.
  Future<ReportRecord?> _findExistingReport(
    OfflineReportPayload payload,
  ) async {
    final queuedAt = DateTime.fromMicrosecondsSinceEpoch(
      int.tryParse(payload.id) ?? 0,
    );
    final recent = await _reportService.getMyReports(page: 1, limit: 20);
    for (final report in recent.data) {
      final sameSpot =
          (report.latitude - (payload.data["latitude"] as num)).abs() < 1e-6 &&
          (report.longitude - (payload.data["longitude"] as num)).abs() < 1e-6;
      if (sameSpot &&
          report.createdAt.isAfter(
            queuedAt.subtract(const Duration(minutes: 5)),
          )) {
        return report;
      }
    }
    return null;
  }

  /// Uploads queued reports. Concurrent calls share one pass, so the result is
  /// always returned to whoever asked (e.g. the "Sync now" button).
  Future<SyncResult> syncOfflineReports() {
    return _inFlight ??= _runSync().whenComplete(() => _inFlight = null);
  }

  Future<SyncResult> _runSync() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return const SyncResult(offline: true);
    }

    final token = await _storage.readToken();
    if (token == null || token.isEmpty) return const SyncResult();
    final userId = (await _storage.readUserJson())?["id"]?.toString();

    var uploaded = 0;
    String? lastError;
    try {
      await _purgeOrphanedImages();

      for (final queued in await getQueuedReports()) {
        if (queued.failed) continue;
        if (queued.userId != null && queued.userId != userId) continue;

        var current = queued;
        try {
          // 1. Make sure the report exists on the server.
          if (current.remoteReportId == null) {
            final existing = current.maybeCreated
                ? await _findExistingReport(current)
                : null;
            final id =
                existing?.id ??
                (await _reportService.createReportFromData(current.data)).id;
            current = current.copyWith(remoteReportId: id, maybeCreated: false);
            await _save(current);
          }

          // 2. Upload images one at a time, saving progress after each so a
          // retry resumes instead of re-uploading.
          while (current.uploadedCount < current.imagePaths.length) {
            final path = current.imagePaths[current.uploadedCount];
            if (!await File(path).exists()) {
              // Image is gone (cache cleared); don't block the report on it.
              final remaining = [...current.imagePaths]
                ..removeAt(current.uploadedCount);
              current = current.copyWith(imagePaths: remaining);
              await _save(current);
              continue;
            }
            await _reportService.uploadQueuedImages(
              reportId: current.remoteReportId!,
              imagePaths: [path],
            );
            current = current.copyWith(
              uploadedCount: current.uploadedCount + 1,
            );
            await _save(current);
          }

          // 3. Confirm with the server before clearing the local copy.
          final remote = await _reportService.getReportById(
            current.remoteReportId!,
          );
          final storedImages = remote.images
              .where((image) => image.type != "CLEANUP")
              .length;
          if (storedImages < current.imagePaths.length) {
            current = current.copyWith(
              uploadedCount: storedImages,
              lastError: "Server is missing some photos; retrying.",
            );
            await _save(current);
            lastError = current.lastError;
            continue;
          }

          await removeQueuedReport(current.id);
          uploaded++;
        } on ApiException catch (e) {
          debugPrint("[OfflineService] Failed to sync ${current.id}: $e");
          lastError = e.message;
          final offline = e.isTimeoutOrNetworkError || e.statusCode == 401;
          final attempts = offline ? current.attempts : current.attempts + 1;
          final giveUp = !_isTransient(e) || attempts >= _maxAttempts;
          await _save(
            current.copyWith(
              attempts: attempts,
              failed: giveUp,
              lastError: e.message,
              // Unknown whether the create call reached the server.
              maybeCreated: current.remoteReportId == null
                  ? e.isTimeoutOrNetworkError || current.maybeCreated
                  : false,
            ),
          );
          // Offline again or signed out: the rest would fail the same way.
          if (offline) break;
        } catch (e) {
          debugPrint("[OfflineService] Failed to sync ${current.id}: $e");
          lastError = e.toString();
          final attempts = current.attempts + 1;
          await _save(
            current.copyWith(
              attempts: attempts,
              failed: attempts >= _maxAttempts,
              lastError: e.toString(),
            ),
          );
        }
      }
    } finally {
      if (uploaded > 0) onSynced?.call();
    }

    final summary = await queueSummary();
    return SyncResult(
      uploaded: uploaded,
      failed: summary.failed,
      remaining: summary.pending,
      lastError: lastError ?? summary.lastError,
    );
  }

  Future<QueueSummary> queueSummary() async {
    final reports = await getQueuedReports();
    final failed = reports.where((r) => r.failed).toList();
    return QueueSummary(
      pending: reports.length - failed.length,
      failed: failed.length,
      lastError: failed.isEmpty ? null : failed.last.lastError,
    );
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

/// Live counts of the offline queue; updates as the queue changes.
final queueSummaryProvider = StreamProvider.autoDispose<QueueSummary>((
  ref,
) async* {
  final service = ref.watch(offlineServiceProvider);
  final box = await Hive.openBox<String>(OfflineService.boxName);
  yield await service.queueSummary();
  await for (final _ in box.watch()) {
    yield await service.queueSummary();
  }
});

final offlineServiceProvider = Provider<OfflineService>((ref) {
  return OfflineService(
    ref.watch(reportServiceProvider),
    ref.watch(sessionStorageProvider),
    onSynced: () => ref.read(reportsSyncedProvider.notifier).state++,
  );
});
