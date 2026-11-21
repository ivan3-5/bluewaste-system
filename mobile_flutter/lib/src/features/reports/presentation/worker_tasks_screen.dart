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
import "../data/offline_service.dart";
import "../../schedules/presentation/schedule_providers.dart";
import "widgets/pending_reports_banner.dart";
import "../data/detect_service.dart";
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
  int _tasksRequest = 0;
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
    final request = ++_tasksRequest;
    try {
      final result = await ref
          .read(reportServiceProvider)
          .getAssignedReports(page: 1, limit: 100);

      if (!mounted || request != _tasksRequest) return;

      final newTasks = result.data;
      if (!_loading && _signature(newTasks) == _signature(_tasks)) return;

      setState(() {
        _tasks = newTasks;
        _loading = false;
      });
    } catch (_) {
      if (!mounted || request != _tasksRequest) return;
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
      ref.invalidate(mySchedulesProvider);
      ref.invalidate(scheduleDetailProvider);
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
    if (_uploadingTaskIds.contains(reportId)) return;
    final remaining = _maxCleanupPhotos - existingCount;
    if (remaining <= 0) {
      _showSnack(
        "You have reached the limit of $_maxCleanupPhotos cleanup photos.",
        error: true,
      );
      return;
    }

    setState(() => _uploadingTaskIds.add(reportId));
    try {
      final source = await _chooseSource();
      if (source == null || !mounted) return;

      final List<XFile> photos;
      if (source == ImageSource.camera || remaining == 1) {
        final photo = await _picker.pickImage(source: source, imageQuality: 75);
        photos = photo == null ? const [] : [photo];
      } else {
        photos = await _picker.pickMultiImage(imageQuality: 75, limit: remaining);
      }
      if (photos.isEmpty || !mounted) return;

      final service = ref.read(offlineServiceProvider);
      final id = await service.queueCleanupPhotos(
        reportId,
        photos.take(remaining).map((photo) => photo.path).toList(),
      );
      await service.syncOfflineReports();
      final queued = (await service.getQueuedReports()).where((entry) => entry.id == id).firstOrNull;
      if (!mounted) return;
      if (queued == null) {
        HapticFeedback.mediumImpact();
        _showSnack("Cleanup photos uploaded. You can now mark the task as cleaned.");
      } else if (queued.failed) {
        _showSnack(queued.lastError ?? "Could not upload cleanup photos. Tap Retry to try again.", error: true);
      } else {
        _showSnack("Cleanup photos saved on this phone. They will upload when the server is reachable.");
      }
      await _refreshAll();
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
    ref.listen<int>(reportsSyncedProvider, (_, __) => _refreshAll());

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
              const PendingReportsBanner(cleanupPhotos: true),
              // ── Redesigned Compact Filter Bar & Progress ──
              _FilterSegmentBar(
                activeFilter: _activeFilter,
                totalCount: totalCount,
                activeCount: activeCount,
                cleanedCount: cleanedCount,
                completionRate: completionRate,
                onFilterChanged: (filter) {
                  setState(() => _activeFilter = filter);
                },
              ),
              const Divider(height: 1, color: AppColors.border),

              // ── Task List ──
              Expanded(
                child: displayTasks.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          const SizedBox(height: 60),
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
                            key: ValueKey(task.id),
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
// COMPACT & CONSISTENT FILTER SEGMENT BAR
// ─────────────────────────────────────────────────────────────────────────────

class _FilterSegmentBar extends StatelessWidget {
  const _FilterSegmentBar({
    required this.activeFilter,
    required this.totalCount,
    required this.activeCount,
    required this.cleanedCount,
    required this.completionRate,
    required this.onFilterChanged,
  });

  final String activeFilter;
  final int totalCount;
  final int activeCount;
  final int cleanedCount;
  final double completionRate;
  final ValueChanged<String> onFilterChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.xs,
        AppSpacing.md,
        AppSpacing.sm,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: AppColors.secondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.border.withValues(alpha: 0.6),
              ),
            ),
            child: Row(
              children: [
                _buildSegment(
                  id: "all",
                  label: "All",
                  count: totalCount,
                  isSelected: activeFilter == "all",
                ),
                _buildSegment(
                  id: "active",
                  label: "Active",
                  count: activeCount,
                  isSelected: activeFilter == "active",
                  badgeColor: activeCount > 0 ? AppColors.orange : null,
                ),
                _buildSegment(
                  id: "cleaned",
                  label: "Cleaned",
                  count: cleanedCount,
                  isSelected: activeFilter == "cleaned",
                  badgeColor: cleanedCount > 0 ? AppColors.success : null,
                ),
              ],
            ),
          ),
          if (totalCount > 0) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: completionRate,
                      minHeight: 3,
                      backgroundColor: AppColors.muted,
                      color: AppColors.success,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
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
    );
  }

  Widget _buildSegment({
    required String id,
    required String label,
    required int count,
    required bool isSelected,
    Color? badgeColor,
  }) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          HapticFeedback.selectionClick();
          onFilterChanged(id);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.card : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
            border: isSelected
                ? Border.all(color: AppColors.border.withValues(alpha: 0.8))
                : null,
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected
                      ? AppColors.foreground
                      : AppColors.mutedForeground,
                ),
              ),
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: badgeColor != null
                      ? badgeColor.withValues(alpha: 0.14)
                      : (isSelected
                          ? AppColors.secondary
                          : AppColors.card.withValues(alpha: 0.8)),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: badgeColor ??
                        (isSelected
                            ? AppColors.foreground
                            : AppColors.mutedForeground),
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
// REDESIGNED & COMPACT WORKER TASK CARD
// ─────────────────────────────────────────────────────────────────────────────

class _WorkerTaskCard extends StatelessWidget {
  const _WorkerTaskCard({
    super.key,
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
        return Icons.autorenew_rounded;
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

    final hasValidComment = task.displayDescription.trim().isNotEmpty &&
        task.displayDescription.trim().toLowerCase() != "none";

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm + 4),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCleaned
              ? AppColors.success.withValues(alpha: 0.25)
              : isInProgress
                  ? AppColors.warning.withValues(alpha: 0.3)
                  : AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top Header: Title & Single Status Badge ──
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    task.displayTitle,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.2,
                      color: AppColors.foreground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                // Status Pill (The single definitive status indicator)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                  decoration: BoxDecoration(
                    color: AppColors.tint(statusColor, opacity: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: statusColor.withValues(alpha: 0.25),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStatusIcon(status),
                        size: 12,
                        color: statusColor,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 6),

            // ── Metadata Tags: Category, Severity/Priority, Date ──
            Row(
              children: [
                // Category Pill
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getCategoryIcon(task.category),
                        size: 11,
                        color: categoryColor,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        categoryLabel,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: categoryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                if ((task.severity ?? "").isNotEmpty) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      WasteSeverity.fromString(task.severity).label,
                      style: const TextStyle(
                        color: AppColors.warning,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                Text(
                  dateFormat.format(task.createdAt),
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.mutedForeground,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // ── Compact Task Stepper (Assigned → In Progress → Cleaned) ──
            _CompactTaskStepper(status: status),

            const SizedBox(height: 10),

            // ── Citizen Comment (Rendered only if non-empty / meaningful) ──
            if (hasValidComment) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 1),
                      child: Icon(
                        Icons.chat_bubble_outline_rounded,
                        size: 12,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        task.displayDescription,
                        style: const TextStyle(
                          fontSize: 11,
                          fontStyle: FontStyle.italic,
                          color: AppColors.mutedForeground,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // ── Location ──
            if ((task.address ?? "").isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 13,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        task.address!,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.foreground,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // ── Reported Photos Gallery (Clean & Compact) ──
            if (reportImages.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.photo_outlined,
                          size: 12,
                          color: AppColors.mutedForeground,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          "Reported Photos (${reportImages.length})",
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    SizedBox(
                      height: 56,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: reportImages.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 6),
                        itemBuilder: (context, idx) {
                          final img = reportImages[idx];
                          return GestureDetector(
                            onTap: () => onOpenViewer(
                              reportImages,
                              idx,
                              "Report Photo",
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                width: 56,
                                height: 56,
                                color: AppColors.muted,
                                child: Image.network(
                                  img.imageUrl,
                                  width: 56,
                                  height: 56,
                                  fit: BoxFit.cover,
                                  loadingBuilder: (_, child, progress) =>
                                      progress == null
                                          ? child
                                          : const Center(
                                              child: SizedBox(
                                                width: 14,
                                                height: 14,
                                                child:
                                                    CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                ),
                                              ),
                                            ),
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(
                                      Icons.broken_image_outlined,
                                      size: 18,
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
                ),
              ),
            ],

            // ── Cleanup Section: Cleaned State ──
            if (isCleaned) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.tint(AppColors.success, opacity: 0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.success.withValues(alpha: 0.2),
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
                          size: 14,
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          "Cleaned & Verified",
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.success,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          dateFormat.format(task.updatedAt),
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                    if (cleanupImages.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      SizedBox(
                        height: 44,
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
                                borderRadius: BorderRadius.circular(6),
                                child: Image.network(
                                  img.imageUrl,
                                  width: 44,
                                  height: 44,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 44,
                                    height: 44,
                                    color: AppColors.muted,
                                    child: const Icon(
                                      Icons.broken_image_outlined,
                                      size: 14,
                                      color: AppColors.mutedForeground,
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
              ),
            ],

            // ── Cleanup Section: In-Progress State (Proof Photos & Requirement) ──
            if (isInProgress) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: hasNoCleanupPhotos
                      ? const Color(0xFFFFFBEB)
                      : const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: hasNoCleanupPhotos
                        ? const Color(0xFFFDE68A)
                        : const Color(0xFFBBF7D0),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          hasNoCleanupPhotos
                              ? Icons.warning_amber_rounded
                              : Icons.verified_outlined,
                          size: 14,
                          color: hasNoCleanupPhotos
                              ? const Color(0xFFD97706)
                              : const Color(0xFF16A34A),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            hasNoCleanupPhotos
                                ? "1+ proof photo required to mark cleaned"
                                : "Cleanup Proof ($cleanupCount/$_maxCleanupPhotos photos)",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: hasNoCleanupPhotos
                                  ? const Color(0xFF92400E)
                                  : const Color(0xFF166534),
                            ),
                          ),
                        ),
                        if (hasNoCleanupPhotos)
                          InkWell(
                            onTap: onUploadPhotos,
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: isUploading
                                  ? const SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 1.5,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.camera_alt_outlined,
                                          size: 11,
                                          color: Colors.white,
                                        ),
                                        SizedBox(width: 3),
                                        Text(
                                          "Add Photo",
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                      ],
                    ),
                    if (hasCleanupPhotos) ...[
                      const SizedBox(height: 6),
                      SizedBox(
                        height: 44,
                        child: Row(
                          children: [
                            Expanded(
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: cleanupCount,
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
                                      borderRadius: BorderRadius.circular(6),
                                      child: Image.network(
                                        img.imageUrl,
                                        width: 44,
                                        height: 44,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) =>
                                            Container(
                                          width: 44,
                                          height: 44,
                                          color: AppColors.muted,
                                          child: const Icon(
                                            Icons.broken_image_outlined,
                                            size: 14,
                                            color: AppColors.mutedForeground,
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            if (cleanupCount < _maxCleanupPhotos) ...[
                              const SizedBox(width: 6),
                              InkWell(
                                onTap: onUploadPhotos,
                                borderRadius: BorderRadius.circular(6),
                                child: Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFDCFCE7),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: const Color(0xFF16A34A)
                                          .withValues(alpha: 0.3),
                                    ),
                                  ),
                                  child: isUploading
                                      ? const Center(
                                          child: SizedBox(
                                            width: 12,
                                            height: 12,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 1.5,
                                            ),
                                          ),
                                        )
                                      : const Icon(
                                          Icons.add_a_photo_outlined,
                                          size: 16,
                                          color: Color(0xFF16A34A),
                                        ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],

            // ── Action Buttons ──
            if (isPendingStart) ...[
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 38,
                      child: OutlinedButton.icon(
                        onPressed: onNavigate,
                        icon: const Icon(Icons.near_me_rounded, size: 14),
                        label: const Text("Navigate"),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: BorderSide(
                            color: AppColors.primary.withValues(alpha: 0.3),
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: EdgeInsets.zero,
                          textStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 3,
                    child: SizedBox(
                      height: 38,
                      child: FilledButton.icon(
                        onPressed: onStartCleanup,
                        icon: const Icon(Icons.play_arrow_rounded, size: 16),
                        label: const Text("Start Cleanup"),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: EdgeInsets.zero,
                          textStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ] else if (isInProgress) ...[
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 38,
                      child: OutlinedButton.icon(
                        onPressed: onNavigate,
                        icon: const Icon(Icons.near_me_rounded, size: 14),
                        label: const Text("Navigate"),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: BorderSide(
                            color: AppColors.primary.withValues(alpha: 0.3),
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: EdgeInsets.zero,
                          textStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 3,
                    child: SizedBox(
                      height: 38,
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
                                size: 14,
                                color: AppColors.mutedForeground,
                              ),
                              label: const Text("Mark Cleaned"),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.mutedForeground,
                                side: const BorderSide(color: AppColors.border),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: EdgeInsets.zero,
                                textStyle: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            )
                          : FilledButton.icon(
                              onPressed: onMarkCleaned,
                              icon: const Icon(Icons.task_alt_rounded, size: 16),
                              label: const Text("Mark Cleaned ✓"),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.success,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: EdgeInsets.zero,
                                textStyle: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ] else if (isCleaned) ...[
              SizedBox(
                width: double.infinity,
                height: 34,
                child: OutlinedButton.icon(
                  onPressed: onNavigate,
                  icon: const Icon(Icons.near_me_outlined, size: 14),
                  label: const Text("View Route History"),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.mutedForeground,
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.zero,
                    textStyle: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPACT WORKFLOW STEP TRACKER (Assigned -> In Progress -> Cleaned)
// ─────────────────────────────────────────────────────────────────────────────

class _CompactTaskStepper extends StatelessWidget {
  const _CompactTaskStepper({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    int currentStep = 0;
    if (status == "IN_PROGRESS") {
      currentStep = 1;
    } else if (status == "CLEANED") {
      currentStep = 2;
    }

    return Row(
      children: [
        _buildStep(0, "Assigned", currentStep >= 0, currentStep == 0),
        _buildConnector(currentStep >= 1),
        _buildStep(1, "In Progress", currentStep >= 1, currentStep == 1),
        _buildConnector(currentStep >= 2),
        _buildStep(2, "Cleaned", currentStep >= 2, currentStep == 2),
      ],
    );
  }

  Widget _buildStep(
    int stepIndex,
    String title,
    bool isReached,
    bool isCurrent,
  ) {
    Color stepColor;
    if (isCurrent) {
      stepColor = stepIndex == 2
          ? AppColors.success
          : stepIndex == 1
              ? AppColors.orange
              : AppColors.primary;
    } else if (isReached) {
      stepColor = AppColors.success;
    } else {
      stepColor = AppColors.mutedForeground.withValues(alpha: 0.4);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isReached ? stepColor : Colors.transparent,
            border: Border.all(
              color: stepColor,
              width: 1.5,
            ),
          ),
          child: isReached && !isCurrent
              ? const Icon(Icons.check, size: 9, color: Colors.white)
              : (isCurrent
                  ? Center(
                      child: Container(
                        width: 4,
                        height: 4,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                        ),
                      ),
                    )
                  : null),
        ),
        const SizedBox(width: 4),
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
            color: isCurrent
                ? stepColor
                : (isReached
                    ? AppColors.foreground
                    : AppColors.mutedForeground),
          ),
        ),
      ],
    );
  }

  Widget _buildConnector(bool isActive) {
    return Expanded(
      child: Container(
        height: 1.5,
        margin: const EdgeInsets.symmetric(horizontal: 6),
        decoration: BoxDecoration(
          color: isActive ? AppColors.success : AppColors.border,
          borderRadius: BorderRadius.circular(1),
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
      itemCount: 4,
      itemBuilder: (_, __) {
        return Container(
          margin: const EdgeInsets.only(bottom: AppSpacing.sm + 4),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ShimmerBox(width: 130, height: 18, borderRadius: 6),
                  ShimmerBox(width: 70, height: 20, borderRadius: 8),
                ],
              ),
              SizedBox(height: 8),
              Row(
                children: [
                  ShimmerBox(width: 75, height: 16, borderRadius: 6),
                  SizedBox(width: 6),
                  ShimmerBox(width: 50, height: 16, borderRadius: 6),
                  Spacer(),
                  ShimmerBox(width: 90, height: 14, borderRadius: 4),
                ],
              ),
              SizedBox(height: 12),
              ShimmerBox(width: double.infinity, height: 14, borderRadius: 4),
              SizedBox(height: 12),
              ShimmerBox(width: 180, height: 14, borderRadius: 4),
              SizedBox(height: 12),
              Row(
                children: [
                  ShimmerBox(width: 56, height: 56, borderRadius: 8),
                  SizedBox(width: 6),
                  ShimmerBox(width: 56, height: 56, borderRadius: 8),
                ],
              ),
              SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: ShimmerBox(
                      width: double.infinity,
                      height: 38,
                      borderRadius: 10,
                    ),
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    flex: 3,
                    child: ShimmerBox(
                      width: double.infinity,
                      height: 38,
                      borderRadius: 10,
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
