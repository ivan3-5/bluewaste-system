import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../common_widgets/error_view.dart';
import '../../auth/presentation/auth_providers.dart';
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
  const SchedulesScreen({super.key});

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

    return Scaffold(
      appBar: AppBar(
        title: Text(isWorker ? 'My Schedules' : 'Upcoming Cleanups'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              if (isWorker) {
                ref.invalidate(mySchedulesProvider);
              } else {
                ref.invalidate(upcomingSchedulesProvider);
              }
            },
          ),
        ],
      ),
      body: schedulesAsync.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return const Center(
              child: Text(
                'No schedules found.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              if (isWorker) {
                ref.invalidate(mySchedulesProvider);
              } else {
                ref.invalidate(upcomingSchedulesProvider);
              }
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: schedules.length,
              itemBuilder: (context, index) {
                final schedule = schedules[index];
                return _ScheduleCard(schedule: schedule);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => ErrorView(
          message: e.toString(),
          onRetry: () {
            if (isWorker) {
              ref.invalidate(mySchedulesProvider);
            } else {
              ref.invalidate(upcomingSchedulesProvider);
            }
          },
        ),
      ),
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  final CleanupSchedule schedule;

  const _ScheduleCard({required this.schedule});

  Color _getStatusColor() {
    switch (schedule.status) {
      case CleanupScheduleStatus.upcoming:
        return Colors.blue;
      case CleanupScheduleStatus.ongoing:
        return Colors.orange;
      case CleanupScheduleStatus.completed:
        return Colors.green;
      case CleanupScheduleStatus.cancelled:
        return Colors.red;
    }
  }

  String _getStatusText() {
    switch (schedule.status) {
      case CleanupScheduleStatus.upcoming:
        return 'UPCOMING';
      case CleanupScheduleStatus.ongoing:
        return 'ONGOING';
      case CleanupScheduleStatus.completed:
        return 'COMPLETED';
      case CleanupScheduleStatus.cancelled:
        return 'CANCELLED';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => ScheduleDetailScreen(scheduleId: schedule.id, initialSchedule: schedule),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      schedule.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _getStatusColor().withOpacity(0.5)),
                    ),
                    child: Text(
                      _getStatusText(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _getStatusColor(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      schedule.barangay,
                      style: const TextStyle(color: Colors.grey),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('MMM d, yyyy h:mm a').format(schedule.scheduledAt),
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.group, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    '${schedule.workers.length} workers assigned',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
