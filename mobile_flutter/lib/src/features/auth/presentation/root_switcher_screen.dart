import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/providers.dart";
import "../../../core/theme/app_colors.dart";
import "../../dashboard/presentation/citizen_shell_screen.dart";
import "../../dashboard/presentation/worker_shell_screen.dart";
import "onboarding_screen.dart";
import "login_screen.dart";
import "auth_controller.dart";

class RootSwitcherScreen extends ConsumerStatefulWidget {
  const RootSwitcherScreen({super.key});

  @override
  ConsumerState<RootSwitcherScreen> createState() => _RootSwitcherScreenState();
}

class _RootSwitcherScreenState extends ConsumerState<RootSwitcherScreen> {
  bool _onboardingSeen = false;
  bool _onboardingLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadOnboardingState();
  }

  Future<void> _loadOnboardingState() async {
    final seen = await ref.read(sessionStorageProvider).readOnboardingSeen();
    if (!mounted) {
      return;
    }

    setState(() {
      _onboardingSeen = seen;
      _onboardingLoaded = true;
    });
  }

  Future<void> _completeOnboarding() async {
    await ref.read(sessionStorageProvider).writeOnboardingSeen(seen: true);
    if (!mounted) {
      return;
    }

    setState(() => _onboardingSeen = true);
  }

  Widget _buildPreparingScreen() {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Responsive logo container
            ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.3,
                maxHeight: MediaQuery.of(context).size.height * 0.25,
              ),
              child: AspectRatio(
                aspectRatio: 1.0,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.secondary,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(8),
                  child: Image.asset(
                    "assets/images/logo-final.png",
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppColors.secondary,
                        child: const Icon(
                          Icons.image_not_supported,
                          color: Colors.white,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            const Text(
              "Preparing BlueWaste...",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    if (authState.isLoading || !_onboardingLoaded) {
      return _buildPreparingScreen();
    }

    if (!authState.isAuthenticated) {
      if (!_onboardingSeen) {
        return OnboardingScreen(onGetStarted: _completeOnboarding);
      }
      return const LoginScreen();
    }

    if (authState.user?.isWorker ?? false) {
      return const WorkerShellScreen();
    }

    return const CitizenShellScreen();
  }
}
