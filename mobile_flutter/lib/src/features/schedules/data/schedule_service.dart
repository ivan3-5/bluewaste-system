import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../../../core/network/api_exception.dart';
import '../domain/schedule_models.dart';

final scheduleServiceProvider = Provider<ScheduleService>((ref) {
  final dio = ref.watch(dioProvider);
  return ScheduleService(dio);
});

typedef ScheduleDetails = ({CleanupSchedule schedule, int uncleanedReports});

class ScheduleService {
  final Dio _dio;

  ScheduleService(this._dio);

  Future<List<CleanupSchedule>> getUpcomingSchedules() async {
    try {
      final response = await _dio.get('/schedules/upcoming');
      final data = response.data as List;
      return data.map((e) => CleanupSchedule.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<CleanupSchedule>> getMySchedules({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      final queryParams = <String, dynamic>{'page': page, 'limit': limit};
      if (status != null) queryParams['status'] = status;

      final response = await _dio.get(
        '/schedules/my-schedules',
        queryParameters: queryParams,
      );
      final data = response.data['data'] as List;
      return data.map((e) => CleanupSchedule.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<ScheduleDetails> getScheduleDetails(String id) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/schedules/$id');
      final data = response.data!;
      final reports = data['reports'];
      final uncleanedReports = reports is List
          ? reports
                .where(
                  (report) =>
                      report is Map &&
                      report['isDeleted'] != true &&
                      report['status'] != 'CLEANED',
                )
                .length
          : 0;
      return (
        schedule: CleanupSchedule.fromJson(data),
        uncleanedReports: uncleanedReports,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<CleanupSchedule> updateScheduleStatus(
    String id,
    String status, {
    String? notes,
  }) async {
    try {
      final response = await _dio.put(
        '/schedules/$id/status',
        data: {'status': status, if (notes != null) 'notes': notes},
      );
      return CleanupSchedule.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(dynamic e) {
    if (e is DioException) return ApiException.fromDioError(e);
    return Exception(e.toString());
  }
}
