import "dart:async";

import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:image_picker/image_picker.dart";
import "package:intl/intl.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../data/report_service.dart";
import "../domain/report_models.dart";
import "worker_home_screen.dart";
import "worker_route_screen.dart";

/// Bumped by the worker shell when a tab is selected so the (kept-alive)
/// tasks tab reloads instead of showing stale data.
final workerTasksRefreshProvider = StateProvider<int>((ref) => 0);

const int _maxCleanupPhotos = 5;

class WorkerTasksScreen extends ConsumerStatefulWidget {
  const WorkerTasksScreen({super.key});

  @override
  ConsumerState<WorkerTasksScreen> createState() => _WorkerTasksScreenState();
}

class _WorkerTasksScreenState extends ConsumerState<WorkerTasksScreen>
    with WidgetsBindingObserver {
  final DateFormat _dateFormat = DateFormat("MMM d, yyyy • h:mm a");
  final ImagePicker _picker = ImagePicker();

  List<ReportRecord> _tasks = const [];
  bool _loading = true;
  String _activeFilter = "all";
  Timer? _timer;
  final Set<String> _uploadingTaskIds = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadTasks();
    _startPolling();
  }

  void _startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _loadTasks());
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadTasks();
      _startPolling();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.hidden) {
      _timer?.cancel();
      _timer = null;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  /// Fingerprint of everything the task cards display, so a status change or
  /// new photo is detected (not just a change in list length or order).
  String _signature(List<ReportRecord> tasks) => tasks
      .map(
        (t) =>
            "${t.id}|${t.status}|${t.updatedAt.microsecondsSinceEpoch}|"
            "${t.images.map((i) => "${i.id}:${i.type}").join(",")}",
      )
      .join(";");

  Future<void> _loadTasks() async {
    try {
      final result = await ref
          .read(reportServiceProvider)
          .getAssignedReports(page: 1, limit: 100);

      if (!mounted) return;

      final newTasks = result.data;
      if (!_loading && _signature(newTasks) == _signature(_tasks)) return;

      setState(() {
        _tasks = newTasks;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  /// Reloads this tab and the home tab, which shares the same assigned data.
  Future<void> _refreshAll() async {
    ref.invalidate(workerAssignedReportsProvider);
    await _loadTasks();
  }

  Future<void> _updateStatus(ReportRecord report, String status) async {
    try {
      await ref
          .read(reportServiceProvider)
          .updateStatus(
            reportId: report.id,
            status: status,
            notes: "Updated from Flutter mobile app",
          );
      if (!mounted) return;

      HapticFeedback.mediumImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(
                Icons.check_circle_rounded,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  status == "CLEANED"
                      ? "Task marked as cleaned! Great job."
                      : "Status updated to ${statusLabels[status] ?? status}.",
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      await _refreshAll();
    } catch (error) {
      if (!mounted) return;
      _showSnack(error.toString(), error: true);
    }
  }

  Future<void> _confirmMarkCleaned(ReportRecord task) async {
    HapticFeedback.lightImpact();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.tint(AppColors.success, opacity: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.task_alt_rounded,
                color: AppColors.success,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                "Mark as Cleaned?",
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
              ),
            ),
          ],
        ),
        content: Text(
          "Confirm that \"${task.displayTitle}\" has been completely cleaned and all waste collected properly.",
          style: const TextStyle(
            color: AppColors.mutedForeground,
            fontSize: 14,
            height: 1.4,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text(
              "Cancel",
              style: TextStyle(color: AppColors.mutedForeground),
            ),
          ),
          FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.success,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            icon: const Icon(Icons.check_rounded, size: 18),
            label: const Text(
              "Yes, Mark Cleaned",
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _updateStatus(task, "CLEANED");
    }
  }

  void _showSnack(String message, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? AppColors.destructive : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<ImageSource?> _chooseSource() {
    HapticFeedback.lightImpact();
    return showModalBottomSheet<ImageSource>(
      context: context,
      showDragHandle: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            0,
            AppSpacing.md,
            AppSpacing.md,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Add Cleanup Proof Photos",
                style: Theme.of(ctx).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
              ),
              const SizedBox(height: 4),
              const Text(
                "Upload photos showing that the site has been thoroughly cleaned.",
                style: TextStyle(
                  color: AppColors.mutedForeground,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => Navigator.of(ctx).pop(ImageSource.camera),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.tint(AppColors.primary, opacity: 0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.15),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.photo_camera_rounded,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Take Photo",
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              "Capture new evidence with camera",
                              style: TextStyle(
                                color: AppColors.mutedForeground,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.mutedForeground,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => Navigator.of(ctx).pop(ImageSource.gallery),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.muted.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.secondaryForeground,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.photo_library_rounded,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Choose from Gallery",
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              "Select existing cleanup photos",
                              style: TextStyle(
                                color: AppColors.mutedForeground,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.mutedForeground,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  /// Lets the worker attach 1–5 cleanup photos in total per task.
  Future<void> _uploadCleanupPhotos(String reportId, int existingCount) async {
    final remaining = _maxCleanupPhotos - existingCount;
    if (remaining <= 0) {
      _showSnack(
        "You have reached the limit of $_maxCleanupPhotos cleanup photos.",
        error: true,
      );
      return;
    }

    final source = await _chooseSource();
    if (source == null || !mounted) return;

    List<XFile> photos;
    if (source == ImageSource.camera) {
      final photo = await _picker.pickImage(source: source, imageQuality: 75);
      photos = photo == null ? const [] : [photo];
    } else if (remaining == 1) {
      final photo = await _picker.pickImage(source: source, imageQuality: 75);
      photos = photo == null ? const [] : [photo];
    } else {
      photos = await _picker.pickMultiImage(imageQuality: 75, limit: remaining);
    }
    if (photos.isEmpty || !mounted) return;

    final overLimit = photos.length > remaining;
    if (overLimit) photos = photos.sublist(0, remaining);

    setState(() => _uploadingTaskIds.add(reportId));
    try {
      await ref.read(reportServiceProvider).uploadReportImages(
            reportId: reportId,
            images: photos,
            type: "CLEANUP",
          );
      if (!mounted) return;
      await _refreshAll();
      if (!mounted) return;

      final count = photos.length;
      HapticFeedback.mediumImpact();
      _showSnack(
        overLimit
            ? "Uploaded $count photos (limit is $_maxCleanupPhotos per task)."
            : count == 1
                ? "Cleanup proof photo uploaded successfully! Ready to complete."
                : "$count cleanup proof photos uploaded! Ready to complete.",
      );
    } catch (error) {
      if (!mounted) return;
      _showSnack(error.toString(), error: true);
    } finally {
      if (mounted) setState(() => _uploadingTaskIds.remove(reportId));
    }
  }

  void _openRouteMap([ReportRecord? targetReport]) {
    HapticFeedback.lightImpact();
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (_) => Scaffold(
          appBar: AppBar(
            title: Text(
              targetReport != null
                  ? "Route to ${targetReport.displayTitle}"
                  : "Route Map",
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
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
        builder: (_) => _ImageViewerDialog(
          images: images,
          initialIndex: initialIndex,
          title: title,
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

  @override
  Widget build(BuildContext context) {
    ref.listen<int>(workerTasksRefreshProvider, (_, __) => _loadTasks());

    if (_loading) {
      return const _TasksSkeletonLoader();
    }

    final activeCount = _tasks.where((t) => t.status != "CLEANED").length;
    final cleanedCount = _tasks.where((t) => t.status == "CLEANED").length;
    final totalCount = _tasks.length;
    final displayTasks = _filteredTasks;
    final completionRate =
        totalCount > 0 ? (cleanedCount / totalCount).clamp(0.0, 1.0) : 0.0;

    return RefreshIndicator(
      onRefresh: _refreshAll,
      color: AppColors.primary,
      child: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: Column(
            children: [
              // ── Filter Segment Bar & Quick Stats ──
              Container(
                color: AppColors.card,
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.xs,
                  AppSpacing.md,
                  AppSpacing.sm,
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        _FilterChip(
                          label: "All",
                          count: totalCount,
                          isSelected: _activeFilter == "all",
                          onTap: () {
                            HapticFeedback.selectionClick();
                            setState(() => _activeFilter = "all");
                          },
                        ),
                        const SizedBox(width: 8),
                        _FilterChip(
                          label: "Active",
                          count: activeCount,
                          dotColor: AppColors.orange,
                          isSelected: _activeFilter == "active",
                          onTap: () {
                            HapticFeedback.selectionClick();
                            setState(() => _activeFilter = "active");
                          },
                        ),
                        const SizedBox(width: 8),
                        _FilterChip(
                          label: "Cleaned",
                          count: cleanedCount,
                          dotColor: AppColors.success,
                          isSelected: _activeFilter == "cleaned",
                          onTap: () {
                            HapticFeedback.selectionClick();
                            setState(() => _activeFilter = "cleaned");
                          },
                        ),
                      ],
                    ),
                    if (totalCount > 0) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(999),
                              child: LinearProgressIndicator(
                                value: completionRate,
                                minHeight: 4,
                                backgroundColor:
                                    AppColors.muted.withValues(alpha: 0.8),
                                color: AppColors.success,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            "$cleanedCount of $totalCount completed (${(completionRate * 100).toInt()}%)",
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.mutedForeground,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.border),

              // ── Task List ──
              Expanded(
                child: displayTasks.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          const SizedBox(height: 80),
                          AppEmptyState(
                            icon: _activeFilter == "cleaned"
                                ? Icons.task_alt_rounded
                                : Icons.assignment_outlined,
                            title: _activeFilter == "cleaned"
                                ? "No cleaned tasks yet"
                                : _activeFilter == "active"
                                    ? "All caught up!"
                                    : "No assigned tasks",
                            subtitle: _activeFilter == "cleaned"
                                ? "Tasks marked as cleaned will be displayed here."
                                : _activeFilter == "active"
                                    ? "There are no pending cleanup tasks assigned to you."
                                    : "Assignments from administrators will appear here.",
                            action: OutlinedButton.icon(
                              onPressed: _refreshAll,
                              icon: const Icon(Icons.refresh_rounded, size: 16),
                              label: const Text("Refresh"),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        ],
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md,
                          AppSpacing.md,
                          AppSpacing.md,
                          AppSpacing.xl,
                        ),
                        itemCount: displayTasks.length,
                        itemBuilder: (context, index) {
                          final task = displayTasks[index];
                          final cleanupImages = task.images
                              .where((image) => image.type == "CLEANUP")
                              .toList();
                          final reportImages = task.images
                              .where((image) => image.type == "REPORT")
                              .toList();
                          final cleanupCount = cleanupImages.length;
                          final isUploading =
                              _uploadingTaskIds.contains(task.id);

                          return _WorkerTaskCard(
                            task: task,
                            reportImages: reportImages,
                            cleanupImages: cleanupImages,
                            cleanupCount: cleanupCount,
                            isUploading: isUploading,
                            dateFormat: _dateFormat,
                            onNavigate: () => _openRouteMap(task),
                            onUploadPhotos: () => _uploadCleanupPhotos(
                              task.id,
                              cleanupCount,
                            ),
                            onStartCleanup: () =>
                                _updateStatus(task, "IN_PROGRESS"),
                            onMarkCleaned: () => _confirmMarkCleaned(task),
                            onOpenViewer: _openImageViewer,
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED TASK CARD
// ─────────────────────────────────────────────────────────────────────────────

class _WorkerTaskCard extends StatelessWidget {
  const _WorkerTaskCard({
    required this.task,
    required this.reportImages,
    required this.cleanupImages,
    required this.cleanupCount,
    required this.isUploading,
    required this.dateFormat,
    required this.onNavigate,
    required this.onUploadPhotos,
    required this.onStartCleanup,
    required this.onMarkCleaned,
    required this.onOpenViewer,
  });

  final ReportRecord task;
  final List<ReportImage> reportImages;
  final List<ReportImage> cleanupImages;
  final int cleanupCount;
  final bool isUploading;
  final DateFormat dateFormat;
  final VoidCallback onNavigate;
  final VoidCallback onUploadPhotos;
  final VoidCallback onStartCleanup;
  final VoidCallback onMarkCleaned;
  final void Function(List<ReportImage> images, int initialIndex, String title)
      onOpenViewer;

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case "plastic_waste":
      case "plastic_bottle":
      case "plastic_bag":
      case "cup":
      case "bowl":
        return Icons.recycling_rounded;
      case "organic_waste":
      case "organic":
        return Icons.eco_rounded;
      case "glass_waste":
      case "glass":
        return Icons.wine_bar_rounded;
      case "metal_waste":
      case "metal":
      case "can":
        return Icons.precision_manufacturing_rounded;
      case "paper_waste":
      case "paper":
        return Icons.description_rounded;
      case "battery":
        return Icons.battery_alert_rounded;
      case "fishing_net":
      case "rope":
        return Icons.waves_rounded;
      case "styrofoam":
        return Icons.inventory_2_outlined;
      case "with_waste":
        return Icons.delete_sweep_rounded;
      default:
        return Icons.delete_outline_rounded;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case "CLEANED":
        return Icons.check_circle_rounded;
      case "IN_PROGRESS":
        return Icons.run_circle_outlined;
      case "VERIFIED":
      case "CLEANUP_SCHEDULED":
        return Icons.schedule_rounded;
      case "REJECTED":
        return Icons.cancel_outlined;
      default:
        return Icons.pending_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = task.status;
    final isCleaned = status == "CLEANED";
    final isInProgress = status == "IN_PROGRESS";
    final isPendingStart =
        status == "VERIFIED" || status == "CLEANUP_SCHEDULED";
    final hasNoCleanupPhotos = isInProgress && cleanupCount == 0;
    final hasCleanupPhotos = isInProgress && cleanupCount > 0;

    final statusColor = AppColors.statusColor(status);
    final categoryColor = AppColors.categoryColor(task.category);
    final categoryLabel =
        wasteCategoryLabels[task.category] ?? task.category;
    final statusLabel = statusLabels[status] ?? status;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isCleaned
              ? AppColors.success.withValues(alpha: 0.3)
              : isInProgress
                  ? AppColors.orange.withValues(alpha: 0.3)
                  : AppColors.border,
          width: isCleaned || isInProgress ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header Bar ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Category Pill
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.tint(categoryColor, opacity: 0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getCategoryIcon(task.category),
                        size: 14,
                        color: categoryColor,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        categoryLabel,
                        style: TextStyle(
                          color: categoryColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),

                Row(
                  children: [
                    if ((task.severity ?? "").isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: task.severity == "CRITICAL"
                              ? AppColors.destructive.withValues(alpha: 0.12)
                              : AppColors.warning.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          task.severity!.toUpperCase(),
                          style: TextStyle(
                            color: task.severity == "CRITICAL"
                                ? AppColors.destructive
                                : AppColors.warning,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],

                    // Status Pill
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.tint(statusColor, opacity: 0.14),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: statusColor.withValues(alpha: 0.25),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getStatusIcon(status),
                            size: 13,
                            color: statusColor,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Workflow Step Progress Indicator ──
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _WorkflowStepTracker(status: status),
          ),

          const SizedBox(height: 10),

          // ── Title & Description ──
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.displayTitle,
                  style: const TextStyle(
                    fontSize: 17,
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
                  style: const TextStyle(
                    color: AppColors.mutedForeground,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          // ── Report Photos (Before Evidence) ──
          if (reportImages.isNotEmpty) ...[
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Icon(
                    Icons.photo_library_outlined,
                    size: 14,
                    color: AppColors.mutedForeground,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    "Reported Waste Photos (${reportImages.length})",
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 88,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: reportImages.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final img = reportImages[idx];
                  return GestureDetector(
                    onTap: () => onOpenViewer(reportImages, idx, "Report Photo"),
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            width: 88,
                            height: 88,
                            decoration: BoxDecoration(
                              color: AppColors.muted,
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Image.network(
                              img.imageUrl,
                              width: 88,
                              height: 88,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Center(
                                child: Icon(
                                  Icons.broken_image_rounded,
                                  color: AppColors.mutedForeground,
                                  size: 28,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 6,
                          right: 6,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.6),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(
                              Icons.zoom_in_rounded,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],

          // ── Location & Time Micro Card ──
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.muted.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  if ((task.address ?? "").isNotEmpty) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.location_on_rounded,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            task.address!,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.foreground,
                              height: 1.3,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                  Row(
                    children: [
                      const Icon(
                        Icons.access_time_rounded,
                        size: 14,
                        color: AppColors.mutedForeground,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        dateFormat.format(task.createdAt),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Required Action Alert: Missing Cleanup Photos ──
          if (hasNoCleanupPhotos) ...[
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB), // Amber 50
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFFFDE68A), // Amber 200
                    width: 1.2,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFEF3C7),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.warning_amber_rounded,
                        color: Color(0xFFD97706),
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Cleanup Proof Required",
                            style: TextStyle(
                              color: Color(0xFF92400E),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            "Attach 1 to 5 photos showing the cleaned location to unlock task completion.",
                            style: TextStyle(
                              color: Color(0xFFB45309),
                              fontSize: 12,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // ── Success State: Cleanup Photos Attached ──
          if (hasCleanupPhotos) ...[
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4), // Emerald 50
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFFBBF7D0), // Emerald 200
                    width: 1.2,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFDCFCE7),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.verified_rounded,
                            color: Color(0xFF16A34A),
                            size: 16,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Cleanup Proof Attached ($cleanupCount/$_maxCleanupPhotos)",
                            style: const TextStyle(
                              color: Color(0xFF166534),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        if (cleanupCount < _maxCleanupPhotos)
                          TextButton.icon(
                            onPressed: onUploadPhotos,
                            icon: const Icon(
                              Icons.add_a_photo_outlined,
                              size: 14,
                            ),
                            label: const Text(
                              "Add More",
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFF16A34A),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 64,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: cleanupCount,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, idx) {
                          final img = cleanupImages[idx];
                          return GestureDetector(
                            onTap: () => onOpenViewer(
                              cleanupImages,
                              idx,
                              "Cleanup Proof",
                            ),
                            child: Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Image.network(
                                    img.imageUrl,
                                    width: 64,
                                    height: 64,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  bottom: 4,
                                  right: 4,
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.black.withValues(alpha: 0.6),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Icon(
                                      Icons.zoom_in_rounded,
                                      color: Colors.white,
                                      size: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // ── Cleaned State Summary (Cleaned Task View) ──
          if (isCleaned) ...[
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.tint(AppColors.success, opacity: 0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.success.withValues(alpha: 0.25),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.task_alt_rounded,
                          color: AppColors.success,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            "Cleanup Completed & Verified",
                            style: TextStyle(
                              color: AppColors.success,
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        Text(
                          dateFormat.format(task.updatedAt),
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                    if (cleanupImages.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        "Cleanup Proof Evidence (${cleanupImages.length} photos)",
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.mutedForeground,
                        ),
                      ),
                      const SizedBox(height: 6),
                      SizedBox(
                        height: 56,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: cleanupImages.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: 6),
                          itemBuilder: (context, idx) {
                            final img = cleanupImages[idx];
                            return GestureDetector(
                              onTap: () => onOpenViewer(
                                cleanupImages,
                                idx,
                                "Cleanup Proof",
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  img.imageUrl,
                                  width: 56,
                                  height: 56,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],

          // ── Action Buttons ──
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                if (isPendingStart) ...[
                  // Start Cleanup Work Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton.icon(
                      onPressed: onStartCleanup,
                      icon: const Icon(Icons.play_arrow_rounded, size: 20),
                      label: const Text("Start Cleanup Work"),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: OutlinedButton.icon(
                      onPressed: onNavigate,
                      icon: const Icon(Icons.near_me_rounded, size: 18),
                      label: const Text("Navigate Route"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: BorderSide(
                          color: AppColors.primary.withValues(alpha: 0.3),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ] else if (isInProgress) ...[
                  Row(
                    children: [
                      // Navigate Route Button
                      Expanded(
                        child: SizedBox(
                          height: 46,
                          child: FilledButton.icon(
                            onPressed: onNavigate,
                            icon: const Icon(Icons.near_me_rounded, size: 18),
                            label: const Text("Navigate"),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              textStyle: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Add Photos Button
                      Expanded(
                        child: SizedBox(
                          height: 46,
                          child: OutlinedButton.icon(
                            onPressed: isUploading ||
                                    cleanupCount >= _maxCleanupPhotos
                                ? null
                                : onUploadPhotos,
                            icon: isUploading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Icon(
                                    Icons.camera_alt_rounded,
                                    size: 18,
                                  ),
                            label: Text(
                              isUploading
                                  ? "Uploading…"
                                  : "Add Photos ($cleanupCount/$_maxCleanupPhotos)",
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              side: BorderSide(
                                color: AppColors.primary.withValues(alpha: 0.4),
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              textStyle: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Mark Cleaned Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: hasNoCleanupPhotos
                        ? OutlinedButton.icon(
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text(
                                    "Please upload at least 1 cleanup proof photo before completing this task.",
                                  ),
                                  backgroundColor: AppColors.warning,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              );
                            },
                            icon: const Icon(
                              Icons.lock_outline_rounded,
                              size: 18,
                              color: AppColors.mutedForeground,
                            ),
                            label: const Text("Mark Cleaned (Proof Required)"),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.mutedForeground,
                              side: BorderSide(
                                color: AppColors.border.withValues(alpha: 0.8),
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              textStyle: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          )
                        : FilledButton.icon(
                            onPressed: onMarkCleaned,
                            icon: const Icon(
                              Icons.task_alt_rounded,
                              size: 20,
                            ),
                            label: const Text("Mark Cleaned ✓"),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.success,
                              foregroundColor: Colors.white,
                              elevation: 2,
                              shadowColor:
                                  AppColors.success.withValues(alpha: 0.4),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              textStyle: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                  ),
                ] else if (isCleaned) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: OutlinedButton.icon(
                      onPressed: onNavigate,
                      icon: const Icon(Icons.near_me_rounded, size: 16),
                      label: const Text("View Route History"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.mutedForeground,
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
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
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW STEP TRACKER (Assigned -> In Progress -> Cleaned)
// ─────────────────────────────────────────────────────────────────────────────

class _WorkflowStepTracker extends StatelessWidget {
  const _WorkflowStepTracker({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    int currentStep = 0;
    if (status == "IN_PROGRESS") {
      currentStep = 1;
    } else if (status == "CLEANED") {
      currentStep = 2;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.muted.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildStepItem(0, "Assigned", currentStep >= 0, currentStep == 0),
          _buildStepDivider(currentStep >= 1),
          _buildStepItem(1, "In Progress", currentStep >= 1, currentStep == 1),
          _buildStepDivider(currentStep >= 2),
          _buildStepItem(2, "Cleaned", currentStep >= 2, currentStep == 2),
        ],
      ),
    );
  }

  Widget _buildStepItem(
    int step,
    String label,
    bool isCompletedOrActive,
    bool isCurrent,
  ) {
    Color itemColor;
    if (isCurrent) {
      itemColor = step == 2
          ? AppColors.success
          : step == 1
              ? AppColors.orange
              : AppColors.primary;
    } else if (isCompletedOrActive) {
      itemColor = AppColors.success;
    } else {
      itemColor = AppColors.mutedForeground.withValues(alpha: 0.6);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: isCurrent || isCompletedOrActive
                ? itemColor
                : Colors.transparent,
            shape: BoxShape.circle,
            border: Border.all(color: itemColor, width: 1.5),
          ),
          child: isCompletedOrActive && !isCurrent
              ? const Icon(Icons.check, size: 9, color: Colors.white)
              : null,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
            color: itemColor,
          ),
        ),
      ],
    );
  }

  Widget _buildStepDivider(bool isActive) {
    return Expanded(
      child: Container(
        height: 1.5,
        margin: const EdgeInsets.symmetric(horizontal: 6),
        color: isActive
            ? AppColors.success
            : AppColors.mutedForeground.withValues(alpha: 0.2),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER CHIP
// ─────────────────────────────────────────────────────────────────────────────

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.count,
    required this.isSelected,
    required this.onTap,
    this.dotColor,
  });

  final String label;
  final int count;
  final bool isSelected;
  final VoidCallback onTap;
  final Color? dotColor;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.muted,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary
                  : AppColors.border.withValues(alpha: 0.6),
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (dotColor != null && !isSelected) ...[
                Container(
                  width: 6,
                  height: 6,
                  margin: const EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    color: dotColor,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.foreground,
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                ),
              ),
              const SizedBox(width: 5),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.22)
                      : AppColors.card,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.mutedForeground,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────

class _TasksSkeletonLoader extends StatelessWidget {
  const _TasksSkeletonLoader();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 3,
      itemBuilder: (_, __) {
        return Container(
          margin: const EdgeInsets.only(bottom: AppSpacing.md),
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  ShimmerBox(width: 90, height: 26, borderRadius: 14),
                  ShimmerBox(width: 80, height: 26, borderRadius: 14),
                ],
              ),
              const SizedBox(height: 14),
              const ShimmerBox(width: double.infinity, height: 24, borderRadius: 10),
              const SizedBox(height: 14),
              const ShimmerBox(width: 180, height: 18, borderRadius: 6),
              const SizedBox(height: 8),
              const ShimmerBox(width: double.infinity, height: 14, borderRadius: 6),
              const SizedBox(height: 6),
              const ShimmerBox(width: 220, height: 14, borderRadius: 6),
              const SizedBox(height: 14),
              Row(
                children: const [
                  ShimmerBox(width: 88, height: 88, borderRadius: 14),
                  SizedBox(width: 8),
                  ShimmerBox(width: 88, height: 88, borderRadius: 14),
                ],
              ),
              const SizedBox(height: 14),
              const ShimmerBox(width: double.infinity, height: 44, borderRadius: 12),
              const SizedBox(height: 12),
              Row(
                children: const [
                  Expanded(
                    child: ShimmerBox(
                      width: double.infinity,
                      height: 46,
                      borderRadius: 14,
                    ),
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: ShimmerBox(
                      width: double.infinity,
                      height: 46,
                      borderRadius: 14,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL-SCREEN IMAGE VIEWER
// ─────────────────────────────────────────────────────────────────────────────

class _ImageViewerDialog extends StatefulWidget {
  const _ImageViewerDialog({
    required this.images,
    this.initialIndex = 0,
    this.title = "Photo Preview",
  });

  final List<ReportImage> images;
  final int initialIndex;
  final String title;

  @override
  State<_ImageViewerDialog> createState() => _ImageViewerDialogState();
}

class _ImageViewerDialogState extends State<_ImageViewerDialog> {
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
    final currentImage =
        widget.images.isNotEmpty ? widget.images[_currentIndex] : null;
    final isCleanup = currentImage?.type == "CLEANUP";

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
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              "${_currentIndex + 1} of ${widget.images.length} • ${isCleanup ? 'Cleanup Proof' : 'Report Evidence'}",
              style: const TextStyle(color: Colors.white70, fontSize: 12),
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
