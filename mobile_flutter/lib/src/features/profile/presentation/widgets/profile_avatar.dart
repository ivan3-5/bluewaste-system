import "package:flutter/material.dart";

import "../../../../core/theme/app_colors.dart";
import "../../../auth/domain/app_user.dart";

class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar({
    super.key,
    required this.user,
    required this.radius,
    required this.fontSize,
    this.backgroundOpacity = 0.1,
  });

  final AppUser? user;
  final double radius;
  final double fontSize;
  final double backgroundOpacity;

  @override
  Widget build(BuildContext context) {
    final firstName = (user?.firstName ?? "").trim();
    final lastName = (user?.lastName ?? "").trim();
    final initials = [
      if (firstName.isNotEmpty) firstName.characters.first,
      if (lastName.isNotEmpty) lastName.characters.first,
    ].join().toUpperCase();
    final fallback = Text(
      initials.isEmpty ? "U" : initials,
      style: TextStyle(
        color: AppColors.primary,
        fontWeight: FontWeight.w800,
        fontSize: fontSize,
      ),
    );
    final avatarUrl = (user?.avatarUrl ?? "").trim();

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.tint(
        AppColors.primary,
        opacity: backgroundOpacity,
      ),
      child: avatarUrl.isEmpty
          ? fallback
          : ClipOval(
              child: Image.network(
                avatarUrl,
                width: radius * 2,
                height: radius * 2,
                fit: BoxFit.cover,
                frameBuilder: (_, image, frame, loaded) =>
                    loaded || frame != null ? image : fallback,
                errorBuilder: (_, _, _) => fallback,
              ),
            ),
    );
  }
}
