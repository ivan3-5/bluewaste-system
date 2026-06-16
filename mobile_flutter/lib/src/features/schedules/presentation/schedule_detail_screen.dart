import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import '../../../core/ui/app_components.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/schedule_service.dart';
import '../domain/schedule_models.dart';
import 'schedules_screen.dart'; // For upcomingSchedulesProvider & mySchedulesProvider

final scheduleDetailProvider =
    FutureProvider.family.autoDispose<CleanupSchedule, String>((ref, id) async {
  final service = ref.watch(scheduleServiceProvider);
  return service.getScheduleById(id);
});

class ScheduleDetailScreen extends ConsumerStatefulWidget {
  final String scheduleId;
  final CleanupSchedule? initialSchedule;

  const ScheduleDetailScreen({
    super.key,
    required this.scheduleId,
    this.initialSchedule,
  });

  @override
  ConsumerState<ScheduleDetailScreen> createState() =>
      _ScheduleDetailScreenState();
}

class _ScheduleDetailScreenState extends ConsumerState<ScheduleDetailScreen> {
  bool _isUpdating = false;

  Future<void> _updateStatus(BuildContext context, String status) async {
    final user = ref.read(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER';

    String? notes;
    if (status == 'COMPLETED') {
      notes = await showDialog<String>(
        context: context,
        builder: (context) {
          final controller = TextEditingController();
          return AlertDialog(
            title: const Text('Completion Notes'),
            content: TextField(
              controller: controller,
              decoration:
                  const InputDecoration(hintText: 'Enter any notes (optional)'),
              maxLines: 3,
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, controller.text),
                child: const Text('Submit'),
              ),
            ],
          );
        },
      );
      if (notes == null) return; // Cancelled
    }

    setState(() => _isUpdating = true);
    try {
      final service = ref.read(scheduleServiceProvider);
      await service.updateScheduleStatus(widget.scheduleId, status,
          notes: notes);

      ref.invalidate(scheduleDetailProvider(widget.scheduleId));
      if (isWorker) {
        ref.invalidate(mySchedulesProvider);
      } else {
        ref.invalidate(upcomingSchedulesProvider);
      }

      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status updated to $status')),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Error updating status: $e'),
            backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isUpdating = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheduleAsync = ref.watch(scheduleDetailProvider(widget.scheduleId));

    return Scaffold(
      appBar: AppBar(title: const Text('Schedule Details')),
      body: scheduleAsync.when(
        data: (schedule) => _buildDetail(context, schedule),
        loading: () => widget.initialSchedule != null
            ? _buildDetail(context, widget.initialSchedule!)
            : const Center(child: CircularProgressIndicator()),
        error: (e, st) => ListView(
          children: [
            const SizedBox(height: 140),
            AppEmptyState(
              icon: Icons.error_outline,
              title: "Error loading schedule",
              subtitle: e.toString(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetail(BuildContext context, CleanupSchedule schedule) {
    final user = ref.watch(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER';

    Color statusColor;
    switch (schedule.status) {
      case CleanupScheduleStatus.upcoming:
        statusColor = Colors.blue;
        break;
      case CleanupScheduleStatus.ongoing:
        statusColor = Colors.orange;
        break;
      case CleanupScheduleStatus.completed:
        statusColor = Colors.green;
        break;
      case CleanupScheduleStatus.cancelled:
        statusColor = Colors.red;
        break;
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Map Header
          SizedBox(
            height: 200,
            child: FlutterMap(
              options: MapOptions(
                initialCenter: LatLng(schedule.latitude, schedule.longitude),
                initialZoom: 15.0,
                interactionOptions:
                    const InteractionOptions(flags: InteractiveFlag.none),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.bluewastesystem',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(schedule.latitude, schedule.longitude),
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.location_on,
                        color: Colors.red,
                        size: 40,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Padding(
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
                            fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusColor),
                      ),
                      child: Text(
                        schedule.status.name.toUpperCase(),
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Info Rows
                _InfoRow(
                  icon: Icons.location_on,
                  title: 'Location',
                  subtitle: schedule.barangay,
                ),
                const SizedBox(height: 12),
                _InfoRow(
                  icon: Icons.calendar_today,
                  title: 'Date & Time',
                  subtitle: DateFormat('MMMM d, yyyy - h:mm a')
                      .format(schedule.scheduledAt),
                ),
                const SizedBox(height: 16),

                // Description
                const Text('Description',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(schedule.description,
                    style: const TextStyle(color: Colors.black87)),
                const SizedBox(height: 24),

                // Equipment
                if (schedule.equipment.isNotEmpty) ...[
                  const Text('Required Cleanup Equipment',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: schedule.equipment
                          .map((item) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border:
                                      Border.all(color: Colors.blue.shade300),
                                ),
                                child: Text(
                                  item,
                                  style: TextStyle(
                                    color: Colors.blue.shade700,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ))
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Workers
                const Text('Assigned Workers',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                if (schedule.workers.isEmpty)
                  const Text('No workers assigned.',
                      style: TextStyle(color: Colors.grey))
                else
                  ...schedule.workers.map((w) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade100,
                          child: Text(w.worker.firstName[0],
                              style: const TextStyle(color: Colors.blue)),
                        ),
                        title:
                            Text('${w.worker.firstName} ${w.worker.lastName}'),
                        subtitle: w.worker.phone != null
                            ? Text(w.worker.phone!)
                            : null,
                      )),

                const SizedBox(height: 24),

                // Notes
                if (schedule.notes != null && schedule.notes!.isNotEmpty) ...[
                  const Text('Completion Notes',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.yellow.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.yellow.shade200),
                    ),
                    child: Text(schedule.notes!),
                  ),
                  const SizedBox(height: 24),
                ],

                // Action Buttons for Field Workers
                if (isWorker) ...[
                  if (schedule.status == CleanupScheduleStatus.upcoming)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isUpdating
                            ? null
                            : () => _updateStatus(context, 'ONGOING'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: _isUpdating
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2))
                            : const Text('Start Cleanup',
                                style: TextStyle(
                                    color: Colors.white, fontSize: 16)),
                      ),
                    ),
                  if (schedule.status == CleanupScheduleStatus.ongoing)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isUpdating
                            ? null
                            : () => _updateStatus(context, 'COMPLETED'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: _isUpdating
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2))
                            : const Text('Mark as Completed',
                                style: TextStyle(
                                    color: Colors.white, fontSize: 16)),
                      ),
                    ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _InfoRow(
      {required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.grey, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(fontSize: 12, color: Colors.grey)),
              Text(subtitle,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }
}
