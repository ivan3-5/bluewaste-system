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
            limit: 50,
          );

      if (!mounted) {
        return;
      }

      setState(() {
        _tasks = result.data;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
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
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content:
                Text("Status updated to ${statusLabels[status] ?? status}.")),
      );
      await _loadTasks();
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  Future<void> _uploadCleanupPhoto(String reportId) async {
    final photo =
        await _picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (photo == null) {
      return;
    }

    try {
      await ref.read(reportServiceProvider).uploadReportImages(
            reportId: reportId,
            images: [photo],
            type: "CLEANUP",
          );
      if (!mounted) {
        return;
      }
      await _loadTasks();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Cleanup photo uploaded.")),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  List<_TaskAction> _actionsForStatus(String status) {
    switch (status) {
      case "VERIFIED":
      case "CLEANUP_SCHEDULED":
        return const [
          _TaskAction(label: "Start Work", nextStatus: "IN_PROGRESS"),
        ];
      case "IN_PROGRESS":
        return const [
          _TaskAction(
            label: "Mark Cleaned",
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
      return const Center(child: CircularProgressIndicator());
    }

    if (_tasks.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadTasks,
        child: ListView(
          children: const [
            SizedBox(height: 140),
            AppEmptyState(
              icon: Icons.assignment_outlined,
              title: "No assigned tasks",
              subtitle: "New assignments will appear here.",
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadTasks,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.sm,
          AppSpacing.md,
          AppSpacing.md,
        ),
        itemCount: _tasks.length,
        itemBuilder: (context, index) {
          final task = _tasks[index];
          final actions = _actionsForStatus(task.status);
          final statusColor = AppColors.statusColor(task.status);
          final categoryColor = AppColors.categoryColor(task.category);
          final cleanupCount =
              task.images.where((image) => image.type == "CLEANUP").length;
          final needsCleanupPhoto =
              task.status == "IN_PROGRESS" && cleanupCount == 0;

          return Card(
            margin: const EdgeInsets.only(bottom: AppSpacing.xs),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(task.description,
                      maxLines: 3, overflow: TextOverflow.ellipsis),
                  if (task.images.where((i) => i.type == "REPORT").isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    SizedBox(
                      height: 80,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: task.images.where((i) => i.type == "REPORT").length,
                        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
                        itemBuilder: (context, index) {
                          final image = task.images
                              .where((i) => i.type == "REPORT")
                              .elementAt(index);
                          return ClipRRect(
                            borderRadius: BorderRadius.circular(AppSpacing.xs),
                            child: Image.network(
                              image.imageUrl,
                              width: 80,
                              height: 80,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                width: 80,
                                height: 80,
                                color: Colors.grey[200],
                                child: const Icon(Icons.broken_image, color: Colors.grey),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.sm),
                  Wrap(
                    spacing: AppSpacing.xs,
                    runSpacing: AppSpacing.xs,
                    children: [
                      AppStatusPill(
                        label: statusLabels[task.status] ?? task.status,
                        color: statusColor,
                      ),
                      AppStatusPill(
                        label:
                            wasteCategoryLabels[task.category] ?? task.category,
                        color: categoryColor,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    "Created: ${_dateFormat.format(task.createdAt)}",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.mutedForeground,
                        ),
                  ),
                  if ((task.address ?? "").isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      "Address: ${task.address}",
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                  if (actions.isNotEmpty || task.status == "IN_PROGRESS")
                    const SizedBox(height: AppSpacing.sm),
                  if (actions.isNotEmpty)
                    Wrap(
                      spacing: AppSpacing.xs,
                      children: actions.map(
                        (action) {
                          final isDisabled =
                              action.requiresCleanupPhoto && cleanupCount == 0;
                          return FilledButton.tonal(
                            onPressed: isDisabled
                                ? null
                                : () => _updateStatus(
                                      task,
                                      action.nextStatus,
                                    ),
                            child: Text(action.label),
                          );
                        },
                      ).toList(growable: false),
                    ),
                  if (task.status == "IN_PROGRESS") ...[
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      cleanupCount == 0
                          ? "Cleanup photos: none yet"
                          : "Cleanup photos: $cleanupCount",
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: cleanupCount == 0
                                ? AppColors.mutedForeground
                                : AppColors.success,
                          ),
                    ),
                    if (cleanupCount > 0) ...[
                      const SizedBox(height: AppSpacing.sm),
                      SizedBox(
                        height: 80,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: cleanupCount,
                          separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
                          itemBuilder: (context, index) {
                            final image = task.images
                                .where((i) => i.type == "CLEANUP")
                                .elementAt(index);
                            return ClipRRect(
                              borderRadius: BorderRadius.circular(AppSpacing.xs),
                              child: Image.network(
                                image.imageUrl,
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  width: 80,
                                  height: 80,
                                  color: Colors.grey[200],
                                  child: const Icon(Icons.broken_image, color: Colors.grey),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                    if (needsCleanupPhoto) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        "Upload a cleanup photo to mark as cleaned.",
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.mutedForeground,
                            ),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.xs),
                    OutlinedButton.icon(
                      onPressed: () => _uploadCleanupPhoto(task.id),
                      icon: const Icon(Icons.photo_camera_outlined),
                      label: const Text("Upload Cleanup Photo"),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
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
