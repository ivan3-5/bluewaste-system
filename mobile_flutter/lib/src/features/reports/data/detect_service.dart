import "dart:io";

import "../../../core/network/api_exception.dart";
import "../domain/report_models.dart";
import "tflite_service.dart";

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

/// Result from on-device TFLite YOLOv8n inference.
/// Matches the shape expected by the UI layer.
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

  /// Human-readable result or reason string.
  final String message;

  /// Overall AI confidence as a fraction (0.0 – 1.0).
  final double confidence;

  /// Severity level determined by on-device inference.
  final WasteSeverity severity;

  /// Whether inference passed the object-presence layer.
  final bool layer1Passed;

  /// Detected waste category identifiers.
  final List<String> categories;

  /// Mapped display labels for cards and lists.
  final List<WasteLabel> labels;

  /// All labels returned (for display).
  final List<WasteLabel> allLabels;

  /// Human-readable spam reason, if spam-flagged.
  final String? spamReason;

  /// Detailed reasoning.
  final String? reason;

  /// Not used by on-device path — retained for API compatibility.
  final String? reportId;

  /// Not used by on-device path — retained for API compatibility.
  final String? imageUrl;

  /// Initial report status.
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

/// Thrown when the TFLite model cannot be loaded or fails to run.
class DetectServerUnreachableException extends ApiException {
  DetectServerUnreachableException(
      [super.message = "The on-device detection model is unavailable."]);
}

/// Thrown when inference produces an unexpected error.
class DetectServerException extends ApiException {
  DetectServerException(super.message, [int? statusCode])
      : super(statusCode: statusCode);
}

/// On-device image analysis service backed by YOLOv8n TFLite.
///
/// Replaces the previous HTTP call to the backend's `/ai/analyze-report`
/// endpoint and the HuggingFace Gradio Space. All inference now runs
/// locally on the device — no network request is required for detection.
///
/// Usage:
/// ```dart
/// final detectService = ref.read(detectServiceProvider);
/// final result = await detectService.detect(imageFile: file, latitude: lat, longitude: lng);
/// if (result.hasWaste) { ... }
/// ```
class DetectService {
  DetectService();

  /// Runs on-device YOLOv8n TFLite inference on [imageFile].
  ///
  /// [latitude], [longitude], [description], and [citizenId] are accepted for
  /// API-surface compatibility but are not used during local inference.
  ///
  /// Throws:
  ///   [DetectServerUnreachableException] — model failed to load
  ///   [DetectServerException]            — inference error
  Future<DetectResult> detect({
    required File imageFile,
    required double latitude,
    required double longitude,
    String? description,
    String? citizenId,
  }) async {
    try {
      return await TFLiteService.instance.runInference(imageFile);
    } catch (e) {
      if (e is ApiException) rethrow;
      if (e.toString().contains("load") || e.toString().contains("model")) {
        throw DetectServerUnreachableException(
          "Could not load the on-device detection model. Please reinstall the app.",
        );
      }
      throw DetectServerException("On-device photo analysis failed: $e");
    }
  }
}
