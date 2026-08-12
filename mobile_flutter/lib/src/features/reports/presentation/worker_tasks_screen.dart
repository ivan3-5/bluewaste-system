import "dart:async";

import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:image_picker/image_picker.dart";
import "package:intl/intl.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../data/report_service.dart";
import "../domain/report_models.dart";
import "worker_route_screen.dart";

class WorkerTasksScreen extends ConsumerStatefulWidget {
  const WorkerTasksScreen({super.key});

  @override
  ConsumerState<WorkerTasksScreen> createState() => _WorkerTasksScreenState();
}

class _WorkerTasksScreenState extends ConsumerState<WorkerTasksScreen> {
  final DateFormat _dateFormat = DateFormat("MMM d, yyyy h:mm a");
  final ImagePicker _picker = ImagePicker();

  List<ReportRecord> _tasks = const [];
  bool _loading = true;
  String _activeFilter = "all";
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadTasks();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _loadTasks());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadTasks() async {
    try {
      final result = await ref.read(reportServiceProvider).getAssignedReports(
            page: 1,
            limit: 100,
          );

      if (!mounted) return;

      setState(() {
        _tasks = result.data;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(ReportRecord report, String status) async {
    try {
      await ref.read(reportServiceProvider).updateStatus(
            reportId: report.id,
            status: status,
            notes: "Updated from Flutter mobile app",
          );
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_outline,
                  color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text("Status updated to ${statusLabels[status] ?? status}."),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
      await _loadTasks();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          backgroundColor: AppColors.destructive,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    }
  }

  Future<void> _uploadCleanupPhoto(String reportId) async {
    final photo =
        await _picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (photo == null) return;

    try {
      await ref.read(reportServiceProvider).uploadReportImages(
            reportId: reportId,
            images: [photo],
            type: "CLEANUP",
          );
      if (!mounted) return;
      await _loadTasks();
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.camera_alt_outlined, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text("Cleanup proof photo uploaded successfully!"),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          backgroundColor: AppColors.destructive,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    }
  }

  void _openRouteMap([ReportRecord? targetReport]) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (_) => Scaffold(
          appBar: AppBar(
            title: Text(
              targetReport != null
                  ? "Route to ${targetReport.title}"
                  : "Route Map",
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 18,
              ),
            ),
            backgroundColor: AppColors.card,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
          ),
          body: WorkerRouteScreen(targetReport: targetReport),
        ),
      ),
    );
  }

  List<ReportRecord> get _filteredTasks {
    if (_activeFilter == "active") {
      return _tasks.where((t) => t.status != "CLEANED").toList();
    } else if (_activeFilter == "cleaned") {
      return _tasks.where((t) => t.status == "CLEANED").toList();
    }
    return _tasks;
  }

  List<_TaskAction> _actionsForStatus(String status) {
    switch (status) {
      case "VERIFIED":
      case "CLEANUP_SCHEDULED":
        return const [
          _TaskAction(label: "Start Cleanup Work", nextStatus: "IN_PROGRESS"),
        ];
      case "IN_PROGRESS":
        return const [
          _TaskAction(
            label: "Mark Cleaned ✓",
            nextStatus: "CLEANED",
            requiresCleanupPhoto: true,
          ),
        ];
      default:
        return const [];
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.primary,
          strokeWidth: 3,
        ),
      );
    }

    final activeCount = _tasks.where((t) => t.status != "CLEANED").length;
    final cleanedCount = _tasks.where((t) => t.status == "CLEANED").length;
    final displayTasks = _filteredTasks;

    return RefreshIndicator(
      onRefresh: _loadTasks,
      child: Stack(
        children: [
          Column(
            children: [
              // ── Filter Tab Header ──
              Container(
                color: AppColors.card,
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.xs,
                  AppSpacing.md,
                  AppSpacing.sm,
                ),
                child: Row(
                  children: [
                    _FilterChip(
                      label: "All (${_tasks.length})",
                      isSelected: _activeFilter == "all",
                      onTap: () => setState(() => _activeFilter = "all"),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: "Active ($activeCount)",
                      isSelected: _activeFilter == "active",
                      onTap: () => setState(() => _activeFilter = "active"),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: "Cleaned ($cleanedCount)",
                      isSelected: _activeFilter == "cleaned",
                      onTap: () => setState(() => _activeFilter = "cleaned"),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.border),

              // ── Task List ──
              Expanded(
                child: displayTasks.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 120),
                          AppEmptyState(
                            icon: Icons.assignment_outlined,
                            title: "No assigned tasks",
                            subtitle:
                                "Assignments matching this filter will appear here.",
                          ),
                        ],
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md,
                          AppSpacing.md,
                          AppSpacing.md,
                          96,
                        ),
                        itemCount: displayTasks.length,
                        itemBuilder: (context, index) {
                          final task = displayTasks[index];
                          final actions = _actionsForStatus(task.status);
                          final cleanupImages = task.images
                              .where((image) => image.type == "CLEANUP")
                              .toList();
                          final cleanupCount = cleanupImages.length;
                          final needsCleanupPhoto =
                              task.status == "IN_PROGRESS" && cleanupCount == 0;

                          return Container(
                            margin:
                                const EdgeInsets.only(bottom: AppSpacing.md),
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppColors.border),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(AppSpacing.md),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // ── Top Header Row (Category + Status) ──
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.categoryColor(
                                                  task.category)
                                              .withValues(alpha: 0.12),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          wasteCategoryLabels[task.category] ??
                                              task.category,
                                          style: TextStyle(
                                            color: AppColors.categoryColor(
                                                task.category),
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.statusColor(
                                                  task.status)
                                              .withValues(alpha: 0.12),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              width: 6,
                                              height: 6,
                                              decoration: BoxDecoration(
                                                color: AppColors.statusColor(
                                                    task.status),
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              statusLabels[task.status] ??
                                                  task.status,
                                              style: TextStyle(
                                                color: AppColors.statusColor(
                                                    task.status),
                                                fontSize: 11,
                                                fontWeight: FontWeight.w800,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),

                                  // ── Title & Description ──
                                  Text(
                                    task.title,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: -0.3,
                                      color: AppColors.foreground,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    task.displayDescription,
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: AppColors.mutedForeground,
                                          fontSize: 13,
                                          height: 1.35,
                                        ),
                                  ),

                                  // ── Report Photos Gallery ──
                                  if (task.images
                                      .where((i) => i.type == "REPORT")
                                      .isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    SizedBox(
                                      height: 84,
                                      child: ListView.separated(
                                        scrollDirection: Axis.horizontal,
                                        itemCount: task.images
                                            .where((i) => i.type == "REPORT")
                                            .length,
                                        separatorBuilder: (_, __) =>
                                            const SizedBox(width: 8),
                                        itemBuilder: (context, idx) {
                                          final image = task.images
                                              .where((i) => i.type == "REPORT")
                                              .elementAt(idx);
                                          return ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            child: Image.network(
                                              image.imageUrl,
                                              width: 84,
                                              height: 84,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) =>
                                                  Container(
                                                width: 84,
                                                height: 84,
                                                color: AppColors.muted,
                                                child: const Icon(
                                                  Icons.broken_image_rounded,
                                                  color: AppColors
                                                      .mutedForeground,
                                                ),
                                              ),
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ],

                                  // ── Address & Created Meta ──
                                  const SizedBox(height: 12),
                                  if ((task.address ?? "").isNotEmpty) ...[
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Icon(
                                          Icons.location_on_outlined,
                                          size: 15,
                                          color: AppColors.mutedForeground,
                                        ),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            task.address!,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.mutedForeground,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                  ],
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.access_time_rounded,
                                        size: 14,
                                        color: AppColors.mutedForeground,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        _dateFormat.format(task.createdAt),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppColors.mutedForeground,
                                        ),
                                      ),
                                    ],
                                  ),

                                  // ── Action Buttons Row ──
                                  const SizedBox(height: 14),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          onPressed: () => _openRouteMap(task),
                                          icon: const Icon(
                                            Icons.navigation_rounded,
                                            size: 16,
                                          ),
                                          label: const Text("Navigate Route"),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppColors.primary,
                                            foregroundColor: Colors.white,
                                            elevation: 0,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 11,
                                            ),
                                            textStyle: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                      ),
                                      if (task.status == "IN_PROGRESS") ...[
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: OutlinedButton.icon(
                                            onPressed: () =>
                                                _uploadCleanupPhoto(task.id),
                                            icon: const Icon(
                                              Icons.camera_alt_outlined,
                                              size: 18,
                                            ),
                                            label: const Text("Upload Photo"),
                                            style: OutlinedButton.styleFrom(
                                              foregroundColor: AppColors.primary,
                                              side: BorderSide(
                                                color: AppColors.primary
                                                    .withValues(alpha: 0.4),
                                              ),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                vertical: 11,
                                              ),
                                              textStyle: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),

                                  // ── Cleanup Proof Photos Gallery ──
                                  if (task.status == "IN_PROGRESS") ...[
                                    const SizedBox(height: 10),
                                    if (needsCleanupPhoto)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.tint(
                                              AppColors.warning,
                                              opacity: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: const Row(
                                          children: [
                                            Icon(
                                              Icons.info_outline_rounded,
                                              size: 14,
                                              color: AppColors.warning,
                                            ),
                                            SizedBox(width: 6),
                                            Expanded(
                                              child: Text(
                                                "Upload a cleanup photo to enable completion.",
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  color: AppColors.warning,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      )
                                    else
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              const Icon(
                                                Icons.check_circle_rounded,
                                                size: 14,
                                                color: AppColors.success,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                "Cleanup proof photo attached ($cleanupCount)",
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                  color: AppColors.success,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          SizedBox(
                                            height: 60,
                                            child: ListView.separated(
                                              scrollDirection: Axis.horizontal,
                                              itemCount: cleanupCount,
                                              separatorBuilder: (_, __) =>
                                                  const SizedBox(width: 6),
                                              itemBuilder: (context, idx) {
                                                final image = cleanupImages[idx];
                                                return ClipRRect(
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  child: Image.network(
                                                    image.imageUrl,
                                                    width: 60,
                                                    height: 60,
                                                    fit: BoxFit.cover,
                                                  ),
                                                );
                                              },
                                            ),
                                          ),
                                        ],
                                      ),
                                  ],

                                  // ── Status Transition Action ──
                                  if (actions.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    ...actions.map((action) {
                                      final isDisabled =
                                          action.requiresCleanupPhoto &&
                                              cleanupCount == 0;
                                      return SizedBox(
                                        width: double.infinity,
                                        child: FilledButton.icon(
                                          onPressed: isDisabled
                                              ? null
                                              : () => _updateStatus(
                                                    task,
                                                    action.nextStatus,
                                                  ),
                                          icon: Icon(
                                            action.nextStatus == "CLEANED"
                                                ? Icons.check_circle_rounded
                                                : Icons.play_arrow_rounded,
                                            size: 18,
                                          ),
                                          label: Text(action.label),
                                          style: FilledButton.styleFrom(
                                            backgroundColor:
                                                action.nextStatus == "CLEANED"
                                                    ? AppColors.success
                                                    : AppColors.primary,
                                            disabledBackgroundColor:
                                                AppColors.muted,
                                            disabledForegroundColor:
                                                AppColors.mutedForeground,
                                            elevation: 0,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 12,
                                            ),
                                            textStyle: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w800,
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),

          // ── Route Map FAB ──
          Positioned(
            bottom: AppSpacing.md,
            right: AppSpacing.md,
            child: FloatingActionButton.extended(
              heroTag: "worker_route_fab",
              onPressed: () => _openRouteMap(),
              backgroundColor: AppColors.foreground,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.route_rounded),
              label: Text(
                "Full Route ($activeCount)",
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : AppColors.muted.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.mutedForeground,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _TaskAction {
  const _TaskAction({
    required this.label,
    required this.nextStatus,
    this.requiresCleanupPhoto = false,
  });

  final String label;
  final String nextStatus;
  final bool requiresCleanupPhoto;
}
