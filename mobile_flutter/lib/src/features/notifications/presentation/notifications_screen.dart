import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:intl/intl.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../domain/app_notification.dart";
import "notification_providers.dart";

enum _NotificationFilter { all, unread }

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  _NotificationFilter _activeFilter = _NotificationFilter.all;

  String _timeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.isNegative || difference.inSeconds < 45) {
      return "Just now";
    }
    if (difference.inMinutes < 60) {
      return "${difference.inMinutes}m ago";
    }
    if (difference.inHours < 24) {
      return "${difference.inHours}h ago";
    }
    if (difference.inDays == 1) {
      return "Yesterday";
    }
    if (difference.inDays < 7) {
      return "${difference.inDays}d ago";
    }
    if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return "${weeks}w ago";
    }
    return DateFormat("MMM d").format(date);
  }

  _NotificationTypeConfig _getTypeConfig(String rawType) {
    final type = rawType.toUpperCase();
    switch (type) {
      case "NEW_REPORT":
        return const _NotificationTypeConfig(
          label: "New Report",
          icon: Icons.campaign_rounded,
          color: AppColors.warning,
        );
      case "STATUS_CHANGE":
        return const _NotificationTypeConfig(
          label: "Status Update",
          icon: Icons.published_with_changes_rounded,
          color: AppColors.info,
        );
      case "ASSIGNMENT":
        return const _NotificationTypeConfig(
          label: "Task Assigned",
          icon: Icons.assignment_ind_rounded,
          color: AppColors.purple,
        );
      case "CLEANUP_SCHEDULE":
        return const _NotificationTypeConfig(
          label: "Cleanup Schedule",
          icon: Icons.cleaning_services_rounded,
          color: AppColors.success,
        );
      case "SYSTEM":
      default:
        return const _NotificationTypeConfig(
          label: "System",
          icon: Icons.notifications_active_rounded,
          color: AppColors.primary,
        );
    }
  }

  void _showNotificationDetail(
    BuildContext context,
    AppNotification notification,
    _NotificationTypeConfig config,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return _NotificationDetailSheet(
          notification: notification,
          config: config,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: notificationsAsync.when(
              data: (notifications) {
                final unreadCount =
                    notifications.where((n) => !n.isRead).length;
                final filteredNotifications = _activeFilter ==
                        _NotificationFilter.unread
                    ? notifications.where((n) => !n.isRead).toList()
                    : notifications;

                return Column(
                  children: [
                    // Filter & Control Header
                    _NotificationsHeaderBar(
                      totalCount: notifications.length,
                      unreadCount: unreadCount,
                      activeFilter: _activeFilter,
                      onFilterChanged: (filter) {
                        setState(() => _activeFilter = filter);
                      },
                      onMarkAllAsRead: () {
                        ref
                            .read(notificationsListProvider.notifier)
                            .markAllAsRead();
                      },
                    ),

                    // List / Empty State
                    Expanded(
                      child: RefreshIndicator(
                        color: AppColors.primary,
                        backgroundColor: AppColors.card,
                        onRefresh: () async {
                          await ref
                              .read(notificationsListProvider.notifier)
                              .refresh();
                        },
                        child: filteredNotifications.isEmpty
                            ? _NotificationsEmptyState(
                                activeFilter: _activeFilter,
                                onResetFilter: () {
                                  setState(
                                    () => _activeFilter = _NotificationFilter.all,
                                  );
                                },
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.fromLTRB(
                                  AppSpacing.md,
                                  AppSpacing.xs,
                                  AppSpacing.md,
                                  AppSpacing.xl,
                                ),
                                itemCount: filteredNotifications.length,
                                itemBuilder: (context, index) {
                                  final notification =
                                      filteredNotifications[index];
                                  final config =
                                      _getTypeConfig(notification.type);

                                  return _NotificationCard(
                                    notification: notification,
                                    config: config,
                                    timeAgo: _timeAgo(notification.createdAt),
                                    onTap: () {
                                      if (!notification.isRead) {
                                        ref
                                            .read(
                                                notificationsListProvider
                                                    .notifier)
                                            .markAsRead(notification.id);
                                      }
                                      _showNotificationDetail(
                                        context,
                                        notification,
                                        config,
                                      );
                                    },
                                    onMarkRead: !notification.isRead
                                        ? () {
                                            ref
                                                .read(
                                                    notificationsListProvider
                                                        .notifier)
                                                .markAsRead(notification.id);
                                          }
                                        : null,
                                  );
                                },
                              ),
                      ),
                    ),
                  ],
                );
              },
              loading: () => const _NotificationsLoadingSkeleton(),
              error: (error, _) => _NotificationsErrorState(
                errorMessage: error.toString(),
                onRetry: () =>
                    ref.read(notificationsListProvider.notifier).refresh(),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Type Configuration
// -----------------------------------------------------------------------------
class _NotificationTypeConfig {
  const _NotificationTypeConfig({
    required this.label,
    required this.icon,
    required this.color,
  });

  final String label;
  final IconData icon;
  final Color color;
}

// -----------------------------------------------------------------------------
// Header Bar with Filter Tabs & Quick Action
// -----------------------------------------------------------------------------
class _NotificationsHeaderBar extends StatelessWidget {
  const _NotificationsHeaderBar({
    required this.totalCount,
    required this.unreadCount,
    required this.activeFilter,
    required this.onFilterChanged,
    required this.onMarkAllAsRead,
  });

  final int totalCount;
  final int unreadCount;
  final _NotificationFilter activeFilter;
  final ValueChanged<_NotificationFilter> onFilterChanged;
  final VoidCallback onMarkAllAsRead;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          bottom: BorderSide(
            color: AppColors.border.withValues(alpha: 0.6),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Filter Tabs
          _FilterChip(
            label: "All",
            count: totalCount,
            isSelected: activeFilter == _NotificationFilter.all,
            onTap: () => onFilterChanged(_NotificationFilter.all),
          ),
          const SizedBox(width: AppSpacing.xs),
          _FilterChip(
            label: "Unread",
            count: unreadCount,
            highlightCount: unreadCount > 0,
            isSelected: activeFilter == _NotificationFilter.unread,
            onTap: () => onFilterChanged(_NotificationFilter.unread),
          ),
          const Spacer(),

          // Mark all as read button
          if (unreadCount > 0)
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onMarkAllAsRead,
                borderRadius: BorderRadius.circular(999),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.tint(AppColors.primary, opacity: 0.08),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(
                        Icons.done_all_rounded,
                        size: 14,
                        color: AppColors.primary,
                      ),
                      SizedBox(width: 4),
                      Text(
                        "Mark all read",
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Filter Chip Component
// -----------------------------------------------------------------------------
class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.count,
    required this.isSelected,
    required this.onTap,
    this.highlightCount = false,
  });

  final String label;
  final int count;
  final bool isSelected;
  final bool highlightCount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color bgColor =
        isSelected ? AppColors.primary : AppColors.card;
    final Color textColor =
        isSelected ? Colors.white : AppColors.mutedForeground;
    final Border border = isSelected
        ? Border.all(color: AppColors.primary)
        : Border.all(color: AppColors.border);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(999),
            border: border,
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.2),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight:
                      isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: textColor,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 1.5,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.22)
                      : highlightCount
                          ? AppColors.tint(AppColors.primary, opacity: 0.14)
                          : AppColors.muted,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isSelected
                        ? Colors.white
                        : highlightCount
                            ? AppColors.primary
                            : AppColors.neutral,
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

// -----------------------------------------------------------------------------
// Notification Card Component
// -----------------------------------------------------------------------------
class _NotificationCard extends StatelessWidget {
  const _NotificationCard({
    required this.notification,
    required this.config,
    required this.timeAgo,
    required this.onTap,
    this.onMarkRead,
  });

  final AppNotification notification;
  final _NotificationTypeConfig config;
  final String timeAgo;
  final VoidCallback onTap;
  final VoidCallback? onMarkRead;

  @override
  Widget build(BuildContext context) {
    final isUnread = !notification.isRead;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isUnread
            ? AppColors.tint(AppColors.primary, opacity: 0.045)
            : AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isUnread
              ? AppColors.primary.withValues(alpha: 0.28)
              : AppColors.border,
          width: isUnread ? 1.2 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: isUnread
                ? AppColors.primary.withValues(alpha: 0.04)
                : Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Unread Accent Strip
                  if (isUnread)
                    Container(
                      width: 4,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                      ),
                    ),

                  // Main Card Content
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Type Icon Avatar
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.tint(
                                config.color,
                                opacity: 0.12,
                              ),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: config.color.withValues(alpha: 0.2),
                                width: 1,
                              ),
                            ),
                            child: Icon(
                              config.icon,
                              color: config.color,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),

                          // Text Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Top Category & Time Row
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 7,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.tint(
                                          config.color,
                                          opacity: 0.1,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        config.label.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.5,
                                          color: config.color,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                          Icons.access_time_rounded,
                                          size: 11.5,
                                          color: AppColors.mutedForeground,
                                        ),
                                        const SizedBox(width: 3),
                                        Text(
                                          timeAgo,
                                          style: const TextStyle(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w500,
                                            color: AppColors.mutedForeground,
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (isUnread) ...[
                                      const SizedBox(width: 6),
                                      InkResponse(
                                        onTap: onMarkRead,
                                        radius: 12,
                                        child: Tooltip(
                                          message: "Mark as read",
                                          child: Container(
                                            width: 8,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              color: AppColors.primary,
                                              shape: BoxShape.circle,
                                              boxShadow: [
                                                BoxShadow(
                                                  color: AppColors.primary
                                                      .withValues(alpha: 0.35),
                                                  blurRadius: 4,
                                                  spreadRadius: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 6),

                                // Title
                                Text(
                                  notification.title,
                                  style: TextStyle(
                                    fontSize: 14.5,
                                    fontWeight: isUnread
                                        ? FontWeight.w700
                                        : FontWeight.w600,
                                    color: AppColors.foreground,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                                const SizedBox(height: 4),

                                // Message
                                Text(
                                  notification.message,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 13,
                                    height: 1.35,
                                    color: isUnread
                                        ? AppColors.foreground
                                            .withValues(alpha: 0.75)
                                        : AppColors.mutedForeground,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Detailed Bottom Sheet
// -----------------------------------------------------------------------------
class _NotificationDetailSheet extends StatelessWidget {
  const _NotificationDetailSheet({
    required this.notification,
    required this.config,
  });

  final AppNotification notification;
  final _NotificationTypeConfig config;

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat("MMMM d, yyyy • h:mm a")
        .format(notification.createdAt.toLocal());

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.sm,
            AppSpacing.md,
            AppSpacing.xl,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),

              // Header Row with Avatar & Type Label
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.tint(config.color, opacity: 0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: config.color.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Icon(
                      config.icon,
                      color: config.color,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.tint(
                              config.color,
                              opacity: 0.1,
                            ),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            config.label.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: config.color,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.schedule_rounded,
                              size: 13,
                              color: AppColors.mutedForeground,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              formattedDate,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: AppColors.mutedForeground,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(
                      Icons.close_rounded,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              const Divider(color: AppColors.border, height: 1),
              const SizedBox(height: AppSpacing.md),

              // Title
              Text(
                notification.title,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),

              // Full Message
              SelectableText(
                notification.message,
                style: const TextStyle(
                  fontSize: 14.5,
                  height: 1.5,
                  color: AppColors.secondaryForeground,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Shimmer Skeleton Loading State
// -----------------------------------------------------------------------------
class _NotificationsLoadingSkeleton extends StatelessWidget {
  const _NotificationsLoadingSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.xl,
      ),
      children: [
        // Shimmer for filter header
        Row(
          children: const [
            ShimmerBox(width: 72, height: 32, borderRadius: 999),
            SizedBox(width: AppSpacing.xs),
            ShimmerBox(width: 86, height: 32, borderRadius: 999),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        // Shimmer notification cards
        for (int i = 0; i < 5; i++)
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const ShimmerBox(width: 44, height: 44, borderRadius: 12),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          ShimmerBox(width: 75, height: 14, borderRadius: 4),
                          ShimmerBox(width: 48, height: 12, borderRadius: 4),
                        ],
                      ),
                      SizedBox(height: 8),
                      ShimmerBox(
                        width: double.infinity,
                        height: 15,
                        borderRadius: 4,
                      ),
                      SizedBox(height: 6),
                      ShimmerBox(width: 180, height: 13, borderRadius: 4),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------
class _NotificationsEmptyState extends StatelessWidget {
  const _NotificationsEmptyState({
    required this.activeFilter,
    required this.onResetFilter,
  });

  final _NotificationFilter activeFilter;
  final VoidCallback onResetFilter;

  @override
  Widget build(BuildContext context) {
    final isUnreadFilter = activeFilter == _NotificationFilter.unread;

    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                color: AppColors.tint(AppColors.primary, opacity: 0.1),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  width: 1.5,
                ),
              ),
              child: Icon(
                isUnreadFilter
                    ? Icons.mark_email_read_outlined
                    : Icons.notifications_none_rounded,
                size: 36,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              isUnreadFilter
                  ? "All caught up!"
                  : "No notifications yet",
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.foreground,
                letterSpacing: -0.3,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xs),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 280),
              child: Text(
                isUnreadFilter
                    ? "You don't have any unread notifications at the moment."
                    : "When updates regarding your reports, assignments, or cleanup schedules occur, they'll appear here.",
                style: const TextStyle(
                  fontSize: 13.5,
                  height: 1.45,
                  color: AppColors.mutedForeground,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            if (isUnreadFilter) ...[
              const SizedBox(height: AppSpacing.md),
              OutlinedButton.icon(
                onPressed: onResetFilter,
                icon: const Icon(Icons.list_alt_rounded, size: 16),
                label: const Text("View all notifications"),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.border),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
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

// -----------------------------------------------------------------------------
// Error State
// -----------------------------------------------------------------------------
class _NotificationsErrorState extends StatelessWidget {
  const _NotificationsErrorState({
    required this.errorMessage,
    required this.onRetry,
  });

  final String errorMessage;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.destructive.withValues(alpha: 0.1),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.destructive.withValues(alpha: 0.2),
                  width: 1.5,
                ),
              ),
              child: const Icon(
                Icons.cloud_off_rounded,
                size: 34,
                color: AppColors.destructive,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              "Unable to load notifications",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.foreground,
                letterSpacing: -0.3,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xs),
            const Text(
              "Please check your internet connection and try again.",
              style: TextStyle(
                fontSize: 13.5,
                color: AppColors.mutedForeground,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text("Try Again"),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
