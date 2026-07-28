import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../auth/presentation/auth_controller.dart";
import "../../notifications/presentation/notification_providers.dart";
import "../../profile/presentation/profile_screen.dart";

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

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      children: [
        _WorkerWelcomeHeader(name: greetingName),
        const SizedBox(height: AppSpacing.lg),
        const _SectionHeader(
          title: "Quick Actions",
          subtitle: "Manage your assigned tasks and updates",
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
            childAspectRatio: 1.25,
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
        const SizedBox(height: AppSpacing.md),
      ],
    );
  }
}

class _WorkerWelcomeHeader extends StatelessWidget {
  const _WorkerWelcomeHeader({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    "Hello, $name",
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AppColors.foreground,
                          letterSpacing: -0.5,
                        ),
                  ),
                  const SizedBox(width: 6),
                  const Text("🛠️", style: TextStyle(fontSize: 20)),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                "Ready to tackle cleanup operations today?",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.mutedForeground,
                      fontSize: 13,
                    ),
              ),
            ],
          ),
        ),
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
    tabIndex: 3,
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

class _QuickActionCard extends ConsumerWidget {
  const _QuickActionCard({required this.action, required this.onTap});

  final _WorkerAction action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = action.tabIndex == 3
        ? (ref.watch(unreadCountProvider).value ?? 0)
        : 0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.tint(action.color, opacity: 0.14),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(action.icon, size: 20, color: action.color),
                      ),
                      if (unreadCount > 0)
                        Positioned(
                          right: -4,
                          top: -4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 5, vertical: 2),
                            constraints: const BoxConstraints(
                                minWidth: 18, minHeight: 18),
                            decoration: BoxDecoration(
                              color: AppColors.destructive,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: AppColors.card,
                                width: 1.5,
                              ),
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
                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 16,
                    color: AppColors.mutedForeground.withValues(alpha: 0.5),
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
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.18),
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
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
                    Text(
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
                          horizontal: 6, vertical: 1.5),
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

