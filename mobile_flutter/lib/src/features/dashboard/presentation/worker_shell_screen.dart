import "dart:async";

import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../notifications/data/notification_service.dart";
import "../../notifications/presentation/notifications_screen.dart";
import "../../profile/presentation/profile_screen.dart";
import "../../reports/presentation/reports_map_screen.dart";
import "../../reports/presentation/worker_tasks_screen.dart";

class WorkerShellScreen extends ConsumerStatefulWidget {
  const WorkerShellScreen({super.key});

  @override
  ConsumerState<WorkerShellScreen> createState() => _WorkerShellScreenState();
}

class _WorkerShellScreenState extends ConsumerState<WorkerShellScreen> {
  int _index = 0;
  int _unreadCount = 0;
  bool _hasLoadedCount = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadUnreadCount();
    _timer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _loadUnreadCount(),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _setTab(int value) {
    setState(() {
      _index = value;
    });
  }

  Future<void> _loadUnreadCount() async {
    try {
      final count =
          await ref.read(notificationServiceProvider).getUnreadCount();
      if (!mounted) {
        return;
      }
      if (_hasLoadedCount && count > _unreadCount && count > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("You have new alerts.")),
        );
      }
      setState(() {
        _unreadCount = count;
        _hasLoadedCount = true;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() => _hasLoadedCount = true);
    }
  }

  Widget _buildBadgeIcon(IconData icon, int count) {
    if (count <= 0) {
      return Icon(icon);
    }

    final label = count > 9 ? "9+" : count.toString();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(icon),
        Positioned(
          right: -6,
          top: -4,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
            decoration: BoxDecoration(
              color: AppColors.destructive,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _openProfile() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const ProfileScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const WorkerTasksScreen(),
      const ReportsMapScreen(assignedOnly: true),
      const NotificationsScreen(),
    ];

    const titles = <String>["My Tasks", "Assigned Map", "Alerts"];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          titles[_index],
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(
              style: IconButton.styleFrom(
                backgroundColor: AppColors.secondary,
              ),
              onPressed: _openProfile,
              icon: const Icon(Icons.person_outline),
            ),
          ),
        ],
      ),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: SafeArea(
        top: false,
        minimum: const EdgeInsets.fromLTRB(
          AppSpacing.sm,
          0,
          AppSpacing.sm,
          AppSpacing.sm,
        ),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: NavigationBar(
              height: 66,
              elevation: 0,
              shadowColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              backgroundColor: Colors.transparent,
              indicatorColor: AppColors.tint(AppColors.primary, opacity: 0.16),
              labelBehavior:
                  NavigationDestinationLabelBehavior.onlyShowSelected,
              selectedIndex: _index,
              onDestinationSelected: _setTab,
              destinations: [
                const NavigationDestination(
                  icon: Icon(Icons.assignment_outlined),
                  selectedIcon: Icon(Icons.assignment),
                  label: "Tasks",
                ),
                const NavigationDestination(
                  icon: Icon(Icons.map_outlined),
                  selectedIcon: Icon(Icons.map),
                  label: "Map",
                ),
                NavigationDestination(
                  icon: _buildBadgeIcon(
                    Icons.notifications_outlined,
                    _unreadCount,
                  ),
                  selectedIcon: _buildBadgeIcon(
                    Icons.notifications,
                    _unreadCount,
                  ),
                  label: "Alerts",
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
