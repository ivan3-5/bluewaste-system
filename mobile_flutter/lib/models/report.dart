class Report {
  const Report({
    required this.imageUrl,
    required this.category,
    required this.confidence,
    required this.latitude,
    required this.longitude,
    required this.locationName,
    required this.reportedAt,
    this.description,
  });

  final String imageUrl;
  final String category;
  final double confidence;
  final double latitude;
  final double longitude;
  final String locationName;
  final String? description;
  final DateTime reportedAt;

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      "imageUrl": imageUrl,
      "category": category,
      "confidence": confidence,
      "latitude": latitude,
      "longitude": longitude,
      "locationName": locationName,
      if (description != null && description!.trim().isNotEmpty)
        "description": description,
      "reportedAt": reportedAt.toIso8601String(),
    };
  }

  factory Report.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value, double fallback) {
      if (value is num) return value.toDouble();
      return double.tryParse(value?.toString() ?? "") ?? fallback;
    }

    DateTime parseDate(dynamic value) {
      if (value is String) {
        return DateTime.tryParse(value) ?? DateTime.now();
      }
      return DateTime.now();
    }

    return Report(
      imageUrl: (json["imageUrl"] ?? "").toString(),
      category: (json["category"] ?? "no_waste").toString(),
      confidence: parseDouble(json["confidence"], 0),
      latitude: parseDouble(json["latitude"], 0),
      longitude: parseDouble(json["longitude"], 0),
      locationName: (json["locationName"] ?? "").toString(),
      description: json["description"]?.toString(),
      reportedAt: parseDate(json["reportedAt"]),
    );
  }
}
