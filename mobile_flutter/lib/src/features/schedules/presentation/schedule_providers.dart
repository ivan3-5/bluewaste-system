import "package:flutter_riverpod/flutter_riverpod.dart";

import "../data/schedule_service.dart";
import "../domain/schedule_models.dart";

final upcomingSchedulesProvider =
    FutureProvider.autoDispose<List<CleanupSchedule>>(
      (ref) => ref.watch(scheduleServiceProvider).getUpcomingSchedules(),
    );

final mySchedulesProvider = FutureProvider.autoDispose<List<CleanupSchedule>>(
  (ref) => ref.watch(scheduleServiceProvider).getMySchedules(limit: 100),
);

final scheduleDetailProvider = FutureProvider.autoDispose
    .family<ScheduleDetails, String>(
      (ref, id) => ref.watch(scheduleServiceProvider).getScheduleDetails(id),
    );
