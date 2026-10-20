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

  Future<ReportRecord> createReportFromData(Map<String, dynamic> data) {
    return createReport(
      title: data["title"] as String,
      description: data["description"] as String,
      category: data["category"] as String,
      latitude: (data["latitude"] as num).toDouble(),
      longitude: (data["longitude"] as num).toDouble(),
      address: data["address"] as String?,
      isAnonymous: data["isAnonymous"] as bool? ?? false,
      isSpamFlagged: data["isSpamFlagged"] as bool? ?? false,
      spamReason: data["spamReason"] as String?,
      severity: data["severity"] as String?,
      analysisStatus: data["analysisStatus"] as String?,
      analysisConfidence: (data["analysisConfidence"] as num?)?.toDouble(),
      analysisWasteCount: data["analysisWasteCount"] as int?,
      aiModel: data["aiModel"] as String?,
      aiCategories: (data["aiCategories"] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList(),
      aiReason: data["aiReason"] as String?,
    );
  }

  Future<void> uploadQueuedImages({
    required String reportId,
    required List<String> imagePaths,
  }) {
    return uploadReportImages(
      reportId: reportId,
      images: imagePaths.map(XFile.new).toList(),
    );
  }

  Future<ReportRecord> getReportById(String reportId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        "/reports/$reportId",
      );
      return ReportRecord.fromJson(response.data ?? <String, dynamic>{});
    } on DioException catch (error) {
      throw ApiException.fromDioError(error);
    }
  }

  /// Returns null when the report was queued for upload instead of sent.
  Future<ReportRecord?> submitFullReport({
    required Map<String, dynamic> data,
    required List<XFile> images,
    required OfflineService offlineService,
  }) async {
    final imagePaths = images.map((e) => e.path).toList();

    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      await offlineService.queueReport(data: data, imagePaths: imagePaths);
      return null;
    }

    ReportRecord? created;
    var uploaded = 0;
    try {
      created = await createReportFromData(data);
      // One image per request so a failure part-way keeps what already landed.
      for (final image in images) {
        await uploadReportImages(reportId: created.id, images: [image]);
        uploaded++;
      }
      return created;
    } on ApiException catch (e) {
      final reportExists = created != null;
      if (e.isTimeoutOrNetworkError || reportExists) {
        // Keep the server-side id and progress so the retry only finishes
        // what is missing instead of creating a duplicate report.
        await offlineService.queueReport(
          data: data,
          imagePaths: imagePaths,
          remoteReportId: created?.id,
          uploadedCount: uploaded,
          maybeCreated: created == null,
          lastError: e.message,
        );
        return null;
      }
      rethrow;
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
    String? severity,
    String? analysisStatus,
    double? analysisConfidence,
    int? analysisWasteCount,
    String? aiModel,
    List<String>? aiCategories,
    String? aiReason,
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
          if (address != null) "address": address,
          "isAnonymous": isAnonymous,
          // AI detection spam-flag fields
          if (isSpamFlagged) "isSpamFlagged": true,
          if (isSpamFlagged && spamReason != null) "spamReason": spamReason,
          if (severity != null) "severity": severity,
          if (analysisStatus != null) "analysisStatus": analysisStatus,
          if (analysisConfidence != null)
            "analysisConfidence": analysisConfidence,
          if (analysisWasteCount != null)
            "analysisWasteCount": analysisWasteCount,
          if (aiModel != null) "aiModel": aiModel,
          if (aiCategories != null) "aiCategories": aiCategories,
          if (aiReason != null) "aiReason": aiReason,
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
          (img) => MultipartFile.fromFile(img.path, filename: img.name),
        ),
      );

      final formData = FormData.fromMap({"images": parts, "type": type});

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

  /// Fetches grouped incident map data from `GET /reports/incidents/map`.
  /// Returns one [IncidentMapData] per `WasteIncident`, with contributor count
  /// and merged report IDs — the same data the web admin map uses.
  Future<List<IncidentMapData>> getIncidentMapData({
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
        "/reports/incidents/map",
        queryParameters: queryParameters,
      );

      final payload = response.data;
      if (payload is List) {
        return payload
            .whereType<Map<String, dynamic>>()
            .map(IncidentMapData.fromJson)
            .toList(growable: false);
      }
      return const [];
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
        data: {"status": status, "notes": notes},
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
