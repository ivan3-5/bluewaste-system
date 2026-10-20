import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../../core/theme/app_colors.dart";
import "../../../../core/theme/app_spacing.dart";
import "../../data/offline_service.dart";

/// Shown while reports saved offline are waiting to upload.
class PendingReportsBanner extends ConsumerStatefulWidget {
  const PendingReportsBanner({super.key});

  @override
  ConsumerState<PendingReportsBanner> createState() =>
      _PendingReportsBannerState();
}

class _PendingReportsBannerState extends ConsumerState<PendingReportsBanner> {
  bool _busy = false;

  void _toast(String message, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? AppColors.destructive : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _run(Future<SyncResult> Function() action) async {
    setState(() => _busy = true);
    try {
      final result = await action();
      if (result.offline) {
        _toast(
          "You're offline. Reports will upload when you reconnect.",
          error: true,
        );
      } else if (result.uploaded > 0 && result.remaining + result.failed == 0) {
        _toast(
          result.uploaded == 1
              ? "Report uploaded and confirmed on the server."
              : "${result.uploaded} reports uploaded and confirmed on the server.",
        );
      } else if (result.uploaded > 0) {
        _toast(
          "${result.uploaded} uploaded, ${result.remaining + result.failed} still pending.",
        );
      } else if (result.failed > 0) {
        _toast(
          result.lastError ?? "Some reports could not be uploaded.",
          error: true,
        );
      } else if (result.lastError != null) {
        _toast(
          "Upload failed: ${result.lastError}. Will retry automatically.",
          error: true,
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _discard() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Discard failed reports?"),
        content: const Text(
          "These reports and their photos will be deleted from this phone and will not be uploaded.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text("Cancel"),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.destructive,
            ),
            child: const Text("Discard"),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(offlineServiceProvider).discardFailed();
    }
  }

  @override
  Widget build(BuildContext context) {
    final summary =
        ref.watch(queueSummaryProvider).valueOrNull ?? const QueueSummary();
    if (summary.total == 0) return const SizedBox.shrink();

    final theme = Theme.of(context);
    final hasFailed = summary.failed > 0;
    final accent = hasFailed ? AppColors.destructive : AppColors.warning;
    final title = hasFailed
        ? (summary.failed == 1
              ? "1 report couldn't upload"
              : "${summary.failed} reports couldn't upload")
        : (summary.pending == 1
              ? "1 report waiting to upload"
              : "${summary.pending} reports waiting to upload");
    final subtitle = hasFailed
        ? (summary.lastError ?? "Retry, or discard it from this phone.")
        : "Saved on this phone. Uploads automatically when online.";

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.xs,
        AppSpacing.md,
        0,
      ),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.sm,
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.tint(accent, opacity: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  hasFailed
                      ? Icons.error_outline_rounded
                      : Icons.cloud_upload_outlined,
                  size: 20,
                  color: accent,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.xs),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  OutlinedButton(
                    onPressed: _busy
                        ? null
                        : () => _run(
                            hasFailed
                                ? ref.read(offlineServiceProvider).retryFailed
                                : ref
                                      .read(offlineServiceProvider)
                                      .syncOfflineReports,
                          ),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 36),
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                      ),
                    ),
                    child: _busy
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(hasFailed ? "Retry" : "Sync now"),
                  ),
                  if (hasFailed)
                    TextButton(
                      onPressed: _busy ? null : _discard,
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.destructive,
                        minimumSize: const Size(0, 32),
                      ),
                      child: const Text("Discard"),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
