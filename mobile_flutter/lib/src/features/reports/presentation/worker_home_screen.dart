import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:intl/intl.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../auth/presentation/auth_controller.dart";
import "../../notifications/presentation/notification_providers.dart";
import "../../profile/presentation/profile_screen.dart";
import "../data/report_service.dart";
import "../domain/report_models.dart";

final workerAssignedReportsProvider =
    FutureProvider.autoDispose<List<ReportRecord>>((ref) async {
  final service = ref.watch(reportServiceProvider);
  final result = await service.getAssignedReports(page: 1, limit: 100);
  return result.data;
});

class WorkerHomeScreen extends ConsumerWidget {
  const WorkerHomeScreen({
    super.key,
    required this.onSelectTab,
  });

  final ValueChanged<int> onSelectTab;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final firstName = (user?.firstName ?? "").trim();
    final greetingName = firstName.isNotEmpty ? firstName : "Worker";
    final reportsAsync = ref.watch(workerAssignedReportsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(workerAssignedReportsProvider);
        ref.invalidate(unreadCountProvider);
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        children: [
          _WorkerHeroHeader(
            name: greetingName,
            reportsAsync: reportsAsync,
          ),
          const SizedBox(height: AppSpacing.md),
          _ActiveTaskPreviewCard(
            reportsAsync: reportsAsync,
            onSelectTab: onSelectTab,
          ),
          const SizedBox(height: AppSpacing.lg),
          const _SectionHeader(
            title: "Quick Actions",
            subtitle: "Manage your assigned tasks and updates",
          ),
          const SizedBox(height: AppSpacing.sm),
          _QuickActionsGrid(
            onSelectTab: onSelectTab,
            reportsAsync: reportsAsync,
          ),
          const SizedBox(height: AppSpacing.lg),
          const _WorkerTipCard(),
          const SizedBox(height: AppSpacing.md),
        ],
      ),
    );
  }
}

class _WorkerHeroHeader extends StatelessWidget {
  const _WorkerHeroHeader({
    required this.name,
    required this.reportsAsync,
  });

  final String name;
  final AsyncValue<List<ReportRecord>> reportsAsync;

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat("EEE, MMM d").format(DateTime.now());

    int totalCount = 0;
    int pendingCount = 0;
    int cleanedCount = 0;

    final hasData = reportsAsync.when(
      data: (reports) {
        totalCount = reports.length;
        cleanedCount = reports.where((r) => r.status == "CLEANED").length;
        pendingCount = totalCount - cleanedCount;
        return true;
      },
      loading: () => false,
      error: (_, __) => false,
    );

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0F172A),
            Color(0xFF1E293B),
            Color(0xFF0066CC),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0066CC).withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.05),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFF34D399).withValues(alpha: 0.4),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF34D399),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            "ACTIVE SHIFT",
                            style: TextStyle(
                              color: Color(0xFF34D399),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      dateStr,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Hello, $name 🛠️",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Ready to tackle cleanup operations today?",
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.15),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _StatItem(
                        label: "Assigned",
                        value: hasData ? "$totalCount" : "-",
                        icon: Icons.assignment_rounded,
                      ),
                      Container(
                        width: 1,
                        height: 24,
                        color: Colors.white.withValues(alpha: 0.2),
                      ),
                      _StatItem(
                        label: "Pending",
                        value: hasData ? "$pendingCount" : "-",
                        icon: Icons.pending_actions_rounded,
                        accentColor: Colors.amberAccent,
                      ),
                      Container(
                        width: 1,
                        height: 24,
                        color: Colors.white.withValues(alpha: 0.2),
                      ),
                      _StatItem(
                        label: "Cleaned",
                        value: hasData ? "$cleanedCount" : "-",
                        icon: Icons.check_circle_rounded,
                        accentColor: const Color(0xFF34D399),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
    this.accentColor,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color? accentColor;

  @override
  Widget build(BuildContext context) {
    final iconColor = accentColor ?? Colors.white;
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: iconColor),
            const SizedBox(width: 4),
            Text(
              value,
              style: TextStyle(
                color: accentColor ?? Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.75),
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _ActiveTaskPreviewCard extends StatelessWidget {
  const _ActiveTaskPreviewCard({
    required this.reportsAsync,
    required this.onSelectTab,
  });

  final AsyncValue<List<ReportRecord>> reportsAsync;
  final ValueChanged<int> onSelectTab;

  @override
  Widget build(BuildContext context) {
    return reportsAsync.when(
      data: (reports) {
        final pendingReports =
            reports.where((r) => r.status != "CLEANED").toList();

        if (pendingReports.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.tint(AppColors.success, opacity: 0.08),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: AppColors.success.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.verified_rounded,
                    color: AppColors.success,
                    size: 22,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "All Tasks Completed 🎉",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.foreground,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "No pending cleanup tasks currently assigned to you.",
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.mutedForeground,
                              fontSize: 12,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        final topReport = pendingReports.first;
        return Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
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
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.tint(AppColors.warning, opacity: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.priority_high_rounded,
                          color: AppColors.warning,
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        "Next Task Priority",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.foreground,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.statusColor(topReport.status)
                          .withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      topReport.status.replaceAll("_", " "),
                      style: TextStyle(
                        color: AppColors.statusColor(topReport.status),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                topReport.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if ((topReport.address ?? "").isNotEmpty) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 14,
                      color: AppColors.mutedForeground,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        topReport.address!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.mutedForeground,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => onSelectTab(1),
                      icon: const Icon(Icons.assignment_outlined, size: 16),
                      label: const Text("View Details"),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        textStyle: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => onSelectTab(2),
                      icon: const Icon(Icons.navigation_rounded, size: 16),
                      label: const Text("Navigate Route"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        textStyle: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}

class _WorkerAction {
  const _WorkerAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.tabIndex,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final int tabIndex;
}

const List<_WorkerAction> _workerActions = [
  _WorkerAction(
    title: "My Tasks",
    subtitle: "View assigned work",
    icon: Icons.assignment_rounded,
    color: AppColors.primary,
    tabIndex: 1,
  ),
  _WorkerAction(
    title: "Assigned Map",
    subtitle: "Navigate reports",
    icon: Icons.map_rounded,
    color: AppColors.info,
    tabIndex: 2,
  ),
  _WorkerAction(
    title: "Alerts",
    subtitle: "Read notifications",
    icon: Icons.notifications_active_rounded,
    color: AppColors.warning,
    tabIndex: 4,
  ),
  _WorkerAction(
    title: "My Profile",
    subtitle: "Manage account",
    icon: Icons.person_rounded,
    color: AppColors.success,
    tabIndex: -1,
  ),
];

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
              ),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.mutedForeground,
                fontSize: 12,
              ),
        ),
      ],
    );
  }
}

class _QuickActionsGrid extends ConsumerWidget {
  const _QuickActionsGrid({
    required this.onSelectTab,
    required this.reportsAsync,
  });

  final ValueChanged<int> onSelectTab;
  final AsyncValue<List<ReportRecord>> reportsAsync;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingCount = reportsAsync.when(
      data: (reports) => reports.where((r) => r.status != "CLEANED").length,
      loading: () => 0,
      error: (_, __) => 0,
    );

    return GridView.builder(
      shrinkWrap: true,
      itemCount: _workerActions.length,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.sm,
        mainAxisSpacing: AppSpacing.sm,
        childAspectRatio: 1.25,
      ),
      itemBuilder: (context, index) {
        final action = _workerActions[index];
        return _QuickActionCard(
          action: action,
          pendingTasksCount: action.tabIndex == 1 ? pendingCount : 0,
          onTap: () {
            if (action.tabIndex < 0) {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const ProfileScreen(),
                ),
              );
            } else {
              onSelectTab(action.tabIndex);
            }
          },
        );
      },
    );
  }
}

class _QuickActionCard extends ConsumerWidget {
  const _QuickActionCard({
    required this.action,
    required this.onTap,
    this.pendingTasksCount = 0,
  });

  final _WorkerAction action;
  final VoidCallback onTap;
  final int pendingTasksCount;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadAlerts = action.tabIndex == 4
        ? (ref.watch(unreadCountProvider).value ?? 0)
        : 0;

    final badgeCount = action.tabIndex == 1 ? pendingTasksCount : unreadAlerts;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.025),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: AppColors.tint(action.color, opacity: 0.14),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(action.icon, size: 22, color: action.color),
                      ),
                      if (badgeCount > 0)
                        Positioned(
                          right: -4,
                          top: -4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            constraints: const BoxConstraints(
                                minWidth: 18, minHeight: 18),
                            decoration: BoxDecoration(
                              color: action.tabIndex == 1
                                  ? AppColors.primary
                                  : AppColors.destructive,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: AppColors.card,
                                width: 1.5,
                              ),
                            ),
                            child: Text(
                              badgeCount > 9 ? "9+" : "$badgeCount",
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: AppColors.muted.withValues(alpha: 0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.arrow_forward_rounded,
                      size: 14,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Text(
                action.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                action.subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.mutedForeground,
                      fontSize: 11,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WorkerTipCard extends StatelessWidget {
  const _WorkerTipCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.tint(AppColors.primary, opacity: 0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.18),
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: AppColors.tint(AppColors.primary, opacity: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lightbulb_rounded,
              color: AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      "Worker Tip",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.foreground,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 1.5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        "PRO TIP",
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  "Take clear cleanup photos, write brief completion notes, and update task statuses promptly to keep the community informed.",
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.mutedForeground,
                        fontSize: 12,
                        height: 1.35,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
