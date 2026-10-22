import "dart:ui";

import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "auth_controller.dart";
import "register_screen.dart";
import "widgets/auth_components.dart";

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();

  String? _emailError;
  String? _passwordError;
  String? _generalError;

  bool _isSubmitting = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  // Email format validator
  static final _emailRegex = RegExp(r"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");

  String? _validateEmail(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return "Email address is required.";
    }
    if (!_emailRegex.hasMatch(trimmed)) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }
    return null;
  }

  String? _validatePassword(String value) {
    if (value.isEmpty) {
      return "Password is required.";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return null;
  }

  void _onEmailChanged(String value) {
    if (_generalError != null) {
      setState(() => _generalError = null);
    }
    if (_emailError != null) {
      final error = _validateEmail(value);
      if (error == null || error != _emailError) {
        setState(() => _emailError = error);
      }
    }
  }

  void _onPasswordChanged(String value) {
    if (_generalError != null) {
      setState(() => _generalError = null);
    }
    if (_passwordError != null) {
      final error = _validatePassword(value);
      if (error == null || error != _passwordError) {
        setState(() => _passwordError = error);
      }
    }
  }

  Future<void> _handleLogin() async {
    // Dismiss soft keyboard
    FocusScope.of(context).unfocus();

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    final emailError = _validateEmail(email);
    final passwordError = _validatePassword(password);

    if (emailError != null || passwordError != null) {
      setState(() {
        _emailError = emailError;
        _passwordError = passwordError;
        _generalError = null;
      });

      // Autofocus first invalid input
      if (emailError != null) {
        _emailFocusNode.requestFocus();
      } else if (passwordError != null) {
        _passwordFocusNode.requestFocus();
      }
      return;
    }

    setState(() {
      _isSubmitting = true;
      _emailError = null;
      _passwordError = null;
      _generalError = null;
    });

    try {
      await ref.read(authControllerProvider.notifier).login(
            email: email,
            password: password,
          );
      // Navigation is automatically handled by the auth state listener in the app root.
    } catch (error) {
      if (!mounted) return;

      final rawError = error.toString();
      String friendlyMessage = "Invalid email or password. Please try again.";

      if (rawError.toLowerCase().contains("invalid") ||
          rawError.toLowerCase().contains("credentials") ||
          rawError.toLowerCase().contains("unauthorized")) {
        friendlyMessage =
            "Incorrect email or password. Please check your credentials.";
        setState(() {
          _passwordError = "Incorrect password.";
        });
      } else if (rawError.toLowerCase().contains("network") ||
          rawError.toLowerCase().contains("connection") ||
          rawError.toLowerCase().contains("socket")) {
        friendlyMessage =
            "Unable to connect to the server. Please check your connection.";
      } else {
        friendlyMessage = rawError.replaceAll("Exception: ", "").trim();
      }

      setState(() {
        _generalError = friendlyMessage;
      });
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: AnimatedGradientBackground(
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.lg,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: AppSpacing.md),

                      // App Logo Avatar
                      FadeInSlide(
                        duration: const Duration(milliseconds: 600),
                        child: Center(
                          child: Hero(
                            tag: "app_logo",
                            child: Container(
                              padding: const EdgeInsets.all(AppSpacing.md),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.card,
                                boxShadow: [
                                  BoxShadow(
                                    color:
                                        AppColors.primary.withValues(alpha: 0.16),
                                    blurRadius: 30,
                                    offset: const Offset(0, 14),
                                  ),
                                ],
                                border: Border.all(
                                  color: AppColors.background
                                      .withValues(alpha: 0.6),
                                  width: 2.5,
                                ),
                              ),
                              child: Image.asset(
                                "assets/images/logo-final.png",
                                height: 74,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Brand Name
                      FadeInSlide(
                        delay: const Duration(milliseconds: 80),
                        child: Text(
                          "BlueWaste",
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                fontWeight: FontWeight.w900,
                                letterSpacing: -1.0,
                                color: AppColors.foreground,
                                fontSize: 32,
                              ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 4),

                      // Brand Slogan
                      FadeInSlide(
                        delay: const Duration(milliseconds: 140),
                        child: Text(
                          "Clean city, connected citizens.",
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: AppColors.mutedForeground,
                                    fontWeight: FontWeight.w500,
                                    letterSpacing: -0.2,
                                    fontSize: 14.5,
                                  ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Glassmorphic Login Card
                      FadeInSlide(
                        delay: const Duration(milliseconds: 200),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(30),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.card.withValues(alpha: 0.78),
                                borderRadius: BorderRadius.circular(30),
                                border: Border.all(
                                  color: AppColors.background
                                      .withValues(alpha: 0.6),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.foreground
                                        .withValues(alpha: 0.04),
                                    blurRadius: 24,
                                    offset: const Offset(0, 12),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(AppSpacing.xl),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Text(
                                    "Sign in to your account",
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleLarge
                                        ?.copyWith(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 22,
                                          letterSpacing: -0.4,
                                          color: AppColors.foreground,
                                        ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    "Enter your credentials below to proceed",
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.mutedForeground,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.lg),

                                  // General Server Error Banner
                                  if (_generalError != null) ...[
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                        vertical: 10,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.tint(
                                          AppColors.destructive,
                                          opacity: 0.1,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(12),
                                        border: Border.all(
                                          color: AppColors.destructive
                                              .withValues(alpha: 0.25),
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(
                                            Icons.error_outline_rounded,
                                            size: 18,
                                            color: AppColors.destructive,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              _generalError!,
                                              style: const TextStyle(
                                                fontSize: 12.5,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.destructive,
                                                height: 1.3,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: AppSpacing.md),
                                  ],

                                  // Email Field
                                  PremiumTextField(
                                    controller: _emailController,
                                    focusNode: _emailFocusNode,
                                    labelText: "Email address",
                                    hintText: "Enter your email",
                                    prefixIcon: Icons.email_rounded,
                                    keyboardType: TextInputType.emailAddress,
                                    textInputAction: TextInputAction.next,
                                    errorText: _emailError,
                                    onChanged: _onEmailChanged,
                                    onSubmitted: (_) {
                                      _passwordFocusNode.requestFocus();
                                    },
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Password Field
                                  PremiumTextField(
                                    controller: _passwordController,
                                    focusNode: _passwordFocusNode,
                                    labelText: "Password",
                                    hintText: "Enter your password",
                                    prefixIcon: Icons.lock_rounded,
                                    obscureText: _obscurePassword,
                                    textInputAction: TextInputAction.done,
                                    errorText: _passwordError,
                                    onChanged: _onPasswordChanged,
                                    onSubmitted: (_) => _handleLogin(),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword
                                            ? Icons.visibility_off_rounded
                                            : Icons.visibility_rounded,
                                        color: AppColors.mutedForeground,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscurePassword =
                                              !_obscurePassword;
                                        });
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.xs),

                                  // Forgot Password
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: const Text(
                                              "Password reset instructions will be sent to your registered email.",
                                            ),
                                            behavior:
                                                SnackBarBehavior.floating,
                                            backgroundColor:
                                                AppColors.foreground,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                          ),
                                        );
                                      },
                                      style: TextButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 4,
                                        ),
                                        minimumSize: Size.zero,
                                      ),
                                      child: const Text(
                                        "Forgot password?",
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.lg),

                                  // Submit Button
                                  PremiumButton(
                                    onPressed:
                                        _isSubmitting ? null : _handleLogin,
                                    isLoading: _isSubmitting,
                                    text: "Sign In",
                                  ),
                                  const SizedBox(height: AppSpacing.xl),

                                  // Sign Up Prompt
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        "Don't have an account?",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                              color: AppColors.mutedForeground,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13.5,
                                            ),
                                      ),
                                      const SizedBox(width: AppSpacing.xs),
                                      InkWell(
                                        borderRadius:
                                            BorderRadius.circular(6),
                                        onTap: _isSubmitting
                                            ? null
                                            : () {
                                                Navigator.of(context).push(
                                                  MaterialPageRoute<void>(
                                                    builder: (_) =>
                                                        const RegisterScreen(),
                                                  ),
                                                );
                                              },
                                        child: const Padding(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 4,
                                            vertical: 2,
                                          ),
                                          child: Text(
                                            "Sign up",
                                            style: TextStyle(
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.primary,
                                              fontSize: 13.5,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
