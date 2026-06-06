import "dart:io";

import "package:dio/dio.dart";

import "../src/core/config/app_env.dart";

/// Result from the FastAPI `/detect` endpoint.
class DetectResult {
  const DetectResult({
    required this.hasWaste,
    required this.message,
    required this.confidence,
  });

  /// Whether at least one waste object was detected.
  final bool hasWaste;

  /// Human-readable result string from the server.
  final String message;

  /// Top detection confidence as a percentage (0.0 – 100.0).
  final double confidence;

  factory DetectResult.fromJson(Map<String, dynamic> json) {
    return DetectResult(
      hasWaste: json["has_waste"] == true,
      message: (json["message"] ?? "").toString(),
      confidence: (json["confidence"] as num?)?.toDouble() ?? 0.0,
    );
  }

  /// A sentinel "no detection run" result — used when the server is down and
  /// the user is blocked from submitting.
  factory DetectResult.unreachable() {
    return const DetectResult(
      hasWaste: false,
      message: "Detection server unreachable.",
      confidence: 0.0,
    );
  }
}

/// Thrown when the detection server cannot be reached (network/timeout).
class DetectServerUnreachableException implements Exception {
  const DetectServerUnreachableException([this.message = "The YOLO detection server is unreachable."]);
  final String message;
  @override
  String toString() => message;
}

/// Thrown when the server responds but with an error status.
class DetectServerException implements Exception {
  const DetectServerException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// HTTP client that calls the FastAPI `/detect` endpoint.
///
/// Usage:
/// ```dart
/// final result = await DetectService.instance.detect(imageFile);
/// if (result.hasWaste) { ... }
/// ```
class DetectService {
  DetectService._();
  static final DetectService instance = DetectService._();

  Dio? _dio;

  Dio _buildDio() {
    return Dio(
      BaseOptions(
        baseUrl: AppEnv.yoloBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
      ),
    );
  }

  Dio get _client => _dio ??= _buildDio();

  /// Sends [imageFile] to the `/detect` endpoint and returns a [DetectResult].
  ///
  /// Throws:
  ///   [DetectServerUnreachableException] — network error, server down, timeout
  ///   [DetectServerException]            — server returned an error response
  Future<DetectResult> detect(File imageFile) async {
    final filename = imageFile.path.split(Platform.pathSeparator).last;

    final formData = FormData.fromMap({
      "image": await MultipartFile.fromFile(
        imageFile.path,
        filename: filename,
      ),
    });

    try {
      final response = await _client.post<Map<String, dynamic>>(
        "/detect",
        data: formData,
        options: Options(
          headers: {"Accept": "application/json"},
        ),
      );

      final body = response.data;
      if (body == null) {
        throw const DetectServerException("Empty response from detection server.");
      }

      return DetectResult.fromJson(body);
    } on DioException catch (e) {
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          throw const DetectServerUnreachableException(
            "Detection timed out. Check your connection and that the YOLO server is running.",
          );
        case DioExceptionType.connectionError:
          throw const DetectServerUnreachableException(
            "Cannot reach the YOLO detection server. Make sure it is running.",
          );
        case DioExceptionType.badResponse:
          final status = e.response?.statusCode ?? 0;
          final detail = _extractDetail(e.response?.data);
          if (status == 503) {
            throw DetectServerException(
              "Detection model not ready (503). $detail",
            );
          }
          throw DetectServerException(
            "Detection server error ($status): $detail",
          );
        default:
          throw DetectServerUnreachableException(
            "Unexpected network error: ${e.message}",
          );
      }
    } catch (e) {
      if (e is DetectServerUnreachableException || e is DetectServerException) {
        rethrow;
      }
      throw DetectServerException("Detection failed: $e");
    }
  }

  static String _extractDetail(dynamic data) {
    if (data is Map) {
      return (data["detail"] ?? data["message"] ?? data["error"] ?? "")
          .toString();
    }
    if (data is String) return data;
    return "";
  }
}
