import "package:flutter_riverpod/flutter_riverpod.dart";
import "dart:async";

import "../data/notification_service.dart";
import "../domain/app_notification.dart";

// Real-time unread count with auto-refresh
final unreadCountProvider = StreamProvider.autoDispose<int>((ref) {
  final service = ref.watch(notificationServiceProvider);
  final controller = StreamController<int>.broadcast();

  // Initial fetch
  service.getUnreadCount().then((count) {
    if (!controller.isClosed) {
      controller.add(count);
    }
  }).catchError((e) {
    if (!controller.isClosed) {
      controller.addError(e);
    }
  });

  // Poll for updates every 3 seconds
  final timer = Timer.periodic(const Duration(seconds: 3), (_) {
    service.getUnreadCount().then((count) {
      if (!controller.isClosed) {
        controller.add(count);
      }
    }).catchError((e) {
      if (!controller.isClosed) {
        controller.addError(e);
      }
    });
  });

  ref.onDispose(() {
    timer.cancel();
    controller.close();
  });

  return controller.stream;
});

// Real-time notifications list with auto-refresh
final notificationsListProvider =
    StreamProvider.autoDispose<List<AppNotification>>((ref) {
  final service = ref.watch(notificationServiceProvider);
  final controller = StreamController<List<AppNotification>>.broadcast();

  // Initial fetch
  service.getNotifications(page: 1, limit: 50).then((result) {
    if (!controller.isClosed) {
      controller.add(result.data);
    }
  }).catchError((e) {
    if (!controller.isClosed) {
      controller.addError(e);
    }
  });

  // Poll for updates every 4 seconds
  final timer = Timer.periodic(const Duration(seconds: 4), (_) {
    service.getNotifications(page: 1, limit: 50).then((result) {
      if (!controller.isClosed) {
        controller.add(result.data);
      }
    }).catchError((e) {
      if (!controller.isClosed) {
        controller.addError(e);
      }
    });
  });

  ref.onDispose(() {
    timer.cancel();
    controller.close();
  });

  return controller.stream;
});

// Mark notification as read and invalidate counts
final markNotificationAsReadProvider =
    FutureProvider.family<void, String>((ref, id) async {
  final service = ref.watch(notificationServiceProvider);
  await service.markAsRead(id);

  // Invalidate streams to trigger refresh
  ref.invalidate(unreadCountProvider);
  ref.invalidate(notificationsListProvider);
});

// Mark all as read and invalidate counts
final markAllAsReadProvider = FutureProvider<void>((ref) async {
  final service = ref.watch(notificationServiceProvider);
  await service.markAllAsRead();

  // Invalidate streams to trigger refresh
  ref.invalidate(unreadCountProvider);
  ref.invalidate(notificationsListProvider);
});
