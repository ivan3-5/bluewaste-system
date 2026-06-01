import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:image_picker/image_picker.dart";

import "../../../core/network/api_exception.dart";
import "../../../core/providers.dart";
import "../domain/report_models.dart";

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

  Future<ReportRecord> createReport({
    required String title,
    required String description,
    required String category,
    required double latitude,
    required double longitude,
    String? address,
    bool isAnonymous = false,
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
