import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:flutter_test/flutter_test.dart";
import "package:bluewaste_mobile_flutter/src/features/auth/presentation/register_screen.dart";
import "package:bluewaste_mobile_flutter/src/features/auth/presentation/widgets/address_dropdown_field.dart";

void main() {
  testWidgets("RegisterScreen renders cascading address dropdowns and updates combined address", (tester) async {
    tester.view.physicalSize = const Size(800, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: RegisterScreen(),
          ),
        ),
      ),
    );

    // Initial pump and wait for microtasks/animations to settle
    await tester.pumpAndSettle();

    // Verify all 4 address dropdown fields are present
    expect(find.byType(AddressDropdownField), findsNWidgets(4));
    expect(find.text("Province"), findsOneWidget);
    expect(find.text("City / Municipality"), findsOneWidget);
    expect(find.text("Barangay"), findsOneWidget);
    expect(find.text("Purok / Sitio"), findsOneWidget);

    // Verify City, Barangay, Purok hint text shows dependency before selection
    expect(find.text("Select province first"), findsOneWidget);
    expect(find.text("Select city first"), findsOneWidget);
    expect(find.text("Select barangay first"), findsOneWidget);

    // 1. Select Province: Davao del Norte
    final provinceDropdown = find.byWidgetPredicate(
      (w) => w is AddressDropdownField && w.labelText == "Province",
    );
    expect(provinceDropdown, findsOneWidget);
    await tester.ensureVisible(provinceDropdown);
    await tester.tap(provinceDropdown);
    await tester.pumpAndSettle();

    final davaoDelNorteItem = find.text("Davao del Norte").last;
    expect(davaoDelNorteItem, findsOneWidget);
    await tester.tap(davaoDelNorteItem);
    await tester.pumpAndSettle();

    // Now City dropdown should be enabled and hint updated
    expect(find.text("Select City / Municipality"), findsOneWidget);

    // 2. Select City: Panabo City
    final cityDropdown = find.byWidgetPredicate(
      (w) => w is AddressDropdownField && w.labelText == "City / Municipality",
    );
    await tester.ensureVisible(cityDropdown);
    await tester.tap(cityDropdown);
    await tester.pumpAndSettle();

    final panaboItem = find.text("Panabo City").last;
    expect(panaboItem, findsOneWidget);
    await tester.tap(panaboItem);
    await tester.pumpAndSettle();

    // Now Barangay dropdown should be enabled and hint updated
    expect(find.text("Select Barangay"), findsOneWidget);

    // 3. Select Barangay: Cagangohan
    final barangayDropdown = find.byWidgetPredicate(
      (w) => w is AddressDropdownField && w.labelText == "Barangay",
    );
    await tester.ensureVisible(barangayDropdown);
    await tester.tap(barangayDropdown);
    await tester.pumpAndSettle();

    final cagangohanItem = find.text("Cagangohan").last;
    expect(cagangohanItem, findsOneWidget);
    await tester.tap(cagangohanItem);
    await tester.pumpAndSettle();

    // Now Purok dropdown should be enabled and hint updated
    expect(find.text("Select Purok / Sitio"), findsOneWidget);

    // 4. Select Purok: Purok 2
    final purokDropdown = find.byWidgetPredicate(
      (w) => w is AddressDropdownField && w.labelText == "Purok / Sitio",
    );
    await tester.ensureVisible(purokDropdown);
    await tester.tap(purokDropdown);
    await tester.pumpAndSettle();

    final purok2Item = find.text("Purok 2").last;
    expect(purok2Item, findsOneWidget);
    await tester.tap(purok2Item);
    await tester.pumpAndSettle();

    // Verify preview card is not shown as requested
    expect(find.text("Complete Address (Combined)"), findsNothing);
  });
}
