import "package:dio/dio.dart";

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.isTimeoutOrNetworkError = false});

  final String message;
  final int? statusCode;
  final bool isTimeoutOrNetworkError;

  @override
  String toString() => message;

  static ApiException fromDioError(DioException error) {
    final isTimeoutOrNetwork = error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.unknown;

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
        String msg = raw.trim();
        final details = payload["details"] ?? payload["errors"];
        if (details is List && details.isNotEmpty) {
          final detailStr = details
              .whereType<Map>()
              .map((e) => "${e['field']}: ${e['message']}")
              .join("; ");
          if (detailStr.isNotEmpty) {
            msg = "$msg — $detailStr";
          }
        }
        return ApiException(msg, statusCode: status, isTimeoutOrNetworkError: isTimeoutOrNetwork);
      }
    }

    if (error.message != null && error.message!.trim().isNotEmpty) {
      return ApiException(
        error.message!.trim(),
        statusCode: status,
        isTimeoutOrNetworkError: isTimeoutOrNetwork,
      );
    }

    return ApiException(
      fallback,
      statusCode: status,
      isTimeoutOrNetworkError: isTimeoutOrNetwork,
    );
  }
}
