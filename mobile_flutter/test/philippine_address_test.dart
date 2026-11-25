import "package:flutter_test/flutter_test.dart";
import "package:bluewaste_mobile_flutter/src/features/auth/data/philippine_address_service.dart";

void main() {
  group("PhilippineAddressService unit tests", () {
    const service = PhilippineAddressService();

    test("getProvinces returns sorted list with key provinces", () async {
      final provinces = await service.getProvinces();
      expect(provinces, isNotEmpty);
      expect(provinces, contains("Davao del Norte"));
      expect(provinces, contains("Davao del Sur"));
      expect(provinces, contains("Metro Manila"));
      expect(provinces, contains("Cebu"));

      // Verify sorted order
      final sorted = List<String>.from(provinces)..sort();
      expect(provinces, equals(sorted));
    });

    test("getCities for Davao del Norte includes Panabo City and Tagum City", () async {
      final cities = await service.getCities("Davao del Norte");
      expect(cities, isNotEmpty);
      expect(cities, contains("Panabo City"));
      expect(cities, contains("Tagum City"));
      expect(cities, contains("Carmen"));
      expect(cities, contains("Santo Tomas"));
    });

    test("getCities returns empty list for unknown province", () async {
      final cities = await service.getCities("NonExistentProvince");
      expect(cities, isEmpty);
    });

    test("getBarangays for Panabo City includes official barangays", () async {
      final barangays = await service.getBarangays("Davao del Norte", "Panabo City");
      expect(barangays, isNotEmpty);
      expect(barangays.length, greaterThanOrEqualTo(35));
      expect(barangays, contains("Cagangohan"));
      expect(barangays, contains("San Pedro"));
      expect(barangays, contains("San Francisco (Poblacion)"));
      expect(barangays, contains("San Vicente"));
      expect(barangays, contains("J.P. Laurel"));
      expect(barangays, contains("New Visayas"));
      expect(barangays, contains("Santo Niño (Poblacion)"));
    });

    test("getPuroks returns specific puroks for Cagangohan with Other option", () async {
      final puroks = await service.getPuroks(
        "Davao del Norte",
        "Panabo City",
        "Cagangohan",
      );
      expect(puroks, isNotEmpty);
      expect(puroks, contains("Purok 1"));
      expect(puroks, contains("Purok 2"));
      expect(puroks, contains("Purok Coastal"));
      expect(puroks, contains(PhilippineAddressService.otherOption));
    });

    test("formatAddress combines all 4 components properly into single string", () {
      final formatted = PhilippineAddressService.formatAddress(
        province: "Davao del Norte",
        city: "Panabo City",
        barangay: "Cagangohan",
        purok: "Purok 2",
      );

      expect(
        formatted,
        equals("Purok 2, Barangay Cagangohan, Panabo City, Davao del Norte"),
      );
    });

    test("formatAddress preserves existing 'Barangay' or 'Brgy.' prefix", () {
      final withPrefix = PhilippineAddressService.formatAddress(
        province: "Davao del Norte",
        city: "Panabo City",
        barangay: "Barangay San Francisco",
        purok: "Purok 1",
      );

      expect(
        withPrefix,
        equals("Purok 1, Barangay San Francisco, Panabo City, Davao del Norte"),
      );

      final withBrgy = PhilippineAddressService.formatAddress(
        province: "Davao del Norte",
        city: "Panabo City",
        barangay: "Brgy. San Vicente",
        purok: "Purok Centro",
      );

      expect(
        withBrgy,
        equals("Purok Centro, Brgy. San Vicente, Panabo City, Davao del Norte"),
      );
    });

    test("formatAddress handles custom purok/sitio text", () {
      final customPurok = PhilippineAddressService.formatAddress(
        province: "Davao del Norte",
        city: "Panabo City",
        barangay: "San Pedro",
        purok: "Sitio Riverside 4B",
      );

      expect(
        customPurok,
        equals("Sitio Riverside 4B, Barangay San Pedro, Panabo City, Davao del Norte"),
      );
    });

    test("formatAddress handles missing or whitespace components gracefully", () {
      final partial = PhilippineAddressService.formatAddress(
        province: "Davao del Norte",
        city: "Panabo City",
        barangay: null,
        purok: "  ",
      );

      expect(partial, equals("Panabo City, Davao del Norte"));
    });
  });
}
