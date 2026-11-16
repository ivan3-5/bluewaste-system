import "package:bluewaste_mobile_flutter/src/features/auth/domain/app_user.dart";
import "package:bluewaste_mobile_flutter/src/features/profile/presentation/widgets/profile_avatar.dart";
import "package:flutter/material.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  testWidgets("uses both initials for a user with no profile photo", (
    tester,
  ) async {
    for (final role in ["CITIZEN", "FIELD_WORKER"]) {
      await tester.pumpWidget(
        MaterialApp(
          home: ProfileAvatar(
            user: AppUser(
              id: "1",
              email: "user@example.test",
              firstName: " Charls",
              lastName: "Rebaja ",
              role: role,
              avatarUrl: " ",
            ),
            radius: 18,
            fontSize: 14,
          ),
        ),
      );

      expect(find.text("CR"), findsOneWidget);
      expect(find.byType(Image), findsNothing);
    }
  });
}
