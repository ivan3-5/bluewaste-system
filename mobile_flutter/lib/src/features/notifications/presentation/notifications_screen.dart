import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "notification_providers.dart";

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  String _timeAgo(DateTime date) {
    final seconds = DateTime.now().difference(date).inSeconds;
    if (seconds < 60) return "just now";
    final minutes = seconds ~/ 60;
    if (minutes < 60) return "${minutes}m ago";
    final hours = minutes ~/ 60;
    if (hours < 24) return "${hours}h ago";
    final days = hours ~/ 24;
    return "${days}d ago";
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsListProvider);

    return notificationsAsync.when(
      data: (notifications) {
        final unreadCount = notifications.where((n) => !n.isRead).length;

        if (notifications.isEmpty) {
          return const Center(
            child: AppEmptyState(
              icon: Icons.notifications_none,
              title: "No notifications",
              subtitle: "You are all caught up.",
            ),
          );
        }

        return Column(
          children: [
            if (unreadCount > 0)
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.md,
                  AppSpacing.xs,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppStatusPill(
                      label: "$unreadCount unread",
                      color: AppColors.primary,
                    ),
                    TextButton(
                      onPressed: () {
                        ref
                            .read(notificationsListProvider.notifier)
                            .markAllAsRead();
                      },
                      child: const Text("Mark all read"),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  await ref
                      .read(notificationsListProvider.notifier)
                      .refresh();
                },
                child: ListView.separated(
                  itemCount: notifications.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final notification = notifications[index];
                    return Container(
                      color: notification.isRead
                          ? Colors.transparent
                          : AppColors.primary.withValues(alpha: 0.05),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        title: Text(
                          notification.title,
                          style: TextStyle(
                            fontWeight: notification.isRead
                                ? FontWeight.w500
                                : FontWeight.w600,
                          ),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(
                              notification.message,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.mutedForeground,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _timeAgo(notification.createdAt),
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.neutral,
                              ),
                            ),
                          ],
                        ),
                        trailing: notification.isRead
                            ? null
                            : Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                ),
                              ),
                        onTap: () {
                          if (!notification.isRead) {
                            ref
                                .read(notificationsListProvider.notifier)
                                .markAsRead(notification.id);
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text("Error loading notifications: $error"),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () =>
                  ref.read(notificationsListProvider.notifier).refresh(),
              child: const Text("Retry"),
            ),
          ],
        ),
      ),
    );
  }
}
