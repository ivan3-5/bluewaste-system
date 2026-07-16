import "dart:io";

import "package:dio/dio.dart";

// ── Result types ──────────────────────────────────────────────────────────────

class ApiSubmissionResult {
  const ApiSubmissionResult({
    required this.success,
    required this.message,
    this.data,
  });

  final bool success;
  final String message;
  final Map<String, dynamic>? data;
}

/// Result from the Gemini Vision AI analysis endpoint.
class GeminiAnalysisResult {
  const GeminiAnalysisResult({
    required this.success,
    required this.hasWaste,
    required this.categories,
    required this.severity,
    required this.confidence,
    required this.reason,
    required this.reportId,
    required this.status,
    this.imageUrl,
    this.message,
    this.cached = false,
    this.errorMessage,
  });

  final bool success;
  final bool hasWaste;
  final List<String> categories;
  final String severity;
  final double confidence;
  final String reason;
  final String reportId;
  final String status;
  final String? imageUrl;
  /// Polite spam message when hasWaste == false
  final String? message;
  final bool cached;
  final String? errorMessage;

  factory GeminiAnalysisResult.fromJson(Map<String, dynamic> json) {
    return GeminiAnalysisResult(
      success: true,
      hasWaste: json["hasWaste"] as bool? ?? false,
      categories: (json["categories"] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      severity: json["severity"]?.toString() ?? "None",
      confidence: (json["confidence"] as num?)?.toDouble() ?? 0.0,
      reason: json["reason"]?.toString() ?? "",
      reportId: json["reportId"]?.toString() ?? "",
      status: json["status"]?.toString() ?? "PENDING",
      imageUrl: json["imageUrl"]?.toString(),
      message: json["message"]?.toString(),
      cached: json["cached"] as bool? ?? false,
    );
  }

  factory GeminiAnalysisResult.error(String error) {
    return GeminiAnalysisResult(
      success: false,
      hasWaste: false,
      categories: const [],
      severity: "None",
      confidence: 0,
      reason: "",
      reportId: "",
      status: "",
      errorMessage: error,
    );
  }

  String get categoryDisplayNames => categories
      .map((c) => _categoryLabels[c] ?? c.replaceAll("_", " "))
      .join(", ");

  static const _categoryLabels = <String, String>{
    "plastic_bottle": "Plastic Bottle",
    "plastic_bag": "Plastic Bag",
    "fishing_net": "Fishing Net",
    "rope": "Rope",
    "styrofoam": "Styrofoam",
    "can": "Can",
    "glass": "Glass",
    "battery": "Battery",
    "diaper": "Diaper",
    "cigarette_butt": "Cigarette Butt",
  };
}

// ── ApiService ────────────────────────────────────────────────────────────────

class ApiService {
  ApiService({Dio? client, String? baseUrl})
      : _client = client ?? Dio(),
        baseUrl = (baseUrl ??
                const String.fromEnvironment(
                  "API_BASE_URL",
                  defaultValue: "https://bluewaste-management-system.vercel.app/api",
                ))
            .replaceAll(RegExp(r"/$"), "");

  final Dio _client;
  final String baseUrl;

  /// Derives the Next.js web app base (strips /api suffix for AI endpoints)
  String get _webBase => baseUrl.endsWith("/api")
      ? baseUrl.substring(0, baseUrl.length - 4)
      : baseUrl;

  // ── Gemini Vision AI endpoint ─────────────────────────────────────────────

  /// Calls POST /api/ai/analyze-report (Next.js web).
  /// The Flutter app sends only image + coordinates — zero AI logic client-side.
  /// No Gemini SDK, no API key, no prompt text in this file.
  Future<GeminiAnalysisResult> analyzeWithGemini({
    required File imageFile,
    required double latitude,
    required double longitude,
    String? citizenId,
    String? description,
  }) async {
    final uri = "$_webBase/api/ai/analyze-report";

    try {
      final fileName = imageFile.path.split(Platform.pathSeparator).last;
      
      final formData = FormData.fromMap({
        "image": await MultipartFile.fromFile(imageFile.path, filename: fileName),
        "latitude": latitude.toString(),
        "longitude": longitude.toString(),
        if (citizenId != null && citizenId.isNotEmpty) "citizenId": citizenId,
        if (description != null && description.trim().isNotEmpty) "description": description.trim(),
      });

      final response = await _client.post<Map<String, dynamic>>(
        uri,
        data: formData,
        options: Options(
          sendTimeout: const Duration(seconds: 60),
          receiveTimeout: const Duration(seconds: 60),
        ),
      );

      final body = response.data ?? <String, dynamic>{};
      return GeminiAnalysisResult.fromJson(body);
    } on DioException catch (e) {
      final data = e.response?.data;
      final errorMsg = (data is Map<String, dynamic> ? _extractMessage(data) : null) 
          ?? "Analysis failed (HTTP ${e.response?.statusCode}).";
      return GeminiAnalysisResult.error(errorMsg);
    } on Exception catch (e) {
      return GeminiAnalysisResult.error(
        e.toString().replaceFirst("Exception: ", ""),
      );
    }
  }

  // ── Legacy endpoints ──────────────────────────────────────────────────────

  Future<String> uploadImage(File imageFile) async {
    final uri = "$baseUrl/upload";
    final fileName = imageFile.path.split(Platform.pathSeparator).last;

    try {
      final formData = FormData.fromMap({
        "image": await MultipartFile.fromFile(imageFile.path, filename: fileName),
      });

      final response = await _client.post<Map<String, dynamic>>(
        uri,
        data: formData,
      );

      final body = response.data ?? <String, dynamic>{};
      final imageUrl = body["imageUrl"]?.toString();
      
      if (imageUrl == null || imageUrl.isEmpty) {
        throw Exception("Image upload succeeded without a returned URL.");
      }

      return imageUrl;
    } on DioException catch (e) {
      final data = e.response?.data;
      throw Exception(
        (data is Map<String, dynamic> ? _extractMessage(data) : null) ?? 
        "Failed to upload image.",
      );
    }
  }

  Future<ApiSubmissionResult> submitReport({
    required String imageUrl,
    required String category,
    required double confidence,
    required double latitude,
    required double longitude,
    required String locationName,
    String? description,
  }) async {
    final uri = "$baseUrl/reports";
    
    try {
      final response = await _client.post<Map<String, dynamic>>(
        uri,
        data: {
          "imageUrl": imageUrl,
          "category": category,
          "confidence": confidence,
          "latitude": latitude,
          "longitude": longitude,
          "locationName": locationName,
          if (description != null && description.trim().isNotEmpty)
            "description": description.trim(),
        },
      );

      final body = response.data ?? <String, dynamic>{};
      return ApiSubmissionResult(
        success: true,
        message: _extractMessage(body) ?? "Report submitted successfully.",
        data: body,
      );
    } on DioException catch (e) {
      final data = e.response?.data;
      final body = data is Map<String, dynamic> ? data : <String, dynamic>{};
      return ApiSubmissionResult(
        success: false,
        message: _extractMessage(body) ?? "Failed to submit report.",
        data: body,
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  String? _extractMessage(Map<String, dynamic> body) {
    final message = body["message"] ?? body["error"] ?? body["detail"];
    return message?.toString();
  }
}
