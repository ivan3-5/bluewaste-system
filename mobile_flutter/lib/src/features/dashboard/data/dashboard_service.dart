import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';

class DashboardStats {
  DashboardStats({
    required this.totalReports,
    required this.withWasteCount,
    required this.noWasteCount,
    required this.pendingCount,
    required this.resolvedCount,
  });

  final int totalReports;
  final int withWasteCount;
  final int noWasteCount;
  final int pendingCount;
  final int resolvedCount;

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalReports: (json['totalReports'] ?? 0) as int,
      withWasteCount: (json['withWasteCount'] ?? 0) as int,
      noWasteCount: (json['noWasteCount'] ?? 0) as int,
      pendingCount: (json['pendingCount'] ?? 0) as int,
      resolvedCount: (json['resolvedCount'] ?? 0) as int,
    );
  }
}

class DashboardService {
  DashboardService(this._dio);

  final Dio _dio;

  Future<DashboardStats> getStats() async {
    final res = await _dio.get<Map<String, dynamic>>('/dashboard/stats');
    return DashboardStats.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<List<Map<String, dynamic>>> getTrend({int days = 30}) async {
    final res = await _dio.get<List<dynamic>>('/dashboard/trend',
        queryParameters: {'days': days});
    final rows = res.data ?? const [];
    return rows.whereType<Map<String, dynamic>>().toList(growable: false);
  }

  Future<List<Map<String, dynamic>>> getCategories() async {
    final res = await _dio.get<List<dynamic>>('/dashboard/categories');
    final rows = res.data ?? const [];
    return rows.whereType<Map<String, dynamic>>().toList(growable: false);
  }
}

final dashboardServiceProvider = Provider<DashboardService>((ref) {
  return DashboardService(ref.watch(dioProvider));
});

final dashboardStatsProvider = FutureProvider.autoDispose<DashboardStats>((ref) async {
  return ref.watch(dashboardServiceProvider).getStats();
});
