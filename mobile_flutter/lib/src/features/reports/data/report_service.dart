import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:image_picker/image_picker.dart";

import "package:connectivity_plus/connectivity_plus.dart";

import "../../../core/network/api_exception.dart";
import "../../../core/providers.dart";
import "../domain/report_models.dart";
import "offline_service.dart";

class ReportService {
  ReportService(this._dio);

  final Dio _dio;

  bool _shouldTryLegacyRoute(DioException error) {
    final status = error.response?.statusCode;
    return status == 404 || status == 405;
  }

  PaginatedData<ReportRecord> _parsePaginatedReports(dynamic payload) {
    if (payload is Map<String, dynamic>) {
      return parsePaginatedData<ReportRecord>(payload, ReportRecord.fromJson);
    }

    // Some deployments return a bare list for legacy endpoints.
    if (payload is List) {
      final rows = payload
          .whereType<Map<String, dynamic>>()
          .map(ReportRecord.fromJson)
          .toList(growable: false);
      return PaginatedData<ReportRecord>(
        data: rows,
        pagination: PaginationMeta(
          page: 1,
          limit: rows.length,
          total: rows.length,
          totalPages: rows.isEmpty ? 0 : 1,
        ),
      );
    }

    return const PaginatedData<ReportRecord>(
      data: [],
      pagination: PaginationMeta(page: 1, limit: 20, total: 0, totalPages: 0),
    );
  }

  List<ReportRecord> _parseMapRows(dynamic payload) {
    if (payload is List) {
      return payload
          .whereType<Map<String, dynamic>>()
          .map(ReportRecord.fromJson)
          .toList(growable: false);
    }

    if (payload is Map<String, dynamic>) {
      final rows = payload["data"];
      if (rows is List) {
        return rows
            .whereType<Map<String, dynamic>>()
            .map(ReportRecord.fromJson)
            .toList(growable: false);
      }
    }

    return const [];
  }

  Future<void> createReportFromOffline(Map<String, dynamic> data, List<String> imagePaths) async {
    final report = await createReport(
      title: data["title"] as String,
      description: data["description"] as String,
      category: data["category"] as String,
      latitude: (data["latitude"] as num).toDouble(),
      longitude: (data["longitude"] as num).toDouble(),
      address: data["address"] as String?,
      isAnonymous: data["isAnonymous"] as bool? ?? false,
      isSpamFlagged: data["isSpamFlagged"] as bool? ?? false,
      spamReason: data["spamReason"] as String?,
      yoloConfidence: (data["yoloConfidence"] as num?)?.toDouble() ?? 0.0,
      severity: data["severity"] as String?,
      analysisStatus: data["analysisStatus"] as String?,
      analysisConfidence: (data["analysisConfidence"] as num?)?.toDouble(),
      analysisWasteCount: data["analysisWasteCount"] as int?,
    );

    if (imagePaths.isNotEmpty) {
      final xfiles = imagePaths.map((p) => XFile(p)).toList();
      await uploadReportImages(reportId: report.id, images: xfiles);
    }
  }

  Future<ReportRecord?> submitFullReport({
    required Map<String, dynamic> data,
    required List<XFile> images,
    required OfflineService offlineService,
  }) async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      final payload = OfflineReportPayload(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        data: data,
        imagePaths: images.map((e) => e.path).toList(),
      );
      await offlineService.queueReport(payload);
      return null; // Indicates it was queued offline
    }

    try {
      final report = await createReport(
        title: data["title"] as String,
        description: data["description"] as String,
        category: data["category"] as String,
        latitude: (data["latitude"] as num).toDouble(),
        longitude: (data["longitude"] as num).toDouble(),
        address: data["address"] as String?,
        isAnonymous: data["isAnonymous"] as bool? ?? false,
        isSpamFlagged: data["isSpamFlagged"] as bool? ?? false,
        spamReason: data["spamReason"] as String?,
        yoloConfidence: (data["yoloConfidence"] as num?)?.toDouble() ?? 0.0,
        severity: data["severity"] as String?,
        analysisStatus: data["analysisStatus"] as String?,
        analysisConfidence: (data["analysisConfidence"] as num?)?.toDouble(),
        analysisWasteCount: data["analysisWasteCount"] as int?,
      );

      if (images.isNotEmpty) {
        await uploadReportImages(reportId: report.id, images: images);
      }
      return report;
    } on DioException catch (e) {
      // If it's a network error during submission, queue it instead of failing
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.unknown) {
        final payload = OfflineReportPayload(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          data: data,
          imagePaths: images.map((img) => img.path).toList(),
        );
        await offlineService.queueReport(payload);
        return null;
      }
      throw ApiException.fromDioError(e);
    }
  }

  Future<ReportRecord> createReport({
    required String title,
    required String description,
    required String category,
    required double latitude,
    required double longitude,
    String? address,
    bool isAnonymous = false,
    bool isSpamFlagged = false,
    String? spamReason,
    double yoloConfidence = 0.0,
    String? severity,
    String? analysisStatus,
    double? analysisConfidence,
    int? analysisWasteCount,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        "/reports",
        data: {
          "title": title,
          "description": description,
          "category": category,
          "latitude": latitude,
          "longitude": longitude,
          "address": address,
          "isAnonymous": isAnonymous,
          // YOLO detection spam-flag fields
          if (isSpamFlagged) "isSpamFlagged": true,
          if (isSpamFlagged && spamReason != null) "spamReason": spamReason,
          "yoloConfidence": yoloConfidence,
          if (severity != null) "severity": severity,
          if (analysisStatus != null) "analysisStatus": analysisStatus,
          if (analysisConfidence != null) "analysisConfidence": analysisConfidence,
          if (analysisWasteCount != null) "analysisWasteCount": analysisWasteCount,
        },
      );

      return ReportRecord.fromJson(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw ApiException.fromDioError(error);
    }
  }

  Future<void> uploadReportImages({
    required String reportId,
    required List<XFile> images,
    String type = "REPORT",
  }) async {
    if (images.isEmpty) {
      return;
    }

    try {
      final parts = await Future.wait(
        images.map(
          (img) => MultipartFile.fromFile(
            img.path,
            filename: img.name,
          ),
        ),
      );

      final formData = FormData.fromMap({
        "images": parts,
        "type": type,
      });

      await _dio.post<void>(
        "/reports/$reportId/images",
        data: formData,
        options: Options(headers: {"Content-Type": "multipart/form-data"}),
      );
    } on DioException catch (error) {
      throw ApiException.fromDioError(error);
    }
  }

  Future<PaginatedData<ReportRecord>> getMyReports({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final queryParameters = {
      "page": page,
      "limit": limit,
      if (status != null && status.isNotEmpty) "status": status,
    };

    try {
      final response = await _dio.get<dynamic>(
        "/reports/my-reports",
        queryParameters: queryParameters,
      );

      return _parsePaginatedReports(response.data);
    } on DioException catch (error) {
      if (_shouldTryLegacyRoute(error)) {
        try {
          final legacy = await _dio.get<dynamic>(
            "/waste-reports/my-reports",
            queryParameters: queryParameters,
          );
          return _parsePaginatedReports(legacy.data);
        } on DioException catch (legacyError) {
          throw ApiException.fromDioError(legacyError);
        }
      }
      throw ApiException.fromDioError(error);
    }
  }

  Future<PaginatedData<ReportRecord>> getAssignedReports({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        "/reports/assigned",
        queryParameters: {
          "page": page,
          "limit": limit,
          if (status != null && status.isNotEmpty) "status": status,
        },
      );

      return parsePaginatedData<ReportRecord>(
        response.data ?? <String, dynamic>{},
        ReportRecord.fromJson,
      );
    } on DioException catch (error) {
      throw ApiException.fromDioError(error);
    }
  }

  Future<List<ReportRecord>> getMapReports({
    int limit = 2000,
    String? status,
    String? category,
  }) async {
    final queryParameters = {
      "limit": limit,
      if (status != null && status.isNotEmpty) "status": status,
      if (category != null && category.isNotEmpty) "category": category,
    };

    try {
      final response = await _dio.get<dynamic>(
        "/reports/map",
        queryParameters: queryParameters,
      );

      return _parseMapRows(response.data);
    } on DioException catch (error) {
      if (_shouldTryLegacyRoute(error)) {
        try {
          final legacy = await _dio.get<dynamic>(
            "/waste-reports/map",
            queryParameters: queryParameters,
          );
          return _parseMapRows(legacy.data);
        } on DioException catch (legacyError) {
          throw ApiException.fromDioError(legacyError);
        }
      }
      throw ApiException.fromDioError(error);
    }
  }

  Future<ReportRecord> updateStatus({
    required String reportId,
    required String status,
    String? notes,
  }) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        "/reports/$reportId/status",
        data: {
          "status": status,
          "notes": notes,
        },
      );

      return ReportRecord.fromJson(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw ApiException.fromDioError(error);
    }
  }
}

final reportServiceProvider = Provider<ReportService>((ref) {
  return ReportService(ref.watch(dioProvider));
});
