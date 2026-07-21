import "dart:io";

import "package:dio/dio.dart";

import "../../../core/network/api_exception.dart";
import "../domain/report_models.dart";

// ── Severity levels from the AI pipeline ────────────────────────────────────
enum WasteSeverity {
  critical,
  high,
  moderate,
  low,
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
      case "MEDIUM":
        return WasteSeverity.moderate;
      case "LOW":
        return WasteSeverity.low;
      case "SPAM":
      case "NONE":
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
      case WasteSeverity.low:
        return "Low 🟢";
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
      case WasteSeverity.low:
        return "Minor cleanup required.";
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
      case WasteSeverity.low:
        return "MODERATE";
      case WasteSeverity.spam:
        return "SPAM";
      case WasteSeverity.unknown:
        return null;
    }
  }
}

// ── A single label item ─────────────────────────────────────────────────────
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

/// Result from the backend `/ai/analyze-report` Gemini Vision endpoint.
/// Note: Unlike legacy edge inference models, Gemini returns overall category classifications
/// without spatial bounding-box coordinates or real-time camera overlays.
class DetectResult {
  const DetectResult({
    required this.hasWaste,
    required this.message,
    required this.confidence,
    required this.severity,
    required this.layer1Passed,
    this.categories = const [],
    this.labels = const [],
    this.allLabels = const [],
    this.spamReason,
    this.reason,
    this.reportId,
    this.imageUrl,
    this.status,
  });

  /// Whether waste-related categories were detected.
  final bool hasWaste;

  /// Human-readable result or reason string from the server.
  final String message;

  /// Overall AI confidence as a fraction (0.0 – 1.0).
  final double confidence;

  /// Severity level determined by Gemini Vision.
  final WasteSeverity severity;

  /// Whether AI detection passed cleanly.
  final bool layer1Passed;

  /// Detected waste category identifiers from Gemini.
  final List<String> categories;

  /// Mapped display labels for cards and lists.
  final List<WasteLabel> labels;

  /// All labels returned (for display).
  final List<WasteLabel> allLabels;

  /// Human-readable spam reason, if spam-flagged.
  final String? spamReason;

  /// Detailed reasoning provided by Gemini Vision.
  final String? reason;

  /// Server-generated report draft ID if returned during analysis.
  final String? reportId;

  /// Uploaded Cloudinary image URL if returned during analysis.
  final String? imageUrl;

  /// Initial report status assigned by the backend.
  final String? status;

  /// Confidence as a percentage string, e.g. "87.3%"
  String get confidencePct =>
      "${(confidence <= 1.0 ? confidence * 100 : confidence).toStringAsFixed(1)}%";

  factory DetectResult.fromJson(Map<String, dynamic> json) {
    final categoriesList = (json["categories"] is List)
        ? (json["categories"] as List)
            .map((e) => e.toString())
            .toList(growable: false)
        : (json["labels"] is List &&
                json["labels"].isNotEmpty &&
                json["labels"].first is String)
            ? (json["labels"] as List)
                .map((e) => e.toString())
                .toList(growable: false)
            : <String>[];

    final confidenceVal = (json["confidence"] as num?)?.toDouble() ?? 0.0;

    List<WasteLabel> parseLabels(dynamic raw) {
      if (raw is List && raw.isNotEmpty && raw.first is Map) {
        return raw
            .whereType<Map<String, dynamic>>()
            .map(WasteLabel.fromJson)
            .toList(growable: false);
      }
      return categoriesList
          .map((cat) => WasteLabel(
                label: wasteCategoryLabels[cat] ?? cat,
                confidence: confidenceVal,
              ))
          .toList(growable: false);
    }

    final reasonStr = (json["reason"] ?? json["message"] ?? "").toString();
    final hasWasteVal = json["hasWaste"] == true || json["has_waste"] == true;

    return DetectResult(
      hasWaste: hasWasteVal,
      message: reasonStr,
      confidence: confidenceVal,
      severity: WasteSeverity.fromString(json["severity"]?.toString()),
      layer1Passed: json["layer1_passed"] != false && json["layer1Passed"] != false,
      categories: categoriesList,
      labels: parseLabels(json["labels"] ?? json["categories"]),
      allLabels: parseLabels(json["all_labels"] ?? json["categories"]),
      spamReason: (json["spamReason"] ?? json["spam_reason"])?.toString() ??
          (!hasWasteVal ? "No visible waste detected in photo" : null),
      reason: reasonStr,
      reportId: json["reportId"]?.toString(),
      imageUrl: json["imageUrl"]?.toString(),
      status: json["status"]?.toString(),
    );
  }

  /// A sentinel "no detection run" result.
  factory DetectResult.unreachable() {
    return const DetectResult(
      hasWaste: false,
      message: "Photo analysis service unreachable.",
      confidence: 0.0,
      severity: WasteSeverity.unknown,
      layer1Passed: false,
    );
  }

  /// Whether the result requires admin review (SPAM severity).
  bool get isSpam => severity == WasteSeverity.spam;
}

/// Thrown when the AI server cannot be reached (network/timeout).
class DetectServerUnreachableException extends ApiException {
  DetectServerUnreachableException(
      [super.message = "The detection service is unreachable."]);
}

/// Thrown when the AI server responds with an error status.
class DetectServerException extends ApiException {
  DetectServerException(super.message, [int? statusCode])
      : super(statusCode: statusCode);
}

/// HTTP client that calls the backend `/ai/analyze-report` endpoint.
///
/// Usage:
/// ```dart
/// final detectService = ref.read(detectServiceProvider);
/// final result = await detectService.detect(imageFile: file, latitude: lat, longitude: lng);
/// if (result.hasWaste) { ... }
/// ```
class DetectService {
  DetectService(this._dio);

  final Dio _dio;

  /// Sends [imageFile] along with geolocation and metadata to `/ai/analyze-report`
  /// and returns a [DetectResult].
  ///
  /// Throws:
  ///   [DetectServerUnreachableException] — network error, server down, timeout
  ///   [ApiException]                     — server returned an error response
  Future<DetectResult> detect({
    required File imageFile,
    required double latitude,
    required double longitude,
    String? description,
    String? citizenId,
  }) async {
    final filename = imageFile.path.split(Platform.pathSeparator).last;

    final formData = FormData.fromMap({
      "image": await MultipartFile.fromFile(
        imageFile.path,
        filename: filename,
      ),
      "latitude": latitude.toString(),
      "longitude": longitude.toString(),
      if (description != null && description.trim().isNotEmpty)
        "description": description.trim(),
      if (citizenId != null && citizenId.trim().isNotEmpty)
        "citizenId": citizenId.trim(),
    });

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        "/ai/analyze-report",
        data: formData,
        options: Options(
          headers: {"Accept": "application/json"},
        ),
      );

      final body = response.data;
      if (body == null) {
        throw DetectServerException(
            "Empty response from detection service.");
      }

      return DetectResult.fromJson(body);
    } on DioException catch (e) {
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          throw DetectServerUnreachableException(
            "Photo analysis timed out. Please check your network connection.",
          );
        case DioExceptionType.connectionError:
          throw DetectServerUnreachableException(
            "Cannot reach the analysis service. Please verify your connection.",
          );
        case DioExceptionType.badResponse:
          final status = e.response?.statusCode ?? 0;
          final detail = _extractDetail(e.response?.data);
          if (status == 503) {
            throw DetectServerException(
              "Photo analysis service is not ready (503). $detail",
              status,
            );
          }
          if (status == 429) {
            throw DetectServerException(
              "Analysis rate limit exceeded. Please wait a moment and try again.",
              status,
            );
          }
          throw ApiException.fromDioError(e);
        default:
          throw DetectServerUnreachableException(
            "Unexpected network error: ${e.message}",
          );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw DetectServerException("Photo analysis failed: $e");
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
