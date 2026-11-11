import "dart:io";

import "package:dio/dio.dart";

import "../../../core/config/app_env.dart";
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

  /// Severity from the total number of waste items detected:
  /// Zero means no waste. MODERATE is the stored value for Medium.
  static WasteSeverity fromWasteCount(int wasteCount) {
    if (wasteCount >= 25) return WasteSeverity.critical;
    if (wasteCount >= 16) return WasteSeverity.high;
    if (wasteCount >= 9) return WasteSeverity.moderate;
    if (wasteCount >= 1) return WasteSeverity.low;
    return WasteSeverity.spam;
  }

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
        return "Critical";
      case WasteSeverity.high:
        return "High";
      case WasteSeverity.moderate:
        return "Medium";
      case WasteSeverity.low:
        return "Low";
      case WasteSeverity.spam:
        return "None";
      case WasteSeverity.unknown:
        return "Unknown";
    }
  }

  String summary(bool hasWaste) =>
      '${hasWaste ? "Waste detected" : "No waste detected"}. Severity: ${hasWaste ? label : "None"}.';

  String? get dbValue {
    switch (this) {
      case WasteSeverity.critical:
        return "CRITICAL";
      case WasteSeverity.high:
        return "HIGH";
      case WasteSeverity.moderate:
        return "MODERATE";
      case WasteSeverity.low:
        return "LOW";
      case WasteSeverity.spam:
        return "SPAM";
      case WasteSeverity.unknown:
        return null;
    }
  }
}

// ── A single label item ─────────────────────────────────────────────────────
class WasteLabel {
  const WasteLabel({required this.label, this.count = 1});

  final String label;

  /// Number of items detected for this label.
  final int count;

  factory WasteLabel.fromJson(Map<String, dynamic> json) {
    return WasteLabel(
      label: (json["label"] ?? "").toString(),
      count: (json["count"] as num?)?.toInt() ?? 1,
    );
  }
}

/// Result from on-device or server-side image analysis.
class DetectResult {
  const DetectResult({
    required this.hasWaste,
    required this.message,
    required this.wasteCount,
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
    this.model = "yolo-tflite",
  });

  /// Whether waste-related categories were detected.
  final bool hasWaste;

  /// Human-readable result or reason string.
  final String message;

  /// Total number of waste items detected in the photo.
  final int wasteCount;

  /// Severity level, derived from [wasteCount].
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
  final String? model;

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

    List<WasteLabel> parseLabels(dynamic raw) {
      if (raw is List && raw.isNotEmpty && raw.first is Map) {
        return raw
            .whereType<Map<String, dynamic>>()
            .map(WasteLabel.fromJson)
            .toList(growable: false);
      }
      return categoriesList
          .map((cat) => WasteLabel(label: wasteCategoryLabels[cat] ?? cat))
          .toList(growable: false);
    }

    final hasWasteVal = json["hasWaste"] == true || json["has_waste"] == true;
    final reportedCount =
        (json["wasteCount"] ?? json["waste_count"] ?? json["count"]) as num?;
    final wasteCountVal = hasWasteVal
        ? (reportedCount?.toInt() ?? categoriesList.length)
              .clamp(1, 1 << 30)
              .toInt()
        : 0;

    final severity = WasteSeverity.fromWasteCount(wasteCountVal);
    final reasonStr = severity.summary(hasWasteVal);

    return DetectResult(
      hasWaste: hasWasteVal,
      message: reasonStr,
      wasteCount: wasteCountVal,
      severity: severity,
      layer1Passed:
          json["layer1_passed"] != false && json["layer1Passed"] != false,
      categories: categoriesList,
      labels: parseLabels(json["labels"] ?? json["categories"]),
      allLabels: parseLabels(json["all_labels"] ?? json["categories"]),
      spamReason:
          (json["spamReason"] ?? json["spam_reason"])?.toString() ??
          (!hasWasteVal ? "No visible waste detected in photo" : null),
      reason: reasonStr,
      reportId: json["reportId"]?.toString(),
      imageUrl: json["imageUrl"]?.toString(),
      status: json["status"]?.toString(),
      model: json["model"]?.toString(),
    );
  }

  /// A sentinel "no detection run" result.
  factory DetectResult.unreachable() {
    return const DetectResult(
      hasWaste: false,
      message: "Photo analysis service unreachable.",
      wasteCount: 0,
      severity: WasteSeverity.unknown,
      layer1Passed: false,
    );
  }

  /// Whether the result requires admin review (SPAM severity).
  bool get isSpam => severity == WasteSeverity.spam;
}

/// Thrown when the TFLite model cannot be loaded or fails to run.
class DetectServerUnreachableException extends ApiException {
  DetectServerUnreachableException([
    super.message = "The on-device detection model is unavailable.",
  ]);
}

/// Thrown when inference produces an unexpected error.
class DetectServerException extends ApiException {
  DetectServerException(super.message, [int? statusCode])
    : super(statusCode: statusCode);
}

/// Image analysis runs on-device by default, or on the configured server.
///
/// Usage:
/// ```dart
/// final detectService = ref.read(detectServiceProvider);
/// final result = await detectService.detect(imageFile: file, latitude: lat, longitude: lng);
/// if (result.hasWaste) { ... }
/// ```
class DetectService {
  DetectService({Dio? dio, bool useServer = AppEnv.useGemini})
    : _dio = dio,
      _useServer = useServer;

  final Dio? _dio;
  final bool _useServer;

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
    if (_useServer) {
      return _detectWithServer(
        imageFile: imageFile,
        latitude: latitude,
        longitude: longitude,
        description: description,
        citizenId: citizenId,
      );
    }

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

  /// Sends [imageFile] to the server-selected analysis provider.
  Future<DetectResult> _detectWithServer({
    required File imageFile,
    required double latitude,
    required double longitude,
    String? description,
    String? citizenId,
  }) async {
    final dio =
        _dio ??
        Dio(
          BaseOptions(
            baseUrl: AppEnv.analysisApiBaseUrl,
            connectTimeout: const Duration(seconds: 15),
            sendTimeout: const Duration(seconds: 60),
            receiveTimeout: const Duration(seconds: 130),
          ),
        );

    try {
      final form = FormData.fromMap({
        "image": await MultipartFile.fromFile(imageFile.path),
        "latitude": latitude.toString(),
        "longitude": longitude.toString(),
        if (description != null) "description": description,
        if (citizenId != null) "citizenId": citizenId,
      });
      final response = await dio.post<Map<String, dynamic>>(
        "/ai/analyze-report",
        data: form,
      );
      final data = response.data;
      if (data == null) {
        throw DetectServerException("Analysis returned an empty response.");
      }
      if (data["model"] is! String ||
          (data["model"] as String).trim().isEmpty) {
        throw DetectServerException("Analysis returned no model identifier.");
      }
      final categories = data["categories"];
      if ((data["provider"] != "gemini" && data["provider"] != "yolo") ||
          data["hasWaste"] is! bool ||
          categories is! List ||
          !categories.every((category) => category is String) ||
          WasteSeverity.fromString(data["severity"]?.toString()) ==
              WasteSeverity.unknown ||
          data["reason"] is! String) {
        throw DetectServerException("Analysis returned an invalid response.");
      }
      return DetectResult.fromJson(data);
    } on DioException catch (error) {
      final apiError = ApiException.fromDioError(error);
      if (apiError.isTimeoutOrNetworkError) {
        throw DetectServerUnreachableException(
          "Could not reach the analysis service. Check your connection.",
        );
      }
      throw DetectServerException(apiError.message, apiError.statusCode);
    }
  }
}
