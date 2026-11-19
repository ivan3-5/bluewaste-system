import "dart:async";
import "dart:ui" show FontFeature;

import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "auth_controller.dart";
import "widgets/auth_components.dart";

class EmailVerificationScreen extends ConsumerStatefulWidget {
  final String email;

  const EmailVerificationScreen({super.key, required this.email});

  @override
  ConsumerState<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends ConsumerState<EmailVerificationScreen> {
  static const _otpLifetime = Duration(minutes: 10);
  static const _defaultResendCooldown = Duration(seconds: 60);

  final _codeController = TextEditingController();
  final _codeFocusNode = FocusNode();
  Timer? _countdownTimer;
  late DateTime _expiresAt;
  late DateTime _resendAvailableAt;
  Duration _timeRemaining = _otpLifetime;
  Duration _resendRemaining = _defaultResendCooldown;
  String? _error;
  String? _message;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _expiresAt = now.add(_otpLifetime);
    _resendAvailableAt = now.add(_defaultResendCooldown);
    _codeFocusNode.addListener(_onFocusChanged);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      _updateCountdowns();
    });
  }

  void _onFocusChanged() {
    if (mounted) setState(() {});
  }

  void _updateCountdowns() {
    final now = DateTime.now();
    setState(() {
      _timeRemaining = _remainingUntil(_expiresAt, now);
      _resendRemaining = _remainingUntil(_resendAvailableAt, now);
    });
  }

  Duration _remainingUntil(DateTime deadline, DateTime now) {
    final difference = deadline.difference(now);
    return difference.isNegative ? Duration.zero : difference;
  }

  String _formatCountdown(Duration value) {
    final seconds = value.inSeconds;
    final minutesPart = (seconds ~/ 60).toString().padLeft(2, "0");
    final secondsPart = (seconds % 60).toString().padLeft(2, "0");
    return "$minutesPart:$secondsPart";
  }

  void _onCodeChanged(String value) {
    if (_error != null || _message != null) {
      setState(() {
        _error = null;
        _message = null;
      });
    } else {
      setState(() {});
    }
  }

  Future<void> _handleVerify() async {
    FocusScope.of(context).unfocus();
    final code = _codeController.text.trim();
    if (code.length != 6) {
      setState(() {
        _error = "Enter the six-digit verification code.";
        _message = null;
      });
      return;
    }
    if (_timeRemaining == Duration.zero) {
      setState(() {
        _error = "This code has expired. Resend a new code to continue.";
        _message = null;
      });
      return;
    }

    setState(() {
      _busy = true;
      _error = null;
      _message = null;
    });
    try {
      await ref
          .read(authControllerProvider.notifier)
          .verifyEmail(email: widget.email, code: code);
      if (!mounted) return;
      Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.toString().replaceFirst("Exception: ", "").trim();
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _handleResend() async {
    if (_busy || _resendRemaining > Duration.zero) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
      _message = null;
    });
    try {
      final retryAfterSeconds = await ref
          .read(authControllerProvider.notifier)
          .resendEmailVerification(email: widget.email);
      if (!mounted) return;
      final cooldown = Duration(
        seconds: retryAfterSeconds > 0
            ? retryAfterSeconds
            : _defaultResendCooldown.inSeconds,
      );
      final now = DateTime.now();
      setState(() {
        _codeController.clear();
        _expiresAt = now.add(_otpLifetime);
        _resendAvailableAt = now.add(cooldown);
        _timeRemaining = _otpLifetime;
        _resendRemaining = cooldown;
        _message = "A new verification code has been sent to your email.";
      });
    } catch (error) {
      if (!mounted) return;
      final raw = error.toString().replaceFirst("Exception: ", "").trim();
      setState(() => _error = raw);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _codeFocusNode.removeListener(_onFocusChanged);
    _codeController.dispose();
    _codeFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isExpired = _timeRemaining == Duration.zero;
    final canVerify = !_busy && _codeController.text.length == 6 && !isExpired;
    final horizontalPadding = MediaQuery.sizeOf(context).width < 360 ? 16.0 : 24.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF6FAFF),
      body: AnimatedGradientBackground(
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) => SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                12,
                horizontalPadding,
                24 + MediaQuery.viewInsetsOf(context).bottom,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight - 36),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 460),
                    child: _buildVerificationCard(theme, canVerify, isExpired),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVerificationCard(ThemeData theme, bool canVerify, bool isExpired) {
    return FadeInSlide(
      duration: const Duration(milliseconds: 450),
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 28, 24, 22),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.75)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF15549B).withValues(alpha: 0.12),
              blurRadius: 36,
              offset: const Offset(0, 18),
            ),
            BoxShadow(
              color: Colors.white.withValues(alpha: 0.8),
              blurRadius: 0,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE7F2FF), Color(0xFFF0F7FF)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.12)),
                ),
                child: const Icon(Icons.mark_email_read_rounded,
                    size: 30, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              "BLUEWASTE ACCOUNT SECURITY",
              textAlign: TextAlign.center,
              style: theme.textTheme.labelMedium?.copyWith(
                color: AppColors.primary,
                letterSpacing: 1.15,
                fontWeight: FontWeight.w800,
                fontSize: 10.5,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              "Verify your email",
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineSmall?.copyWith(
                color: AppColors.foreground,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.65,
                fontSize: 26,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "We sent a six-digit code to",
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColors.mutedForeground,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              widget.email,
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColors.foreground,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 22),
            _buildExpiryIndicator(isExpired),
            const SizedBox(height: 18),
            _buildOtpInput(),
            const SizedBox(height: 10),
            Text(
              isExpired
                  ? "Your code expired. Request a new one to continue."
                  : "Enter the code before it expires. You can paste all six digits.",
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: isExpired ? AppColors.destructive : AppColors.mutedForeground,
                fontSize: 11.5,
                height: 1.4,
              ),
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              child: _error != null || _message != null
                  ? Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: _buildNotice(_error ?? _message!, isError: _error != null),
                    )
                  : const SizedBox.shrink(),
            ),
            const SizedBox(height: 20),
            _buildVerifyButton(canVerify),
            const SizedBox(height: 13),
            _buildResendButton(),
            const SizedBox(height: 16),
            Center(
              child: TextButton.icon(
                onPressed: _busy ? null : () => Navigator.of(context).maybePop(),
                icon: const Icon(Icons.arrow_back_rounded, size: 16),
                label: const Text("Back to previous screen"),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.mutedForeground,
                  textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12.5),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shield_outlined,
                    size: 15, color: AppColors.mutedForeground.withValues(alpha: 0.85)),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    "Your email helps keep your BlueWaste account secure.",
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.mutedForeground,
                      fontSize: 10.5,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExpiryIndicator(bool isExpired) {
    final color = isExpired ? AppColors.destructive : AppColors.primary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.13)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.schedule_rounded, color: color, size: 17),
          const SizedBox(width: 7),
          Text(
            isExpired ? "Code expired" : "Code expires in",
            style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          if (!isExpired) ...[
            const SizedBox(width: 6),
            Text(
              _formatCountdown(_timeRemaining),
              style: TextStyle(
                color: color,
                fontSize: 13,
                fontWeight: FontWeight.w800,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOtpInput() {
    final hasError = _error != null;
    return Semantics(
      label: "Six-digit email verification code",
      textField: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => _codeFocusNode.requestFocus(),
        child: SizedBox(
          height: 58,
          child: Stack(
            children: [
              Row(
                children: List.generate(6, (index) {
                  final code = _codeController.text;
                  final isActive = _codeFocusNode.hasFocus &&
                      (index == code.length || (code.length == 6 && index == 5));
                  final borderColor = hasError
                      ? AppColors.destructive
                      : isActive
                          ? AppColors.primary
                          : AppColors.border;
                  return Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 160),
                      curve: Curves.easeOut,
                      height: 56,
                      margin: EdgeInsets.only(right: index == 5 ? 0 : 7),
                      decoration: BoxDecoration(
                        color: isActive
                            ? const Color(0xFFF7FBFF)
                            : const Color(0xFFFBFDFF),
                        borderRadius: BorderRadius.circular(13),
                        border: Border.all(
                          color: borderColor,
                          width: isActive || hasError ? 1.6 : 1,
                        ),
                        boxShadow: isActive
                            ? [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.10),
                                  blurRadius: 12,
                                  offset: const Offset(0, 3),
                                ),
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        index < code.length ? code[index] : "",
                        style: const TextStyle(
                          color: AppColors.foreground,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          fontFeatures: [FontFeature.tabularFigures()],
                        ),
                      ),
                    ),
                  );
                }),
              ),
              Positioned.fill(
                child: TextField(
                  controller: _codeController,
                  focusNode: _codeFocusNode,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  maxLength: 6,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  onChanged: _onCodeChanged,
                  onSubmitted: (_) => _handleVerify(),
                  cursorColor: Colors.transparent,
                  style: const TextStyle(color: Colors.transparent, fontSize: 1),
                  decoration: const InputDecoration(
                    counterText: "",
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                    filled: true,
                    fillColor: Colors.transparent,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotice(String text, {required bool isError}) {
    final color = isError ? AppColors.destructive : AppColors.success;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.22)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
            size: 17,
            color: color,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(color: color, fontSize: 12, height: 1.35, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerifyButton(bool enabled) {
    return SizedBox(
      height: 52,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: enabled
              ? const LinearGradient(
                  colors: [Color(0xFF0878E5), Color(0xFF0059B8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.48),
                    AppColors.primary.withValues(alpha: 0.48),
                  ],
                ),
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.22),
                    blurRadius: 16,
                    offset: const Offset(0, 7),
                  ),
                ]
              : null,
        ),
        child: ElevatedButton.icon(
          onPressed: enabled ? _handleVerify : null,
          icon: _busy
              ? const SizedBox.square(
                  dimension: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.verified_user_outlined, size: 18),
          label: Text(_busy ? "Verifying..." : "Verify email and continue"),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            disabledBackgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            disabledForegroundColor: Colors.white.withValues(alpha: 0.88),
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }

  Widget _buildResendButton() {
    final canResend = !_busy && _resendRemaining == Duration.zero;
    return TextButton.icon(
      onPressed: canResend ? _handleResend : null,
      icon: Icon(
        Icons.refresh_rounded,
        size: 18,
        color: canResend ? AppColors.primary : AppColors.mutedForeground,
      ),
      label: Text(
        _resendRemaining > Duration.zero
            ? "Resend code in ${_formatCountdown(_resendRemaining)}"
            : "Resend verification code",
      ),
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        disabledForegroundColor: AppColors.mutedForeground,
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
      ),
    );
  }
}
