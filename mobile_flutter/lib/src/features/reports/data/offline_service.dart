import "dart:convert";
import "package:flutter/foundation.dart";
import "package:hive/hive.dart";
import "package:connectivity_plus/connectivity_plus.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "report_service.dart";

class OfflineReportPayload {
  OfflineReportPayload({
    required this.id,
    required this.data,
    required this.imagePaths,
  });

  final String id;
  final Map<String, dynamic> data;
  final List<String> imagePaths;

  Map<String, dynamic> toJson() => {
        "id": id,
        "data": data,
        "imagePaths": imagePaths,
      };

  factory OfflineReportPayload.fromJson(Map<String, dynamic> json) {
    return OfflineReportPayload(
      id: json["id"] as String,
      data: Map<String, dynamic>.from(json["data"] as Map),
      imagePaths: List<String>.from(json["imagePaths"] as List),
    );
  }
}

class OfflineService {
  OfflineService(this._reportService);

  final ReportService _reportService;
  static const String boxName = "offline_reports";
  bool _isSyncing = false;

  Future<void> queueReport(OfflineReportPayload payload) async {
    final box = await Hive.openBox<String>(boxName);
    await box.put(payload.id, jsonEncode(payload.toJson()));
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
          debugPrint("[OfflineService] Deleting corrupted entry for key: $key ($e)");
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
  }

  Future<void> syncOfflineReports() async {
    if (_isSyncing) return;

    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return;
    }

    _isSyncing = true;
    try {
      final reports = await getQueuedReports();
      for (final report in reports) {
        try {
          await _reportService.createReportFromOffline(
            report.data,
            report.imagePaths,
          );
          await removeQueuedReport(report.id);
        } catch (e) {
          debugPrint("[OfflineService] Failed to sync report ${report.id}: $e");
          // If a single report fails, keep it in the queue and try the rest.
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  void startSyncListener() {
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        syncOfflineReports();
      }
    });
  }
}

final offlineServiceProvider = Provider<OfflineService>((ref) {
  final reportService = ref.watch(reportServiceProvider);
  return OfflineService(reportService);
});
