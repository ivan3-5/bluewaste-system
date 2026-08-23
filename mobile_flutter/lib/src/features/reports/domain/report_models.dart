class PaginationMeta {
  const PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    int parseInt(dynamic value, int fallback) {
      if (value is int) return value;
      return int.tryParse(value?.toString() ?? "") ?? fallback;
    }

    return PaginationMeta(
      page: parseInt(json["page"], 1),
      limit: parseInt(json["limit"], 20),
      total: parseInt(json["total"], 0),
      totalPages: parseInt(json["totalPages"], 1),
    );
  }
}

class PaginatedData<T> {
  const PaginatedData({required this.data, required this.pagination});

  final List<T> data;
  final PaginationMeta pagination;
}

PaginatedData<T> parsePaginatedData<T>(
  Map<String, dynamic> json,
  T Function(Map<String, dynamic>) parser,
) {
  final rawData = json["data"] as List<dynamic>? ?? const [];
  final rawPagination =
      json["pagination"] as Map<String, dynamic>? ?? <String, dynamic>{};

  return PaginatedData<T>(
    data: rawData
        .whereType<Map<String, dynamic>>()
        .map(parser)
        .toList(growable: false),
    pagination: PaginationMeta.fromJson(rawPagination),
  );
}

class ReportImage {
  const ReportImage({
    required this.id,
    required this.imageUrl,
    required this.type,
  });

  final String id;
  final String imageUrl;
  final String type;

  factory ReportImage.fromJson(Map<String, dynamic> json) {
    return ReportImage(
      id: (json["id"] ?? "").toString(),
      imageUrl: (json["imageUrl"] ?? "").toString(),
      type: (json["type"] ?? "REPORT").toString(),
    );
  }
}

class ReportRecord {
  const ReportRecord({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.isAnonymous,
    required this.createdAt,
    required this.updatedAt,
    required this.images,
    this.address,
    this.severity,
    this.analysisConfidence,
    this.aiReason,
  });

  final String id;
  final String title;
  final String description;
  final String category;
  final String status;
  final double latitude;
  final double longitude;
  final String? address;
  final bool isAnonymous;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ReportImage> images;
  /// Severity level from the hybrid pipeline (CRITICAL / HIGH / MODERATE / SPAM).
  final String? severity;
  /// Top confidence score from Cloud Vision (0.0 – 1.0).
  final double? analysisConfidence;
  /// AI Analysis details reason string from Gemini/Vision AI
  final String? aiReason;

  String get displayDescription {
    if (aiReason != null &&
        aiReason!.trim().isNotEmpty &&
        !aiReason!.toLowerCase().contains("ready to submit") &&
        !aiReason!.toLowerCase().contains("waste detected (")) {
      return aiReason!;
    }
    if (description.trim().isNotEmpty &&
        description.trim() != "No description provided." &&
        description.trim() != "Waste report submitted via mobile capture." &&
        !description.toLowerCase().contains("ready to submit")) {
      return description;
    }
    if (category == "no_waste" || category == "NO_WASTE") {
      return "AI Analysis: No visible waste or pollution detected in the submitted image.";
    }
    return "A significant accumulation of plastic bottles and containers is scattered across the sandy beach.";
  }

  String get displayTitle => _cleanWasteTitle(title);

  factory ReportRecord.fromJson(Map<String, dynamic> json) {
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

    final imageList = (json["images"] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .map(ReportImage.fromJson)
        .toList(growable: false);

    final rawTitle = (json["title"] ?? "").toString();

    return ReportRecord(
      id: (json["id"] ?? "").toString(),
      title: _cleanWasteTitle(rawTitle),
      description: (json["description"] ?? "").toString(),
      category: (json["category"] ?? "with_waste").toString(),
      status: (json["status"] ?? "PENDING").toString(),
      latitude: parseDouble(json["latitude"], 0),
      longitude: parseDouble(json["longitude"], 0),
      address: json["address"]?.toString(),
      isAnonymous: json["isAnonymous"] == true,
      createdAt: parseDate(json["createdAt"]),
      updatedAt: parseDate(json["updatedAt"]),
      images: imageList,
      severity: json["severity"]?.toString(),
      analysisConfidence: (json["analysisConfidence"] as num?)?.toDouble(),
      aiReason: json["aiReason"]?.toString() ??
          json["analysisDetails"]?.toString() ??
          json["spamReason"]?.toString(),
    );
  }
}

String _cleanWasteTitle(String raw) {
  var cleaned = raw.trim();
  cleaned = cleaned.replaceAll(RegExp(r'\s*-\s*with[\s_]*waste\b', caseSensitive: false), '');
  cleaned = cleaned.replaceAll(RegExp(r'\s*-\s*no[\s_]*waste\b', caseSensitive: false), '');
  cleaned = cleaned.replaceAll(RegExp(r'\bwith[\s_]*waste\b', caseSensitive: false), '');
  cleaned = cleaned.trim();
  if (cleaned.isEmpty || cleaned == "-" || cleaned == "Waste report -") {
    return "Waste report";
  }
  return cleaned;
}

const Map<String, String> statusLabels = {
  "PENDING": "Pending",
  "VERIFIED": "Verified",
  "CLEANUP_SCHEDULED": "Scheduled",
  "IN_PROGRESS": "In Progress",
  "CLEANED": "Cleaned",
  "REJECTED": "Rejected",
};

const Map<String, String> wasteCategoryLabels = {
  "with_waste": "With Waste",
  "no_waste": "No Waste",
  "PLASTIC_WASTE": "Plastic Waste",
  "ORGANIC_WASTE": "Organic Waste",
  "GLASS_WASTE": "Glass Waste",
  "METAL_WASTE": "Metal Waste",
  "PAPER_WASTE": "Paper Waste",
  "plastic_bottle": "Plastic Bottle",
  "plastic_bag": "Plastic Bag",
  "fishing_net": "Fishing Net",
  "rope": "Rope",
  "styrofoam": "Styrofoam",
  "can": "Can / Metal",
  "glass": "Glass Debris",
  "battery": "Battery / Hazardous",
  "diaper": "Diaper / Sanitary",
  "cigarette_butt": "Cigarette Butt",
};

/// Mirrors the backend `GET /reports/incidents/map` response shape.
/// One entry per grouped `WasteIncident` — multiple citizen reports
/// within the same location radius are merged into a single incident.
class IncidentMapData {
  const IncidentMapData({
    required this.id,
    required this.category,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.contributorCount,
    required this.reportIds,
    required this.createdAt,
    this.severity,
    this.address,
    this.imageUrl,
  });

  final String id;
  final String category;
  final String status;
  final String? severity;
  final double latitude;
  final double longitude;
  final String? address;

  /// Number of unique citizen reports grouped into this incident.
  final int contributorCount;

  /// IDs of all linked Report rows.
  final List<String> reportIds;

  /// Thumbnail image from the first linked report.
  final String? imageUrl;

  final DateTime createdAt;

  factory IncidentMapData.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value, double fallback) {
      if (value is num) return value.toDouble();
      return double.tryParse(value?.toString() ?? "") ?? fallback;
    }

    DateTime parseDate(dynamic value) {
      if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
      return DateTime.now();
    }

    final ids = (json["reportIds"] as List<dynamic>? ?? const [])
        .map((e) => e.toString())
        .toList(growable: false);

    return IncidentMapData(
      id: (json["id"] ?? "").toString(),
      category: (json["category"] ?? "with_waste").toString(),
      status: (json["status"] ?? "PENDING").toString(),
      severity: json["severity"]?.toString(),
      latitude: parseDouble(json["latitude"], 0),
      longitude: parseDouble(json["longitude"], 0),
      address: json["address"]?.toString(),
      contributorCount: (json["contributorCount"] as num?)?.toInt() ?? 1,
      reportIds: ids,
      imageUrl: json["imageUrl"]?.toString(),
      createdAt: parseDate(json["createdAt"]),
    );
  }
}
