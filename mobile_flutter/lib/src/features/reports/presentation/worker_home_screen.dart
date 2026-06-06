import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../../notifications/presentation/notification_providers.dart";
import "../../profile/presentation/profile_screen.dart";

class WorkerHomeScreen extends StatelessWidget {
  const WorkerHomeScreen({
    super.key,
    required this.onSelectTab,
  });

  final ValueChanged<int> onSelectTab;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppSpacing.screen,
      children: [
        const _SectionHeader(
          title: "Quick Actions",
          subtitle: "Manage your tasks and alerts.",
        ),
        const SizedBox(height: AppSpacing.sm),
        GridView.builder(
          shrinkWrap: true,
          itemCount: _workerActions.length,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: AppSpacing.sm,
            mainAxisSpacing: AppSpacing.sm,
            childAspectRatio: 1.22,
          ),
          itemBuilder: (context, index) {
            final action = _workerActions[index];
            return _QuickActionCard(
              action: action,
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
        ),
        const SizedBox(height: AppSpacing.lg),
        const _WorkerTipCard(),
      ],
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
    icon: Icons.assignment_outlined,
    color: AppColors.primary,
    tabIndex: 1,
  ),
  _WorkerAction(
    title: "Assigned Map",
    subtitle: "Navigate reports",
    icon: Icons.map_outlined,
    color: AppColors.info,
    tabIndex: 2,
  ),
  _WorkerAction(
    title: "Alerts",
    subtitle: "Read notifications",
    icon: Icons.notifications_active_outlined,
    color: AppColors.warning,
    tabIndex: 3,
  ),
  _WorkerAction(
    title: "Profile",
    subtitle: "Manage account",
    icon: Icons.person_outline,
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

  final _WorkerAction action;
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

class _WorkerTipCard extends StatelessWidget {
  const _WorkerTipCard();

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
                  "Worker Tip",
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  "Take clear cleanup photos, write brief completion notes, and update task statuses promptly to keep the community informed.",
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
