import "package:flutter/material.dart";


import "../../../../core/theme/app_colors.dart";

class FadeInSlide extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;

  const FadeInSlide({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 600),
  });

  @override
  State<FadeInSlide> createState() => _FadeInSlideState();
}

class _FadeInSlideState extends State<FadeInSlide>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  // Cap the effective stagger delay so the last element never waits more
  // than 350 ms — this cuts perceived auth-screen load nearly in half.
  static const Duration _maxDelay = Duration(milliseconds: 350);

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _slideAnimation = Tween<Offset>(
            begin: const Offset(0, 0.15), end: Offset.zero)
        .animate(CurvedAnimation(
            parent: _controller, curve: Curves.easeOutCubic));

    final effectiveDelay = widget.delay > _maxDelay ? _maxDelay : widget.delay;
    Future.delayed(effectiveDelay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

class PremiumTextField extends StatefulWidget {
  final TextEditingController controller;
  final String labelText;
  final String? hintText;
  final IconData prefixIcon;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final Widget? suffixIcon;
  final ValueChanged<String>? onSubmitted;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final FocusNode? focusNode;
  final TextCapitalization textCapitalization;
  final bool enabled;

  const PremiumTextField({
    super.key,
    required this.controller,
    required this.labelText,
    this.hintText,
    required this.prefixIcon,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.suffixIcon,
    this.onSubmitted,
    this.onChanged,
    this.errorText,
    this.focusNode,
    this.textCapitalization = TextCapitalization.none,
    this.enabled = true,
  });

  @override
  State<PremiumTextField> createState() => _PremiumTextFieldState();
}

class _PremiumTextFieldState extends State<PremiumTextField> {
  FocusNode? _internalFocusNode;
  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(PremiumTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.focusNode != oldWidget.focusNode) {
      (oldWidget.focusNode ?? _internalFocusNode)
          ?.removeListener(_handleFocusChange);
      _effectiveFocusNode.addListener(_handleFocusChange);
    }
  }

  void _handleFocusChange() {
    if (mounted) {
      setState(() {
        _isFocused = _effectiveFocusNode.hasFocus;
      });
    }
  }

  @override
  void dispose() {
    _effectiveFocusNode.removeListener(_handleFocusChange);
    _internalFocusNode?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasError =
        widget.errorText != null && widget.errorText!.trim().isNotEmpty;
    final primaryColor =
        hasError ? AppColors.destructive : AppColors.primary;
    final borderColor = hasError
        ? AppColors.destructive
        : (_isFocused
            ? AppColors.primary
            : AppColors.border.withValues(alpha: 0.6));
    final borderWidth = hasError || _isFocused ? 1.8 : 1.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: hasError
                ? AppColors.tint(AppColors.destructive, opacity: 0.03)
                : (_isFocused
                    ? AppColors.background
                    : AppColors.background.withValues(alpha: 0.7)),
            borderRadius: BorderRadius.circular(16),
            boxShadow: _isFocused || hasError
                ? [
                    BoxShadow(
                      color:
                          primaryColor.withValues(alpha: hasError ? 0.12 : 0.15),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: TextField(
            controller: widget.controller,
            focusNode: _effectiveFocusNode,
            obscureText: widget.obscureText,
            keyboardType: widget.keyboardType,
            textInputAction: widget.textInputAction,
            textCapitalization: widget.textCapitalization,
            enabled: widget.enabled,
            onSubmitted: widget.onSubmitted,
            onChanged: widget.onChanged,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: AppColors.foreground.withValues(alpha: 0.9),
              letterSpacing: 0.3,
            ),
            decoration: InputDecoration(
              labelText: widget.labelText,
              hintText: widget.hintText,
              hintStyle: TextStyle(
                color: AppColors.mutedForeground.withValues(alpha: 0.5),
                fontWeight: FontWeight.w400,
              ),
              labelStyle: TextStyle(
                color: hasError
                    ? AppColors.destructive
                    : AppColors.mutedForeground.withValues(alpha: 0.8),
                fontWeight: FontWeight.w500,
              ),
              floatingLabelStyle: TextStyle(
                color: primaryColor,
                fontWeight: FontWeight.w700,
              ),
              prefixIcon: Icon(
                widget.prefixIcon,
                color: hasError
                    ? AppColors.destructive
                    : (_isFocused
                        ? AppColors.primary
                        : AppColors.mutedForeground.withValues(alpha: 0.8)),
              ),
              suffixIcon: widget.suffixIcon,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: borderColor,
                  width: borderWidth,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: primaryColor,
                  width: 2.0,
                ),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 17),
            ),
          ),
        ),
        if (hasError)
          Padding(
            padding: const EdgeInsets.only(top: 5, left: 10, right: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline_rounded,
                  size: 13.5,
                  color: AppColors.destructive,
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    widget.errorText!,
                    style: const TextStyle(
                      color: AppColors.destructive,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      height: 1.25,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class AnimatedGradientBackground extends StatelessWidget {
  final Widget child;

  const AnimatedGradientBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFFE0F2FE), // Very light blue
                  Color(0xFFF8FAFC), // Slate 50
                  Color(0xFFFFFFFF), // White
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
        ),
        // Decorative top-right orb
        Positioned(
          top: -150,
          right: -100,
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: const Duration(seconds: 2),
            curve: Curves.easeOut,
            builder: (context, value, child) {
              return Transform.scale(
                scale: 0.8 + (value * 0.2),
                child: Opacity(
                  opacity: value,
                  child: Container(
                    width: 400,
                    height: 400,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.primary.withValues(alpha: 0.15),
                          AppColors.primary.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        // Decorative bottom-left orb
        Positioned(
          bottom: -150,
          left: -100,
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: const Duration(seconds: 2),
            curve: Curves.easeOut,
            builder: (context, value, child) {
              return Transform.scale(
                scale: 0.8 + (value * 0.2),
                child: Opacity(
                  opacity: value,
                  child: Container(
                    width: 500,
                    height: 500,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.info.withValues(alpha: 0.15),
                          AppColors.info.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        // NOTE: The full-screen BackdropFilter(sigmaX:60) that was here has been
        // removed. It required the engine to composite and blur every pixel on the
        // screen each frame for no perceptible visual gain on a solid gradient
        // background, causing GPU pressure during keyboard animations.
        child,
      ],
    );
  }
}

class PremiumButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final bool isLoading;
  final String text;

  const PremiumButton({
    super.key,
    required this.onPressed,
    required this.isLoading,
    required this.text,
  });

  @override
  State<PremiumButton> createState() => _PremiumButtonState();
}

class _PremiumButtonState extends State<PremiumButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 150));
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onPressed != null && !widget.isLoading
          ? (_) => _controller.forward()
          : null,
      onTapUp: widget.onPressed != null && !widget.isLoading
          ? (_) => _controller.reverse()
          : null,
      onTapCancel: widget.onPressed != null && !widget.isLoading
          ? () => _controller.reverse()
          : null,
      onTap: widget.onPressed,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: widget.onPressed == null
                ? LinearGradient(
                    colors: [
                      AppColors.mutedForeground.withValues(alpha: 0.3),
                      AppColors.mutedForeground.withValues(alpha: 0.3),
                    ],
                  )
                : const LinearGradient(
                    colors: [
                      Color(0xFF0066CC), // Primary
                      Color(0xFF0052A3), // Slightly darker primary
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
            boxShadow: widget.onPressed != null
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    )
                  ]
                : [],
          ),
          padding: const EdgeInsets.symmetric(vertical: 18),
          alignment: Alignment.center,
          child: widget.isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                      strokeWidth: 2.5, color: Colors.white),
                )
              : Text(
                  widget.text,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
        ),
      ),
    );
  }
}
