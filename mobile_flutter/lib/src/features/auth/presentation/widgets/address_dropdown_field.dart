import "package:flutter/material.dart";

import "../../../../core/theme/app_colors.dart";

class AddressDropdownField extends StatelessWidget {
  final String labelText;
  final String hintText;
  final IconData prefixIcon;
  final String? value;
  final List<String> items;
  final ValueChanged<String?>? onChanged;
  final bool isLoading;
  final bool enabled;
  final String? errorText;

  const AddressDropdownField({
    super.key,
    required this.labelText,
    required this.hintText,
    required this.prefixIcon,
    required this.value,
    required this.items,
    required this.onChanged,
    this.isLoading = false,
    this.enabled = true,
    this.errorText,
  });

  @override
  Widget build(BuildContext context) {
    final hasError = errorText != null && errorText!.trim().isNotEmpty;
    final primaryColor = hasError ? AppColors.destructive : AppColors.primary;
    final isFieldEnabled = enabled && !isLoading;

    final borderColor = hasError
        ? AppColors.destructive
        : (isFieldEnabled
            ? AppColors.border.withValues(alpha: 0.6)
            : AppColors.border.withValues(alpha: 0.25));

    final effectiveValue = (items.contains(value)) ? value : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: !isFieldEnabled
                ? AppColors.muted.withValues(alpha: 0.15)
                : (hasError
                    ? AppColors.tint(AppColors.destructive, opacity: 0.03)
                    : AppColors.background.withValues(alpha: 0.7)),
            borderRadius: BorderRadius.circular(16),
            boxShadow: hasError
                ? [
                    BoxShadow(
                      color: primaryColor.withValues(alpha: 0.12),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: DropdownButtonFormField<String>(
            value: effectiveValue,
            isExpanded: true,
            icon: isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.primary,
                    ),
                  )
                : Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: isFieldEnabled
                        ? AppColors.mutedForeground
                        : AppColors.mutedForeground.withValues(alpha: 0.35),
                  ),
            dropdownColor: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            menuMaxHeight: 320,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              color: isFieldEnabled
                  ? AppColors.foreground.withValues(alpha: 0.9)
                  : AppColors.mutedForeground.withValues(alpha: 0.5),
              letterSpacing: 0.3,
            ),
            decoration: InputDecoration(
              labelText: labelText,
              hintText: hintText,
              hintStyle: TextStyle(
                color: AppColors.mutedForeground.withValues(alpha: 0.5),
                fontWeight: FontWeight.w400,
                fontSize: 14,
              ),
              labelStyle: TextStyle(
                color: hasError
                    ? AppColors.destructive
                    : (isFieldEnabled
                        ? AppColors.mutedForeground.withValues(alpha: 0.8)
                        : AppColors.mutedForeground.withValues(alpha: 0.4)),
                fontWeight: FontWeight.w500,
              ),
              floatingLabelStyle: TextStyle(
                color: isFieldEnabled ? primaryColor : AppColors.mutedForeground,
                fontWeight: FontWeight.w700,
              ),
              prefixIcon: Icon(
                prefixIcon,
                color: hasError
                    ? AppColors.destructive
                    : (isFieldEnabled
                        ? AppColors.primary
                        : AppColors.mutedForeground.withValues(alpha: 0.4)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: borderColor,
                  width: hasError ? 1.8 : 1.0,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: primaryColor,
                  width: 2.0,
                ),
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: AppColors.border.withValues(alpha: 0.3),
                  width: 1.0,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 16,
              ),
            ),
            items: isFieldEnabled
                ? items.map((item) {
                    return DropdownMenuItem<String>(
                      value: item,
                      child: Text(
                        item,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    );
                  }).toList()
                : null,
            onChanged: isFieldEnabled ? onChanged : null,
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
                  color: AppColors.destructive,
                  size: 15,
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    errorText!,
                    style: const TextStyle(
                      color: AppColors.destructive,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
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
