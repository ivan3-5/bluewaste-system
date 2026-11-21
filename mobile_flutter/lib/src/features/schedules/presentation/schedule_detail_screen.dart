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
import '../../reports/domain/report_models.dart';
import '../../reports/presentation/worker_home_screen.dart';
import '../../reports/presentation/worker_tasks_screen.dart';
import '../data/schedule_service.dart';
import '../domain/schedule_models.dart';
import 'schedule_providers.dart';

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
        return AppColors.primary;
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
    } else if (lower.contains("vest") || lower.contains("safety") || lower.contains("jacket")) {
      return Icons.health_and_safety_outlined;
    } else if (lower.contains("picker") || lower.contains("grabber") || lower.contains("tong")) {
      return Icons.pan_tool_alt_outlined;
    } else if (lower.contains("boot") || lower.contains("shoe")) {
      return Icons.hiking_rounded;
    } else if (lower.contains("rake") || lower.contains("shovel") || lower.contains("broom")) {
      return Icons.cleaning_services_rounded;
    }
    return Icons.handyman_outlined;
  }

  void _openImageViewer(
    List<ReportImage> images,
    int initialIndex,
    String title,
  ) {
    if (images.isEmpty) return;
    HapticFeedback.selectionClick();
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (_) => _ScheduleImageViewerDialog(
          images: images,
          initialIndex: initialIndex,
          title: title,
        ),
      ),
    );
  }

  Future<void> _updateStatus(BuildContext context, String status) async {
    if (_isUpdating) return;

    String? notes;
    if (status == 'COMPLETED') {
      var completionNotes = '';
      notes = await showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (dialogCtx) {
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
                    Icon(
                      Icons.check_circle_rounded,
                      color: Color(0xFF10B981),
                      size: 22,
                    ),
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
                  onChanged: (text) => completionNotes = text,
                  maxLength: 500,
                  maxLines: 4,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText:
                        "E.g., Successfully cleared coastal waste across zone. 5 bags collected.",
                    hintStyle: const TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedForeground,
                    ),
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
                      borderSide: const BorderSide(
                        color: AppColors.primary,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
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
                        onPressed: () =>
                            Navigator.pop(dialogCtx, completionNotes.trim()),
                        icon: const Icon(
                          Icons.check_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
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
      if (!mounted || notes == null) return;
    }

    setState(() => _isUpdating = true);
    try {
      final service = ref.read(scheduleServiceProvider);
      final updated = await service.updateScheduleStatus(
        widget.scheduleId,
        status,
        notes: notes,
      );
      if (!mounted || !context.mounted) return;

      ref.invalidate(scheduleDetailProvider(widget.scheduleId));
      ref.invalidate(mySchedulesProvider);
      ref.invalidate(upcomingSchedulesProvider);
      ref.invalidate(workerAssignedReportsProvider);
      ref.read(workerTasksRefreshProvider.notifier).state++;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(
                Icons.check_circle_rounded,
                color: Colors.white,
                size: 18,
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  "Schedule status updated to ${_statusLabel(updated.status)}.",
                ),
              ),
            ],
          ),
          backgroundColor: status == 'COMPLETED'
              ? const Color(0xFF10B981)
              : AppColors.primary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    } catch (e) {
      if (!mounted || !context.mounted) return;
      ref.invalidate(scheduleDetailProvider(widget.scheduleId));
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
    final user = ref.watch(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER';
    final scheduleAsync = isWorker
        ? ref
            .watch(scheduleDetailProvider(widget.scheduleId))
            .whenData<ScheduleDetails?>((value) => value)
        : ref
            .watch(upcomingSchedulesProvider)
            .whenData<ScheduleDetails?>((schedules) {
            final schedule = schedules
                .where((entry) => entry.id == widget.scheduleId)
                .firstOrNull;
            return schedule == null
                ? null
                : (
                    schedule: schedule,
                    uncleanedReports: 0,
                    reports: const <ReportRecord>[],
                  );
          });

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
            icon:
                const Icon(Icons.refresh_rounded, color: AppColors.foreground),
            tooltip: "Refresh details",
            onPressed: () {
              if (isWorker) {
                ref.invalidate(scheduleDetailProvider(widget.scheduleId));
              } else {
                ref.invalidate(upcomingSchedulesProvider);
              }
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: scheduleAsync.when(
        data: (details) => details == null
            ? const Center(
                child: Text("This cleanup schedule is no longer listed."),
              )
            : _buildBody(
                context,
                details.schedule,
                uncleanedReports: details.uncleanedReports,
                reports: details.reports,
              ),
        loading: () => widget.initialSchedule != null
            ? _buildBody(
                context,
                widget.initialSchedule!,
                reports: const [],
              )
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

  Widget _buildBody(
    BuildContext context,
    CleanupSchedule schedule, {
    int? uncleanedReports,
    List<ReportRecord> reports = const [],
  }) {
    final user = ref.watch(currentUserProvider).value;
    final isWorker = user?.role == 'FIELD_WORKER' &&
        schedule.workers.any((worker) => worker.workerId == user?.id);
    final statusColor = _statusColor(schedule.status);
    final statusLabel = _statusLabel(schedule.status);
    final isCompleted = schedule.status == CleanupScheduleStatus.completed;
    final hasActions = isWorker &&
        uncleanedReports != null &&
        (schedule.status == CleanupScheduleStatus.upcoming ||
            schedule.status == CleanupScheduleStatus.ongoing);

    // Collect all cleanup evidence photos and reported photos from linked reports
    final cleanupImages = reports
        .expand((r) => r.images)
        .where((img) => img.type == 'CLEANUP')
        .toList();
    final reportedImages = reports
        .expand((r) => r.images)
        .where((img) => img.type == 'REPORT')
        .toList();

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.sm,
              AppSpacing.md,
              AppSpacing.xl,
            ),
            children: [
              // ── 1. Map Section (Responsive & Properly sized) ──
              _buildMapCard(schedule),
              const SizedBox(height: AppSpacing.sm + 4),

              // ── 2. Integrated Overview & Details Card ──
              _buildOverviewCard(schedule, statusColor, statusLabel),
              const SizedBox(height: AppSpacing.sm + 4),

              // ── 3. Operations Requirements: Equipment & Assigned Team ──
              _buildOperationsCard(schedule),

              // ── 4. Completion Notes & Evidence Gallery (when completed or notes exist) ──
              if (isCompleted ||
                  (schedule.notes != null &&
                      schedule.notes!.trim().isNotEmpty) ||
                  cleanupImages.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.sm + 4),
                _buildCompletionAndEvidenceCard(
                  schedule,
                  cleanupImages: cleanupImages,
                  reportedImages: reportedImages,
                ),
              ],
            ],
          ),
        ),

        // ── Sticky Worker Action Bar ──
        if (hasActions) _buildBottomBar(context, schedule, uncleanedReports),
      ],
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. MAP SECTION
  // ───────────────────────────────────────────────────────────────────────────

  Widget _buildMapCard(CleanupSchedule schedule) {
    return Container(
      height: 165,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
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
                    width: 220,
                    height: 70,
                    alignment: Alignment.topCenter,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Un-truncated Barangay Badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.25),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.pin_drop_rounded,
                                size: 12,
                                color: Color(0xFF38BDF8),
                              ),
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
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0066CC),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0066CC)
                                    .withValues(alpha: 0.4),
                                blurRadius: 6,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.white,
                            size: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Coordinates Chip (Clean, unobtrusive)
          Positioned(
            bottom: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.94),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.border.withValues(alpha: 0.8),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.gps_fixed_rounded,
                    size: 11,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    "${schedule.latitude.toStringAsFixed(4)}, ${schedule.longitude.toStringAsFixed(4)}",
                    style: const TextStyle(
                      fontSize: 10,
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

  // ───────────────────────────────────────────────────────────────────────────
  // 2. INTEGRATED OVERVIEW & DETAILS CARD
  // ───────────────────────────────────────────────────────────────────────────

  Widget _buildOverviewCard(
    CleanupSchedule schedule,
    Color statusColor,
    String statusLabel,
  ) {
    final hasDescription = schedule.description.trim().isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
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
          // Top Row: Status Pill and Operation Type
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border:
                      Border.all(color: statusColor.withValues(alpha: 0.3)),
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
                      statusLabel.toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),
              ),
              const Text(
                "Cleanup Operation",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.mutedForeground,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Operation Title
          Text(
            schedule.title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
              color: AppColors.foreground,
              height: 1.25,
            ),
          ),

          const SizedBox(height: 12),

          // Consolidated Location & Date/Time Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: AppColors.border.withValues(alpha: 0.8),
              ),
            ),
            child: Row(
              children: [
                // Location Item
                Expanded(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.location_on_rounded,
                        size: 15,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "LOCATION",
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: AppColors.mutedForeground,
                                letterSpacing: 0.3,
                              ),
                            ),
                            Text(
                              schedule.barangay,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.foreground,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 1,
                  height: 24,
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  color: AppColors.border,
                ),
                // Scheduled Date & Time Item
                Expanded(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.calendar_month_rounded,
                        size: 15,
                        color: Color(0xFF8B5CF6),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "DATE & TIME",
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: AppColors.mutedForeground,
                                letterSpacing: 0.3,
                              ),
                            ),
                            Text(
                              DateFormat('MMM d, yyyy • h:mm a')
                                  .format(schedule.scheduledAt.toLocal()),
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.foreground,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Integrated Task Description (No oversized separate card!)
          if (hasDescription) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.secondary.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(top: 1.5),
                    child: Icon(
                      Icons.notes_rounded,
                      size: 14,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      schedule.description.trim(),
                      style: const TextStyle(
                        fontSize: 12,
                        height: 1.35,
                        color: Color(0xFF334155),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. OPERATIONS REQUIREMENTS (EQUIPMENT & ASSIGNED TEAM CONSOLIDATED)
  // ───────────────────────────────────────────────────────────────────────────

  Widget _buildOperationsCard(CleanupSchedule schedule) {
    final hasEquipment = schedule.equipment.isNotEmpty;
    final workers = schedule.workers;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
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
          // ── Equipment Section ──
          if (hasEquipment) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(
                      Icons.handyman_outlined,
                      size: 15,
                      color: Color(0xFF0284C7),
                    ),
                    SizedBox(width: 6),
                    Text(
                      "Required Equipment",
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.foreground,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    "${schedule.equipment.length}",
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0284C7),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Compact Chips
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: schedule.equipment.map((item) {
                final icon = _equipmentIcon(item);
                return Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0066CC).withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFF0066CC).withValues(alpha: 0.18),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(icon, size: 13, color: const Color(0xFF0066CC)),
                      const SizedBox(width: 5),
                      Text(
                        item,
                        style: const TextStyle(
                          color: Color(0xFF0066CC),
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 12),
          ],

          // ── Assigned Team Section ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.people_alt_outlined,
                    size: 15,
                    color: Color(0xFF10B981),
                  ),
                  SizedBox(width: 6),
                  Text(
                    "Assigned Team",
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                ],
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  "${workers.length}",
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          if (workers.isEmpty) ...[
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 6),
              child: Text(
                "No team members assigned yet.",
                style: TextStyle(
                  color: AppColors.mutedForeground,
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ] else ...[
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: workers.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 12, color: Color(0xFFF1F5F9)),
              itemBuilder: (context, idx) {
                final w = workers[idx];
                final worker = w.worker;
                final initials =
                    "${worker.firstName.isNotEmpty ? worker.firstName[0] : ''}${worker.lastName.isNotEmpty ? worker.lastName[0] : ''}"
                        .toUpperCase();
                final phone = worker.phone?.trim();

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    children: [
                      // Compact Avatar
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0066CC), Color(0xFF38BDF8)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            initials.isNotEmpty ? initials : "W",
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 11.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      // Name & Contact
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "${worker.firstName} ${worker.lastName}",
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.foreground,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 1),
                            Text(
                              phone != null && phone.isNotEmpty
                                  ? phone
                                  : (worker.email ?? "Field Worker"),
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.mutedForeground,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Copy Contact Button
                      if (phone != null && phone.isNotEmpty)
                        IconButton(
                          icon: const Icon(
                            Icons.copy_rounded,
                            size: 16,
                            color: AppColors.primary,
                          ),
                          tooltip: "Copy phone number",
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(
                            minWidth: 28,
                            minHeight: 28,
                          ),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: phone));
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text("Phone number $phone copied"),
                                duration: const Duration(seconds: 2),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. COMPLETION NOTES & EVIDENCE GALLERY
  // ───────────────────────────────────────────────────────────────────────────

  Widget _buildCompletionAndEvidenceCard(
    CleanupSchedule schedule, {
    required List<ReportImage> cleanupImages,
    required List<ReportImage> reportedImages,
  }) {
    final hasNotes =
        schedule.notes != null && schedule.notes!.trim().isNotEmpty;
    final allImages = cleanupImages.isNotEmpty ? cleanupImages : reportedImages;
    final isCleanupGallery = cleanupImages.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBF7D0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: Color(0xFFDCFCE7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.task_alt_rounded,
                  size: 16,
                  color: Color(0xFF16A34A),
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  "Completion & Verification",
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF166534),
                  ),
                ),
              ),
              if (schedule.verifiedAt != null)
                Text(
                  DateFormat("MMM d, yyyy").format(schedule.verifiedAt!.toLocal()),
                  style: const TextStyle(
                    fontSize: 10.5,
                    color: AppColors.mutedForeground,
                  ),
                ),
            ],
          ),

          // Completion Notes
          if (hasNotes) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFDCFCE7)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Operations Notes",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF166534),
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    schedule.notes!.trim(),
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.35,
                      color: Color(0xFF14532D),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Evidence Photos Gallery
          if (allImages.isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(
                  isCleanupGallery
                      ? Icons.verified_outlined
                      : Icons.photo_library_outlined,
                  size: 13,
                  color: const Color(0xFF166534),
                ),
                const SizedBox(width: 5),
                Text(
                  isCleanupGallery
                      ? "Cleanup Evidence Photos (${cleanupImages.length})"
                      : "Site Photos (${reportedImages.length})",
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF166534),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            SizedBox(
              height: 52,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: allImages.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (context, idx) {
                  final img = allImages[idx];
                  return GestureDetector(
                    onTap: () => _openImageViewer(
                      allImages,
                      idx,
                      isCleanupGallery ? "Cleanup Evidence" : "Site Photo",
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 52,
                        height: 52,
                        color: Colors.white,
                        child: Image.network(
                          img.imageUrl,
                          width: 52,
                          height: 52,
                          fit: BoxFit.cover,
                          loadingBuilder: (_, child, progress) =>
                              progress == null
                                  ? child
                                  : const Center(
                                      child: SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 1.5,
                                          color: Color(0xFF16A34A),
                                        ),
                                      ),
                                    ),
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(
                              Icons.broken_image_outlined,
                              size: 16,
                              color: AppColors.mutedForeground,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STICKY BOTTOM ACTION BAR
  // ───────────────────────────────────────────────────────────────────────────

  Widget _buildBottomBar(
    BuildContext context,
    CleanupSchedule schedule,
    int uncleanedReports,
  ) {
    final isUpcoming = schedule.status == CleanupScheduleStatus.upcoming;
    final isOngoing = schedule.status == CleanupScheduleStatus.ongoing;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.xs + 2,
        AppSpacing.md,
        AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: AppColors.card,
        border: const Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isOngoing && uncleanedReports > 0)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  "Mark the remaining $uncleanedReports linked task(s) as cleaned before completing this schedule.",
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFFB45309),
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: isUpcoming
                  ? ElevatedButton.icon(
                      onPressed: _isUpdating
                          ? null
                          : () => _updateStatus(context, 'ONGOING'),
                      icon: _isUpdating
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Icon(
                              Icons.play_arrow_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                      label: const Text(
                        'Start Cleanup Work',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                    )
                  : isOngoing
                      ? ElevatedButton.icon(
                          onPressed: _isUpdating || uncleanedReports > 0
                              ? null
                              : () => _updateStatus(context, 'COMPLETED'),
                          icon: _isUpdating
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(
                                  Icons.check_circle_outline_rounded,
                                  color: Colors.white,
                                  size: 18,
                                ),
                          label: const Text(
                            'Mark as Completed',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                        )
                      : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL-SCREEN IMAGE VIEWER
// ─────────────────────────────────────────────────────────────────────────────

class _ScheduleImageViewerDialog extends StatefulWidget {
  const _ScheduleImageViewerDialog({
    required this.images,
    this.initialIndex = 0,
    this.title = "Photo Preview",
  });

  final List<ReportImage> images;
  final int initialIndex;
  final String title;

  @override
  State<_ScheduleImageViewerDialog> createState() =>
      _ScheduleImageViewerDialogState();
}

class _ScheduleImageViewerDialogState
    extends State<_ScheduleImageViewerDialog> {
  late int _currentIndex;
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black.withValues(alpha: 0.8),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              "${_currentIndex + 1} of ${widget.images.length}",
              style: const TextStyle(color: Colors.white70, fontSize: 11),
            ),
          ],
        ),
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: widget.images.length,
        onPageChanged: (idx) => setState(() => _currentIndex = idx),
        itemBuilder: (context, idx) {
          final img = widget.images[idx];
          return Center(
            child: InteractiveViewer(
              minScale: 1.0,
              maxScale: 4.0,
              child: Image.network(
                img.imageUrl,
                fit: BoxFit.contain,
                loadingBuilder: (_, child, progress) {
                  if (progress == null) return child;
                  return const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  );
                },
                errorBuilder: (_, __, ___) => const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.broken_image_rounded,
                        color: Colors.white54,
                        size: 48,
                      ),
                      SizedBox(height: 8),
                      Text(
                        "Failed to load image",
                        style: TextStyle(color: Colors.white54),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
