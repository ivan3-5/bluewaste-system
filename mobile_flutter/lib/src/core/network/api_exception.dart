import "package:dio/dio.dart";

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;

  static ApiException fromDioError(DioException error) {
    final response = error.response;
    final status = response?.statusCode;
    final payload = response?.data;

    String fallback = "Request failed. Please try again.";
    if (status != null) {
      fallback = "Request failed ($status).";
    }

    if (payload is Map<String, dynamic>) {
      dynamic raw = payload["message"] ?? payload["error"] ?? payload["detail"];
      if (raw is Map) {
        raw = raw["message"] ?? raw["error"] ?? raw["detail"];
      }
      if (raw is String && raw.trim().isNotEmpty) {
        return ApiException(raw.trim(), statusCode: status);
      }
    }

    if (error.message != null && error.message!.trim().isNotEmpty) {
      return ApiException(error.message!.trim(), statusCode: status);
    }

    return ApiException(fallback, statusCode: status);
  }
}
