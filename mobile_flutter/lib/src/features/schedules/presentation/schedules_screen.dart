import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/ui/app_components.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/schedule_service.dart';
import '../domain/schedule_models.dart';
import 'schedule_detail_screen.dart';

final upcomingSchedulesProvider = FutureProvider.autoDispose<List<CleanupSchedule>>((ref) async {
  final service = ref.watch(scheduleServiceProvider);
  return service.getUpcomingSchedules();
});

final mySchedulesProvider = FutureProvider.autoDispose<List<CleanupSchedule>>((ref) async {
  final service = ref.watch(scheduleServiceProvider);
  return service.getMySchedules(limit: 100);
});

class SchedulesScreen extends ConsumerStatefulWidget {
  const SchedulesScreen({super.key, this.showAppBar = false});

  final bool showAppBar;

  @override
  ConsumerState<SchedulesScreen> createState() => _SchedulesScreenState();
}

class _SchedulesScreenState extends ConsumerState<SchedulesScreen> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    // Auto refresh every 30 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      final user = ref.read(currentUserProvider).value;
      if (user?.role == 'FIELD_WORKER') {
        ref.invalidate(mySchedulesProvider);
      } else {
        ref.invalidate(upcomingSchedulesProvider);
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER';

    final schedulesAsync = isWorker
        ? ref.watch(mySchedulesProvider)
        : ref.watch(upcomingSchedulesProvider);

    final content = RefreshIndicator(
      onRefresh: () async {
        if (isWorker) {
          ref.invalidate(mySchedulesProvider);
        } else {
          ref.invalidate(upcomingSchedulesProvider);
        }
      },
      child: schedulesAsync.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                SizedBox(height: 120),
                AppEmptyState(
                  icon: Icons.event_busy_outlined,
                  title: 'No schedules found',
                  subtitle: 'There are no cleanup schedules assigned right now.',
                ),
              ],
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            physics: const AlwaysScrollableScrollPhysics(),
            itemCount: schedules.length,
            itemBuilder: (context, index) {
              final schedule = schedules[index];
              return _ScheduleCard(schedule: schedule);
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(
            color: AppColors.primary,
          ),
        ),
        error: (e, st) => ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            const SizedBox(height: 120),
            AppEmptyState(
              icon: Icons.error_outline,
              title: "Error loading schedules",
              subtitle: e.toString(),
            ),
          ],
        ),
      ),
    );

    if (widget.showAppBar) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Upcoming Cleanups'),
          backgroundColor: AppColors.card,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
        ),
        body: content,
      );
    }

    return content;
  }
}

class _ScheduleCard extends StatelessWidget {
  final CleanupSchedule schedule;

  const _ScheduleCard({required this.schedule});

  Color _getStatusColor() {
    switch (schedule.status) {
      case CleanupScheduleStatus.upcoming:
        return const Color(0xFF0066CC);
      case CleanupScheduleStatus.ongoing:
        return const Color(0xFFF59E0B);
      case CleanupScheduleStatus.completed:
        return const Color(0xFF10B981);
      case CleanupScheduleStatus.cancelled:
        return const Color(0xFFEF4444);
    }
  }

  String _getStatusText() {
    switch (schedule.status) {
      case CleanupScheduleStatus.upcoming:
        return 'Upcoming';
      case CleanupScheduleStatus.ongoing:
        return 'In Progress';
      case CleanupScheduleStatus.completed:
        return 'Completed';
      case CleanupScheduleStatus.cancelled:
        return 'Cancelled';
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    final statusText = _getStatusText();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.025),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ScheduleDetailScreen(
                  scheduleId: schedule.id,
                  initialSchedule: schedule,
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: statusColor.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: statusColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            statusText.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: statusColor,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 13,
                      color: AppColors.mutedForeground,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  schedule.title,
                  style: const TextStyle(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                    color: AppColors.foreground,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.tint(AppColors.primary, opacity: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.location_on_rounded, size: 14, color: AppColors.primary),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        schedule.barangay,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.foreground,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.event_available_rounded, size: 14, color: Color(0xFF8B5CF6)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        DateFormat('MMM d, yyyy · h:mm a').format(schedule.scheduledAt.toLocal()),
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w500,
                          color: AppColors.mutedForeground,
                        ),
                      ),
                    ),
                    if (schedule.workers.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.group_rounded, size: 13, color: AppColors.mutedForeground),
                            const SizedBox(width: 4),
                            Text(
                              "${schedule.workers.length}",
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.mutedForeground,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
