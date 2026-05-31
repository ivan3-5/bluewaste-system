import "package:geocoding/geocoding.dart";
import "package:geolocator/geolocator.dart";
import "package:permission_handler/permission_handler.dart";

class CurrentLocation {
  const CurrentLocation({
    required this.latitude,
    required this.longitude,
    required this.locationName,
  });

  final double latitude;
  final double longitude;
  final String locationName;
}

class LocationService {
  Future<bool> requestPermission() async {
    final status = await Permission.locationWhenInUse.request();
    return status.isGranted || status.isLimited;
  }

  Future<CurrentLocation> getCurrentLocation() async {
    final permissionGranted = await requestPermission();
    if (!permissionGranted) {
      throw Exception("Location permission is required.");
    }

    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception("Location services are disabled.");
    }

    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
    final locationName = await reverseGeocode(
      position.latitude,
      position.longitude,
    );

    return CurrentLocation(
      latitude: position.latitude,
      longitude: position.longitude,
      locationName: locationName,
    );
  }

  Future<String> reverseGeocode(double latitude, double longitude) async {
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isEmpty) {
        return "Current location";
      }

      final place = placemarks.first;
      final parts = <String>[];
      if (place.subLocality?.trim().isNotEmpty == true) {
        parts.add(place.subLocality!.trim());
      }
      if (place.locality?.trim().isNotEmpty == true) {
        parts.add(place.locality!.trim());
      }
      if (place.administrativeArea?.trim().isNotEmpty == true) {
        parts.add(place.administrativeArea!.trim());
      }

      if (parts.isEmpty) {
        return place.name?.trim().isNotEmpty == true
            ? place.name!.trim()
            : "Current location";
      }

      return parts.join(", ");
    } catch (_) {
      return "Current location";
    }
  }
}
