import "dart:convert";

import "package:dio/dio.dart";
import "package:latlong2/latlong.dart";
import "package:shared_preferences/shared_preferences.dart";

import "../../../core/config/app_env.dart";
import "../../../core/network/api_exception.dart";

class ReportingZones {
  ReportingZones({Dio? dio})
    : _dio =
          dio ??
          Dio(
            BaseOptions(
              baseUrl: AppEnv.apiBaseUrl,
              connectTimeout: const Duration(seconds: 6),
              receiveTimeout: const Duration(seconds: 6),
            ),
          );

  final Dio _dio;

  Future<List<List<LatLng>>> load() async {
    final cacheKey = "reporting_zones:${_dio.options.baseUrl}";
    final preferences = await SharedPreferences.getInstance();
    try {
      final response = await _dio.get<List<dynamic>>(
        "/reporting-zones",
        queryParameters: {"activeOnly": "true"},
      );
      final data = response.data ?? [];
      await preferences.setString(cacheKey, jsonEncode(data));
      return _parse(data);
    } on DioException catch (error) {
      final apiError = ApiException.fromDioError(error);
      if (!apiError.isTimeoutOrNetworkError &&
          (apiError.statusCode ?? 0) < 500) {
        throw apiError;
      }
      final saved = preferences.getString(cacheKey);
      if (saved != null) return _parse(jsonDecode(saved) as List);
      throw ApiException(
        "Could not load reporting zones. Connect once to save the zones for offline reporting.",
      );
    }
  }

  List<List<LatLng>> _parse(List<dynamic> data) {
    final zones = <List<LatLng>>[];
    for (final zone in data) {
      if (zone is! Map || zone["isActive"] == false) continue;
      final coordinates = zone["coordinates"];
      if (coordinates is! List) continue;
      final ring = [
        for (final point in coordinates)
          if (point is Map && point["lat"] is num && point["lng"] is num)
            LatLng(
              (point["lat"] as num).toDouble(),
              (point["lng"] as num).toDouble(),
            ),
      ];
      if (ring.length >= 3) zones.add(ring);
    }
    return zones;
  }
}

bool isInsideReportingZones(LatLng point, List<List<LatLng>> zones) {
  for (final ring in zones) {
    var inside = false;
    var previous = ring.last;
    for (final current in ring) {
      if ((current.latitude > point.latitude) !=
              (previous.latitude > point.latitude) &&
          point.longitude <
              (previous.longitude - current.longitude) *
                      (point.latitude - current.latitude) /
                      (previous.latitude - current.latitude) +
                  current.longitude) {
        inside = !inside;
      }
      previous = current;
    }
    if (inside) return true;
  }
  return false;
}
