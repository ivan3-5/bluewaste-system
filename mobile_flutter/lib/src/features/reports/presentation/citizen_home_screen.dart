import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../../dashboard/data/dashboard_service.dart";
import "../../notifications/presentation/notification_providers.dart";
import "my_reports_screen.dart";
import "../../schedules/presentation/schedules_screen.dart";

class CitizenHomeScreen extends ConsumerWidget {
  const CitizenHomeScreen({
    super.key,
    required this.onSelectTab,
  });

  final ValueChanged<int> onSelectTab;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: AppSpacing.screen,
      children: [
        _DashboardStatsSection(),
        const SizedBox(height: AppSpacing.lg),
        const SizedBox(height: AppSpacing.lg),
        const _SectionHeader(
          title: "Quick Actions",
          subtitle: "Jump to the feature you need.",
        ),
        const SizedBox(height: AppSpacing.sm),
        GridView.builder(
          shrinkWrap: true,
          itemCount: _homeActions.length,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: AppSpacing.sm,
            mainAxisSpacing: AppSpacing.sm,
            childAspectRatio: 1.22,
          ),
          itemBuilder: (context, index) {
            final action = _homeActions[index];
            return _QuickActionCard(
              action: action,
              onTap: () {
                if (action.tabIndex == -1) {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => Scaffold(
                        appBar: AppBar(title: const Text("My Reports")),
                        body: const SafeArea(
                          child: MyReportsScreen(),
                        ),
                      ),
                    ),
                  );
                } else if (action.tabIndex == -2) {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const SchedulesScreen(),
                    ),
                  );
                } else {
                  onSelectTab(action.tabIndex);
                }
              },
            );
          },
        ),
        const SizedBox(height: AppSpacing.lg),
        const _TipCard(),
      ],
    );
  }
}

class _DashboardStatsSection extends ConsumerWidget {
  const _DashboardStatsSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(dashboardStatsProvider);

    return async.when(
      data: (stats) {
        return Row(
          children: [
            Expanded(
                child: _StatCard(
                    label: 'Total Reports',
                    value: stats.totalReports.toString(),
                    color: AppColors.primary)),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
                child: _StatCard(
                    label: 'Pending',
                    value: stats.pendingCount.toString(),
                    color: AppColors.warning)),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
                child: _StatCard(
                    label: 'Resolved',
                    value: stats.resolvedCount.toString(),
                    color: AppColors.success)),
          ],
        );
      },
      loading: () => const SizedBox(
          height: 64, child: Center(child: CircularProgressIndicator())),
      error: (e, st) => const SizedBox.shrink(),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard(
      {required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AppSectionCard(
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.tint(color),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.bar_chart, color: color),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: AppColors.mutedForeground)),
                const SizedBox(height: 6),
                Text(value,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w800)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeAction {
  const _HomeAction({
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

const List<_HomeAction> _homeActions = [
  _HomeAction(
    title: "Report",
    subtitle: "Create incident",
    icon: Icons.add_box_outlined,
    color: AppColors.primary,
    tabIndex: 1,
  ),
  _HomeAction(
    title: "My Reports",
    subtitle: "Track status",
    icon: Icons.assignment_turned_in_outlined,
    color: AppColors.success,
    tabIndex: -1,
  ),
  _HomeAction(
    title: "Map",
    subtitle: "View report pins",
    icon: Icons.map_outlined,
    color: AppColors.info,
    tabIndex: 2,
  ),
  _HomeAction(
    title: "Alerts",
    subtitle: "Read updates",
    icon: Icons.notifications_active_outlined,
    color: AppColors.warning,
    tabIndex: 3,
  ),
  _HomeAction(
    title: "Cleanups",
    subtitle: "Upcoming events",
    icon: Icons.calendar_month_outlined,
    color: AppColors.secondary,
    tabIndex: -2,
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
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: AppSpacing.xxs),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.mutedForeground,
              ),
        ),
      ],
    );
  }
}

class _QuickActionCard extends ConsumerWidget {
  const _QuickActionCard({required this.action, required this.onTap});

  final _HomeAction action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = action.tabIndex == 3
        ? (ref.watch(unreadCountProvider).value ?? 0)
        : 0;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Ink(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.tint(action.color),
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Icon(action.icon, size: 18, color: action.color),
                ),
                if (unreadCount > 0)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      decoration: BoxDecoration(
                        color: AppColors.destructive,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        unreadCount > 9 ? "9+" : "$unreadCount",
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
            const Spacer(),
            Text(
              action.title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Expanded(
                  child: Text(
                    action.subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.mutedForeground,
                        ),
                  ),
                ),
                const SizedBox(width: AppSpacing.xs),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 12,
                  color: AppColors.mutedForeground,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TipCard extends StatelessWidget {
  const _TipCard();

  @override
  Widget build(BuildContext context) {
    return AppSectionCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: AppColors.tint(AppColors.info),
            child: const Icon(Icons.lightbulb_outline, color: AppColors.info),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Community Tip",
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  "Use clear photos, include a nearby landmark, and keep the description short for faster validation.",
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.mutedForeground,
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
