import "package:flutter_riverpod/flutter_riverpod.dart";
import "dart:async";

import "../data/notification_service.dart";
import "../domain/app_notification.dart";

// Real-time unread count notifier
class UnreadCountNotifier extends AutoDisposeAsyncNotifier<int> {
  Timer? _timer;

  @override
  FutureOr<int> build() {
    final service = ref.watch(notificationServiceProvider);

    // Poll for updates every 10 seconds to reduce network load
    _timer = Timer.periodic(const Duration(seconds: 30), (_) async {
      try {
        final count = await service.getUnreadCount();
        state = AsyncData(count);
      } catch (_) {}
    });

    ref.onDispose(() {
      _timer?.cancel();
    });

    return service.getUnreadCount();
  }

  void decrement() {
    state.whenData((count) {
      if (count > 0) {
        state = AsyncData(count - 1);
      }
    });
  }

  void setZero() {
    state = const AsyncData(0);
  }

  Future<void> refresh() async {
    try {
      final service = ref.read(notificationServiceProvider);
      final count = await service.getUnreadCount();
      state = AsyncData(count);
    } catch (_) {}
  }
}

final unreadCountProvider =
    AsyncNotifierProvider.autoDispose<UnreadCountNotifier, int>(() {
  return UnreadCountNotifier();
});

// Real-time notifications list notifier with optimistic updates
class NotificationsListNotifier
    extends AutoDisposeAsyncNotifier<List<AppNotification>> {
  Timer? _timer;

  @override
  FutureOr<List<AppNotification>> build() {
    final service = ref.watch(notificationServiceProvider);

    // Poll for updates every 12 seconds
    _timer = Timer.periodic(const Duration(seconds: 45), (_) async {
      try {
        final result = await service.getNotifications(page: 1, limit: 50);
        state = AsyncData(result.data);
      } catch (_) {}
    });

    ref.onDispose(() {
      _timer?.cancel();
    });

    return service.getNotifications(page: 1, limit: 50).then((res) => res.data);
  }

  Future<void> markAsRead(String id) async {
    // Optimistic update
    final currentList = state.value;
    if (currentList != null) {
      final updatedList = currentList.map((n) {
        if (n.id == id) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
      state = AsyncData(updatedList);
    }

    // Decrement unread count locally
    ref.read(unreadCountProvider.notifier).decrement();

    try {
      final service = ref.read(notificationServiceProvider);
      await service.markAsRead(id);
    } catch (e) {
      // Rollback on failure
      ref.invalidateSelf();
      ref.read(unreadCountProvider.notifier).refresh();
    }
  }

  Future<void> markAllAsRead() async {
    // Optimistic update
    final currentList = state.value;
    if (currentList != null) {
      final updatedList =
          currentList.map((n) => n.copyWith(isRead: true)).toList();
      state = AsyncData(updatedList);
    }

    // Reset unread count locally
    ref.read(unreadCountProvider.notifier).setZero();

    try {
      final service = ref.read(notificationServiceProvider);
      await service.markAllAsRead();
    } catch (e) {
      // Rollback on failure
      ref.invalidateSelf();
      ref.read(unreadCountProvider.notifier).refresh();
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    try {
      final service = ref.read(notificationServiceProvider);
      final result = await service.getNotifications(page: 1, limit: 50);
      state = AsyncData(result.data);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
}

final notificationsListProvider = AsyncNotifierProvider.autoDispose<
    NotificationsListNotifier, List<AppNotification>>(() {
  return NotificationsListNotifier();
});
