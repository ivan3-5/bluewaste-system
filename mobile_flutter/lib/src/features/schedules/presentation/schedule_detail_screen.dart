import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/ui/app_components.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/schedule_service.dart';
import '../domain/schedule_models.dart';
import 'schedules_screen.dart';

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

  Color _statusColor(CleanupScheduleStatus status) {
    switch (status) {
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

  String _statusLabel(CleanupScheduleStatus status) {
    switch (status) {
      case CleanupScheduleStatus.upcoming:
        return "Upcoming";
      case CleanupScheduleStatus.ongoing:
        return "In Progress";
      case CleanupScheduleStatus.completed:
        return "Completed";
      case CleanupScheduleStatus.cancelled:
        return "Cancelled";
    }
  }

  IconData _equipmentIcon(String item) {
    final lower = item.toLowerCase();
    if (lower.contains("bag") || lower.contains("trash") || lower.contains("garbage")) {
      return Icons.delete_outline_rounded;
    } else if (lower.contains("glove")) {
      return Icons.back_hand_outlined;
    } else if (lower.contains("mask")) {
      return Icons.masks_outlined;
    } else if (lower.contains("boot") || lower.contains("shoe")) {
      return Icons.hiking_rounded;
    } else if (lower.contains("rake") || lower.contains("shovel") || lower.contains("broom")) {
      return Icons.cleaning_services_rounded;
    }
    return Icons.handyman_outlined;
  }

  Future<void> _updateStatus(BuildContext context, String status) async {
    final user = ref.read(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER';

    String? notes;
    if (status == 'COMPLETED') {
      notes = await showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (dialogCtx) {
          final controller = TextEditingController();
          return Container(
            padding: EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.md,
              MediaQuery.of(dialogCtx).viewInsets.bottom + AppSpacing.md,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Row(
                  children: [
                    Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 22),
                    SizedBox(width: 8),
                    Text(
                      "Complete Cleanup Schedule",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  "Add optional completion notes or operations summary for dispatch verification.",
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.mutedForeground,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller,
                  maxLines: 4,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText: "E.g., Successfully cleared coastal waste across zone. 5 bags collected.",
                    hintStyle: const TextStyle(fontSize: 13, color: AppColors.mutedForeground),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(dialogCtx),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          side: const BorderSide(color: AppColors.border),
                        ),
                        child: const Text(
                          "Cancel",
                          style: TextStyle(
                            color: AppColors.foreground,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: () => Navigator.pop(dialogCtx, controller.text),
                        icon: const Icon(Icons.check_rounded, color: Colors.white, size: 18),
                        label: const Text(
                          "Confirm Complete",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      );
      if (notes == null) return;
    }

    setState(() => _isUpdating = true);
    try {
      final service = ref.read(scheduleServiceProvider);
      await service.updateScheduleStatus(widget.scheduleId, status, notes: notes);

      ref.invalidate(scheduleDetailProvider(widget.scheduleId));
      if (isWorker) {
        ref.invalidate(mySchedulesProvider);
      } else {
        ref.invalidate(upcomingSchedulesProvider);
      }

      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text("Schedule status updated to ${_statusLabel(CleanupScheduleStatus.values.firstWhere((e) => e.name.toUpperCase() == status.toUpperCase(), orElse: () => CleanupScheduleStatus.completed))}"),
            ],
          ),
          backgroundColor: status == 'COMPLETED' ? const Color(0xFF10B981) : AppColors.primary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error updating status: $e'),
          backgroundColor: AppColors.destructive,
          behavior: SnackBarBehavior.floating,
        ),
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
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Schedule Details',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 18,
            letterSpacing: -0.3,
          ),
        ),
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.foreground),
            tooltip: "Refresh details",
            onPressed: () => ref.invalidate(scheduleDetailProvider(widget.scheduleId)),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: scheduleAsync.when(
        data: (schedule) => _buildBody(context, schedule),
        loading: () => widget.initialSchedule != null
            ? _buildBody(context, widget.initialSchedule!)
            : const Center(
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 3,
                ),
              ),
        error: (e, st) => ListView(
          children: [
            const SizedBox(height: 140),
            AppEmptyState(
              icon: Icons.error_outline_rounded,
              title: "Error loading schedule",
              subtitle: e.toString(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, CleanupSchedule schedule) {
    final user = ref.watch(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER';
    final statusColor = _statusColor(schedule.status);
    final statusLabel = _statusLabel(schedule.status);
    final hasActions = isWorker &&
        (schedule.status == CleanupScheduleStatus.upcoming ||
            schedule.status == CleanupScheduleStatus.ongoing);

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.xl),
            children: [
              // ── Map Card Preview ──
              _buildMapCard(schedule),
              const SizedBox(height: AppSpacing.md),

              // ── Primary Header Card ──
              _buildHeroHeader(schedule, statusColor, statusLabel),
              const SizedBox(height: AppSpacing.md),

              // ── Description Card ──
              if (schedule.description.trim().isNotEmpty) ...[
                _buildSectionCard(
                  icon: Icons.notes_rounded,
                  iconColor: AppColors.primary,
                  title: "Task Description",
                  child: Text(
                    schedule.description,
                    style: const TextStyle(
                      fontSize: 14,
                      height: 1.45,
                      color: Color(0xFF334155),
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
              ],

              // ── Required Equipment ──
              if (schedule.equipment.isNotEmpty) ...[
                _buildEquipmentCard(schedule),
                const SizedBox(height: AppSpacing.md),
              ],

              // ── Assigned Workers ──
              _buildWorkersCard(schedule),
              const SizedBox(height: AppSpacing.md),

              // ── Completion Notes ──
              if (schedule.notes != null && schedule.notes!.trim().isNotEmpty) ...[
                _buildNotesCard(schedule),
                const SizedBox(height: AppSpacing.md),
              ],
            ],
          ),
        ),

        // ── Sticky Worker Action Bar ──
        if (hasActions) _buildBottomBar(context, schedule),
      ],
    );
  }

  Widget _buildMapCard(CleanupSchedule schedule) {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: LatLng(schedule.latitude, schedule.longitude),
              initialZoom: 15.2,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.drag | InteractiveFlag.pinchZoom,
              ),
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
                    width: 140,
                    height: 80,
                    alignment: Alignment.topCenter,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 6,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.pin_drop_rounded, size: 12, color: Color(0xFF38BDF8)),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(
                                  schedule.barangay,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0066CC),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2.5),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0066CC).withValues(alpha: 0.4),
                                blurRadius: 8,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.white,
                            size: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 10,
            right: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 6,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.gps_fixed_rounded, size: 12, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text(
                    "${schedule.latitude.toStringAsFixed(4)}, ${schedule.longitude.toStringAsFixed(4)}",
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroHeader(CleanupSchedule schedule, Color statusColor, String statusLabel) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Status pill & Tag
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      statusLabel.toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                "Cleanup Operation",
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.mutedForeground.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Schedule Title
          Text(
            schedule.title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.4,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 14),

          // 2-Column Info Grid
          Row(
            children: [
              Expanded(
                child: _buildInfoTile(
                  icon: Icons.location_on_rounded,
                  iconColor: const Color(0xFF0066CC),
                  label: "LOCATION",
                  value: schedule.barangay,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildInfoTile(
                  icon: Icons.calendar_month_rounded,
                  iconColor: const Color(0xFF8B5CF6),
                  label: "DATE & TIME",
                  value: DateFormat('MMM d, yyyy\nh:mm a').format(schedule.scheduledAt.toLocal()),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 17, color: iconColor),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.mutedForeground,
                    letterSpacing: 0.4,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.foreground,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEquipmentCard(CleanupSchedule schedule) {
    return _buildSectionCard(
      icon: Icons.handyman_rounded,
      iconColor: const Color(0xFF0284C7),
      title: "Required Equipment",
      badgeCount: schedule.equipment.length,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: schedule.equipment.map((item) {
          final icon = _equipmentIcon(item);
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFF0066CC).withValues(alpha: 0.07),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFF0066CC).withValues(alpha: 0.22),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 15, color: const Color(0xFF0066CC)),
                const SizedBox(width: 6),
                Text(
                  item,
                  style: const TextStyle(
                    color: Color(0xFF0066CC),
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildWorkersCard(CleanupSchedule schedule) {
    return _buildSectionCard(
      icon: Icons.people_alt_rounded,
      iconColor: const Color(0xFF10B981),
      title: "Assigned Team",
      badgeCount: schedule.workers.length,
      child: schedule.workers.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text(
                "No cleanup team members assigned yet.",
                style: TextStyle(
                  color: AppColors.mutedForeground,
                  fontSize: 13,
                  fontStyle: FontStyle.italic,
                ),
              ),
            )
          : Column(
              children: schedule.workers.asMap().entries.map((entry) {
                final idx = entry.key;
                final w = entry.value;
                final worker = w.worker;
                final initials = "${worker.firstName.isNotEmpty ? worker.firstName[0] : ''}${worker.lastName.isNotEmpty ? worker.lastName[0] : ''}".toUpperCase();
                final phone = worker.phone?.trim();

                return Column(
                  children: [
                    if (idx > 0) const Divider(height: 16, color: AppColors.border),
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF0066CC), Color(0xFF38BDF8)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              initials.isNotEmpty ? initials : "W",
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "${worker.firstName} ${worker.lastName}",
                                style: const TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.foreground,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                phone != null && phone.isNotEmpty ? phone : (worker.email ?? "Field Worker"),
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.mutedForeground,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (phone != null && phone.isNotEmpty)
                          IconButton(
                            icon: const Icon(Icons.copy_rounded, size: 18, color: AppColors.primary),
                            tooltip: "Copy phone number",
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: phone));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text("Phone number $phone copied"),
                                  duration: const Duration(seconds: 2),
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                            },
                          ),
                      ],
                    ),
                  ],
                );
              }).toList(),
            ),
    );
  }

  Widget _buildNotesCard(CleanupSchedule schedule) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.assignment_turned_in_rounded, size: 18, color: Color(0xFFD97706)),
              SizedBox(width: 8),
              Text(
                "Completion Notes",
                style: TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF92400E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            schedule.notes!,
            style: const TextStyle(
              fontSize: 13.5,
              height: 1.4,
              color: Color(0xFF78350F),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required Widget child,
    int? badgeCount,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.025),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 19, color: iconColor),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                      color: AppColors.foreground,
                    ),
                  ),
                ],
              ),
              if (badgeCount != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    "$badgeCount",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: iconColor,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, CleanupSchedule schedule) {
    final isUpcoming = schedule.status == CleanupScheduleStatus.upcoming;
    final isOngoing = schedule.status == CleanupScheduleStatus.ongoing;

    return Container(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        border: const Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: isUpcoming
              ? ElevatedButton.icon(
                  onPressed: _isUpdating ? null : () => _updateStatus(context, 'ONGOING'),
                  icon: _isUpdating
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                        )
                      : const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 22),
                  label: const Text(
                    'Start Cleanup Work',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0066CC),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 2,
                  ),
                )
              : isOngoing
                  ? ElevatedButton.icon(
                      onPressed: _isUpdating ? null : () => _updateStatus(context, 'COMPLETED'),
                      icon: _isUpdating
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                            )
                          : const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 22),
                      label: const Text(
                        'Mark as Completed',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 2,
                      ),
                    )
                  : const SizedBox.shrink(),
        ),
      ),
    );
  }
}
