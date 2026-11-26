import 'detect_service.dart';

/// Keep results attached to the photo when selections change.
class ReportPhotoAnalysis<Photo> {
  final Map<Photo, DetectResult> results = {};
  final Map<Photo, String> errors = {};
  final Set<Photo> pending = {};

  bool ready(Iterable<Photo> photos) =>
      photos.isNotEmpty && photos.every(results.containsKey);
  bool hasSpam(Iterable<Photo> photos) =>
      photos.any((photo) => results[photo]?.isSpam == true);

  /// Different angles may show the same waste, so do not sum item counts.
  DetectResult? strongest(Iterable<Photo> photos) {
    DetectResult? best;
    for (final photo in photos) {
      final result = results[photo];
      if (result != null &&
          (best == null || result.wasteCount > best.wasteCount)) {
        best = result;
      }
    }
    return best;
  }

  void remove(Photo photo) {
    results.remove(photo);
    errors.remove(photo);
    pending.remove(photo);
  }

  void clear() {
    results.clear();
    errors.clear();
    pending.clear();
  }
}
