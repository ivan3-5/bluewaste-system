import "dart:convert";
import "dart:io";

import "package:http/http.dart" as http;

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
  ApiService({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = (baseUrl ??
                const String.fromEnvironment(
                  "API_BASE_URL",
                  defaultValue: "https://bluewaste-management-system.vercel.app/api",
                ))
            .replaceAll(RegExp(r"/$"), "");

  final http.Client _client;
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
    final uri = Uri.parse("$_webBase/api/ai/analyze-report");

    try {
      final request = http.MultipartRequest("POST", uri);

      // Image
      final fileName = imageFile.path.split(Platform.pathSeparator).last;
      request.files.add(
        await http.MultipartFile.fromPath("image", imageFile.path, filename: fileName),
      );

      // Required fields
      request.fields["latitude"] = latitude.toString();
      request.fields["longitude"] = longitude.toString();

      // Optional fields
      if (citizenId != null && citizenId.isNotEmpty) {
        request.fields["citizenId"] = citizenId;
      }
      if (description != null && description.trim().isNotEmpty) {
        request.fields["description"] = description.trim();
      }

      final streamedResponse = await _client.send(request).timeout(
        const Duration(seconds: 60),
      );
      final response = await http.Response.fromStream(streamedResponse);
      final body = _decodeBody(response.body);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        final errorMsg = _extractMessage(body) ?? "Analysis failed (HTTP ${response.statusCode}).";
        return GeminiAnalysisResult.error(errorMsg);
      }

      return GeminiAnalysisResult.fromJson(body);
    } on Exception catch (e) {
      return GeminiAnalysisResult.error(
        e.toString().replaceFirst("Exception: ", ""),
      );
    }
  }

  // ── Legacy endpoints ──────────────────────────────────────────────────────

  Future<String> uploadImage(File imageFile) async {
    final uri = Uri.parse("$baseUrl/upload");
    final request = http.MultipartRequest("POST", uri);
    final fileName = imageFile.path.split(Platform.pathSeparator).last;
    request.files.add(
      await http.MultipartFile.fromPath(
        "image",
        imageFile.path,
        filename: fileName,
      ),
    );

    final streamedResponse = await _client.send(request);
    final response = await http.Response.fromStream(streamedResponse);
    final body = _decodeBody(response.body);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        _extractMessage(body) ?? "Failed to upload image.",
      );
    }

    final imageUrl = body["imageUrl"]?.toString();
    if (imageUrl == null || imageUrl.isEmpty) {
      throw Exception("Image upload succeeded without a returned URL.");
    }

    return imageUrl;
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
    final uri = Uri.parse("$baseUrl/reports");
    final response = await _client.post(
      uri,
      headers: const <String, String>{"Content-Type": "application/json"},
      body: jsonEncode(<String, dynamic>{
        "imageUrl": imageUrl,
        "category": category,
        "confidence": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "locationName": locationName,
        if (description != null && description.trim().isNotEmpty)
          "description": description.trim(),
      }),
    );

    final body = _decodeBody(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      return ApiSubmissionResult(
        success: false,
        message: _extractMessage(body) ?? "Failed to submit report.",
        data: body,
      );
    }

    return ApiSubmissionResult(
      success: true,
      message: _extractMessage(body) ?? "Report submitted successfully.",
      data: body,
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  Map<String, dynamic> _decodeBody(String raw) {
    if (raw.trim().isEmpty) {
      return <String, dynamic>{};
    }

    final decoded = jsonDecode(raw);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }

    return <String, dynamic>{"data": decoded};
  }

  String? _extractMessage(Map<String, dynamic> body) {
    final message = body["message"] ?? body["error"] ?? body["detail"];
    return message?.toString();
  }
}
