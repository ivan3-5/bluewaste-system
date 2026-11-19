import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/theme/app_colors.dart";
import "auth_controller.dart";

class EmailVerificationScreen extends ConsumerStatefulWidget {
  const EmailVerificationScreen({required this.email, super.key});

  final String email;

  @override
  ConsumerState<EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends ConsumerState<EmailVerificationScreen> {
  final _codeController = TextEditingController();
  String? _error;
  String? _message;
  bool _busy = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (_codeController.text.length != 6) {
      setState(() => _error = "Enter the six-digit code from your email.");
      return;
    }
    setState(() { _busy = true; _error = null; _message = null; });
    try {
      await ref.read(authControllerProvider.notifier).verifyEmail(
        email: widget.email,
        code: _codeController.text,
      );
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceAll("Exception: ", ""));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resend() async {
    setState(() { _busy = true; _error = null; _message = null; });
    try {
      await ref.read(authControllerProvider.notifier).resendEmailVerification(email: widget.email);
      if (mounted) setState(() => _message = "If this account needs verification, a new code has been sent.");
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceAll("Exception: ", ""));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Verify email")),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.mark_email_read_outlined, size: 56, color: AppColors.primary),
                const SizedBox(height: 20),
                Text("Check your inbox", textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text("Enter the six-digit code sent to ${widget.email}. It expires in 10 minutes.", textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 28),
                TextField(
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 26, letterSpacing: 10, fontWeight: FontWeight.w700),
                  decoration: const InputDecoration(labelText: "Verification code", border: OutlineInputBorder(), hintText: "••••••"),
                  onSubmitted: (_) => _busy ? null : _verify(),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.destructive)),
                ],
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(_message!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.success)),
                ],
                const SizedBox(height: 20),
                FilledButton(onPressed: _busy ? null : _verify, child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text("Verify email")),
                TextButton(onPressed: _busy ? null : _resend, child: const Text("Resend code")),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
