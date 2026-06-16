import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "notification_providers.dart";

/// Notification bell badge widget with real-time unread count
class NotificationBadge extends ConsumerWidget {
  final VoidCallback onPressed;
  final Color? badgeColor;
  final Color? iconColor;

  const NotificationBadge({
    required this.onPressed,
    this.badgeColor,
    this.iconColor,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadCountProvider);

    return unreadCount.when(
      data: (count) => Stack(
        children: [
          IconButton(
            icon: Icon(
              Icons.notifications,
              color: iconColor ?? AppColors.foreground,
            ),
            onPressed: onPressed,
          ),
          if (count > 0)
            Positioned(
              right: 8,
              top: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor ?? AppColors.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  count > 99 ? "99+" : "$count",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
      loading: () => IconButton(
        icon: Icon(
          Icons.notifications,
          color: iconColor ?? AppColors.foreground,
        ),
        onPressed: onPressed,
      ),
      error: (_, __) => IconButton(
        icon: Icon(
          Icons.notifications,
          color: iconColor ?? AppColors.foreground,
        ),
        onPressed: onPressed,
      ),
    );
  }
}

/// Notification item widget with mark-as-read on tap
class NotificationItemWidget extends ConsumerWidget {
  final String id;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  const NotificationItemWidget({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
    super.key,
  });

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
    return Container(
      color: isRead ? Colors.transparent : AppColors.primary.withValues(alpha: 0.05),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: isRead ? FontWeight.w500 : FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              message,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _timeAgo(createdAt),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
        trailing: isRead
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
          if (!isRead) {
            ref.read(notificationsListProvider.notifier).markAsRead(id);
          }
        },
      ),
    );
  }
}

/// Quick notification preview popup
class QuickNotificationPreview extends ConsumerWidget {
  final VoidCallback onViewAll;

  const QuickNotificationPreview({
    required this.onViewAll,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsListProvider);

    return notifications.when(
      data: (list) {
        if (list.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.notifications_none,
                  size: 48,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  "No notifications",
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          );
        }

        final unreadList = list.where((n) => !n.isRead).toList();

        return Column(
          children: [
            if (unreadList.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "${unreadList.length} unread notification${unreadList.length > 1 ? "s" : ""}",
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        ref
                            .read(notificationsListProvider.notifier)
                            .markAllAsRead();
                      },
                      child: const Text(
                        "Mark all read",
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: ListView.separated(
                itemCount: list.take(5).length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (_, index) {
                  final notification = list[index];
                  return NotificationItemWidget(
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    isRead: notification.isRead,
                    createdAt: notification.createdAt,
                  );
                },
              ),
            ),
            Container(
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.grey[300]!),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: onViewAll,
                    child: const Text("View all notifications"),
                  ),
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(),
      ),
      error: (error, _) => Center(
        child: Text("Error loading notifications: $error"),
      ),
    );
  }
}
