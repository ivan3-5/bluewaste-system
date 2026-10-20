import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../../core/theme/app_colors.dart";
import "../../data/offline_service.dart";

/// Shown while reports saved offline are waiting to upload.
class PendingReportsBanner extends ConsumerStatefulWidget {
  const PendingReportsBanner({super.key});

  @override
  ConsumerState<PendingReportsBanner> createState() =>
      _PendingReportsBannerState();
}

class _PendingReportsBannerState extends ConsumerState<PendingReportsBanner> {
  bool _syncing = false;

  Future<void> _syncNow() async {
    setState(() => _syncing = true);
    try {
      await ref.read(offlineServiceProvider).syncOfflineReports();
    } finally {
      if (mounted) setState(() => _syncing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final count = ref.watch(pendingReportCountProvider).valueOrNull ?? 0;
    if (count == 0) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.cloud_upload_outlined,
            size: 20,
            color: AppColors.warning,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              count == 1
                  ? "1 report saved on this phone. It will upload when you're back online."
                  : "$count reports saved on this phone. They will upload when you're back online.",
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          TextButton(
            onPressed: _syncing ? null : _syncNow,
            child: _syncing
                ? const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text("Sync now"),
          ),
        ],
      ),
    );
  }
}
