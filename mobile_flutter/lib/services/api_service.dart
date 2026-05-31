import "dart:convert";
import "dart:io";

import "package:http/http.dart" as http;

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

class ApiService {
  ApiService({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = (baseUrl ??
                const String.fromEnvironment(
                  "API_BASE_URL",
                  defaultValue: "https://your-nextjs-app.vercel.app/api",
                ))
            .replaceAll(RegExp(r"/$"), "");

  final http.Client _client;
  final String baseUrl;

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
