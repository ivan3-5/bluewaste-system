import "dart:io";

import "package:dio/dio.dart";

import "../src/core/config/app_env.dart";

// ── Severity levels from the hybrid pipeline ────────────────────────────────
enum WasteSeverity {
  critical,
  high,
  moderate,
  spam,
  unknown;

  /// Parse the server string value (case-insensitive).
  static WasteSeverity fromString(String? value) {
    switch (value?.toUpperCase()) {
      case "CRITICAL":
        return WasteSeverity.critical;
      case "HIGH":
        return WasteSeverity.high;
      case "MODERATE":
        return WasteSeverity.moderate;
      case "SPAM":
        return WasteSeverity.spam;
      default:
        return WasteSeverity.unknown;
    }
  }

  String get label {
    switch (this) {
      case WasteSeverity.critical:
        return "Critical 🔴";
      case WasteSeverity.high:
        return "High 🟠";
      case WasteSeverity.moderate:
        return "Moderate 🟡";
      case WasteSeverity.spam:
        return "Spam ⚪";
      case WasteSeverity.unknown:
        return "Unknown";
    }
  }

  String get description {
    switch (this) {
      case WasteSeverity.critical:
        return "Immediate cleanup required!";
      case WasteSeverity.high:
        return "Schedule cleanup within 24 hours.";
      case WasteSeverity.moderate:
        return "Queued for cleanup.";
      case WasteSeverity.spam:
        return "Flagged for admin review.";
      case WasteSeverity.unknown:
        return "";
    }
  }

  String? get dbValue {
    switch (this) {
      case WasteSeverity.critical:
        return "CRITICAL";
      case WasteSeverity.high:
        return "HIGH";
      case WasteSeverity.moderate:
        return "MODERATE";
      case WasteSeverity.spam:
        return "SPAM";
      case WasteSeverity.unknown:
        return null;
    }
  }
}

// ── A single Cloud Vision label ──────────────────────────────────────────────
class WasteLabel {
  const WasteLabel({required this.label, required this.confidence});

  final String label;
  final double confidence; // 0.0 – 1.0

  factory WasteLabel.fromJson(Map<String, dynamic> json) {
    return WasteLabel(
      label: (json["label"] ?? "").toString(),
      confidence: (json["confidence"] as num?)?.toDouble() ?? 0.0,
    );
  }
}

/// Result from the FastAPI `/analyze` hybrid pipeline endpoint.
class DetectResult {
  const DetectResult({
    required this.hasWaste,
    required this.message,
    required this.confidence,
    required this.severity,
    required this.layer1Passed,
    this.labels = const [],
    this.allLabels = const [],
    this.spamReason,
  });

  /// Whether waste-related labels were detected.
  final bool hasWaste;

  /// Human-readable result string from the server.
  final String message;

  /// Top waste-label confidence as a fraction (0.0 – 1.0).
  final double confidence;

  /// Severity level determined by the pipeline.
  final WasteSeverity severity;

  /// Whether YOLOv8 (Layer 1) detected any object at all.
  final bool layer1Passed;

  /// Waste-matched Cloud Vision labels.
  final List<WasteLabel> labels;

  /// All Cloud Vision labels returned (for display).
  final List<WasteLabel> allLabels;

  /// Human-readable spam reason, if spam-flagged.
  final String? spamReason;

  /// Confidence as a percentage string, e.g. "87.3%"
  String get confidencePct =>
      "${(confidence * 100).toStringAsFixed(1)}%";

  factory DetectResult.fromJson(Map<String, dynamic> json) {
    List<WasteLabel> parseLabels(dynamic raw) {
      if (raw is! List) return const [];
      return raw
          .whereType<Map<String, dynamic>>()
          .map(WasteLabel.fromJson)
          .toList(growable: false);
    }

    return DetectResult(
      hasWaste: json["has_waste"] == true,
      message: (json["message"] ?? "").toString(),
      // Server returns 0.0–1.0 fraction from /analyze
      confidence: (json["confidence"] as num?)?.toDouble() ?? 0.0,
      severity: WasteSeverity.fromString(json["severity"]?.toString()),
      layer1Passed: json["layer1_passed"] != false,
      labels: parseLabels(json["labels"]),
      allLabels: parseLabels(json["all_labels"]),
      spamReason: json["spam_reason"]?.toString(),
    );
  }

  /// A sentinel "no detection run" result.
  factory DetectResult.unreachable() {
    return const DetectResult(
      hasWaste: false,
      message: "Detection server unreachable.",
      confidence: 0.0,
      severity: WasteSeverity.unknown,
      layer1Passed: false,
    );
  }

  /// Whether the result requires admin review (SPAM severity).
  bool get isSpam => severity == WasteSeverity.spam;
}

/// Thrown when the detection server cannot be reached (network/timeout).
class DetectServerUnreachableException implements Exception {
  const DetectServerUnreachableException(
      [this.message = "The YOLO detection server is unreachable."]);
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

/// HTTP client that calls the FastAPI `/analyze` hybrid endpoint.
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
        receiveTimeout: const Duration(seconds: 45),
        sendTimeout: const Duration(seconds: 30),
      ),
    );
  }

  Dio get _client => _dio ??= _buildDio();

  /// Sends [imageFile] to the `/analyze` endpoint and returns a [DetectResult].
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
        "/analyze",
        data: formData,
        options: Options(
          headers: {"Accept": "application/json"},
        ),
      );

      final body = response.data;
      if (body == null) {
        throw const DetectServerException(
            "Empty response from detection server.");
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
