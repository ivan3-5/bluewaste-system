import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:shared_preferences/shared_preferences.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../auth/presentation/auth_controller.dart";
import "../../notifications/presentation/notifications_screen.dart";
import "../../profile/presentation/profile_screen.dart";
import "../../reports/presentation/citizen_home_screen.dart";
import "../../reports/presentation/my_reports_screen.dart";
import "../../../../screens/camera_screen.dart";
import "../../reports/presentation/reports_map_screen.dart";

class CitizenShellScreen extends ConsumerStatefulWidget {
  const CitizenShellScreen({super.key});

  @override
  ConsumerState<CitizenShellScreen> createState() => _CitizenShellScreenState();
}

class _CitizenShellScreenState extends ConsumerState<CitizenShellScreen> {
  int _index = 0;
  int _homeTapCount = 0;
  int _lastHomeTapMs = 0;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    final avatarUrl = (user?.avatarUrl ?? "").trim();
    final hasAvatar = avatarUrl.isNotEmpty;
    final useCitizenPlaceholder =
        !hasAvatar && ((user?.role ?? "").toUpperCase() == "CITIZEN");
    ImageProvider<Object>? profileImage;
    if (hasAvatar) {
      profileImage = NetworkImage(avatarUrl);
    } else if (useCitizenPlaceholder) {
      profileImage = const AssetImage("assets/charls.png");
    }
    final firstName = (user?.firstName ?? "").trim();
    final initials =
        firstName.isEmpty ? "U" : firstName.substring(0, 1).toUpperCase();

    final pages = <Widget>[
      CitizenHomeScreen(
        onSelectTab: (tab) => setState(() => _index = tab),
      ),
      const CameraScreen(),
      const MyReportsScreen(),
      const ReportsMapScreen(),
      const NotificationsScreen(),
    ];

    const titles = <String>[
      "Home",
      "Submit Report",
      "My Reports",
      "Map",
      "Notifications",
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          titles[_index],
          style: const TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 24,
            letterSpacing: -0.5,
          ),
        ),
        elevation: 0,
        centerTitle: false,
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: InkWell(
              borderRadius: BorderRadius.circular(999),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const ProfileScreen(),
                  ),
                );
              },
              child: Hero(
                tag: "profile_avatar",
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      width: 2,
                    ),
                  ),
                  child: CircleAvatar(
                    radius: 18,
                    backgroundColor:
                        AppColors.tint(AppColors.primary, opacity: 0.1),
                    foregroundImage: profileImage,
                    child: profileImage == null
                        ? Text(
                            initials,
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          )
                        : null,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: SafeArea(
        top: false,
        minimum: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          0,
          AppSpacing.md,
          AppSpacing.md,
        ),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.08),
                blurRadius: 24,
                spreadRadius: 2,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: NavigationBar(
              height: 70,
              elevation: 0,
              shadowColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              backgroundColor: Colors.transparent,
              indicatorColor: AppColors.tint(AppColors.primary, opacity: 0.12),
              labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
              animationDuration: const Duration(milliseconds: 300),
              selectedIndex: _index,
              onDestinationSelected: (value) async {
                final now = DateTime.now().millisecondsSinceEpoch;
                if (value == 0) {
                  if (now - _lastHomeTapMs < 1500) {
                    _homeTapCount += 1;
                  } else {
                    _homeTapCount = 1;
                  }
                  _lastHomeTapMs = now;

                  if (_homeTapCount >= 2) {
                    try {
                      final prefs = await SharedPreferences.getInstance();
                      final current = prefs.getBool('demo_mode') ?? false;
                      final next = !current;
                      await prefs.setBool('demo_mode', next);
                      if (next) {
                        await prefs.setInt('demo_counter', 1);
                      }
                    } catch (e) {
                      // ignore storage errors — keep toggle silent
                    }
                    _homeTapCount = 0;
                  }
                }

                setState(() => _index = value);
              },
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home_rounded),
                  label: "Home",
                ),
                NavigationDestination(
                  icon: Icon(Icons.add_circle_outline),
                  selectedIcon: Icon(Icons.add_circle),
                  label: "Report",
                ),
                NavigationDestination(
                  icon: Icon(Icons.list_alt_outlined),
                  selectedIcon: Icon(Icons.list_alt),
                  label: "My Reports",
                ),
                NavigationDestination(
                  icon: Icon(Icons.map_outlined),
                  selectedIcon: Icon(Icons.map),
                  label: "Map",
                ),
                NavigationDestination(
                  icon: Icon(Icons.notifications_outlined),
                  selectedIcon: Icon(Icons.notifications),
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
