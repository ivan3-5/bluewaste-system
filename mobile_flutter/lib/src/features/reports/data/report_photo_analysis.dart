import 'detect_service.dart';

/// Keep results attached to the photo when selections change.
class ReportPhotoAnalysis<Photo> {
  final Map<Photo, DetectResult> results = {};
  final Map<Photo, String> errors = {};
  final Set<Photo> pending = {};
  Future<void> _queue = Future<void>.value();

  Future<void> enqueue(Photo photo, Future<void> Function() analyze) {
    final task = _queue.then((_) async {
      if (pending.contains(photo)) await analyze();
    });
    _queue = task.then<void>((_) {}, onError: (Object _, StackTrace __) {});
    return task;
  }

  bool ready(Iterable<Photo> photos) =>
      photos.isNotEmpty && photos.every(results.containsKey);
  bool hasSpam(Iterable<Photo> photos) =>
      photos.any((photo) => results[photo]?.isSpam == true);

  static bool _isYolo(DetectResult result) =>
      result.model == "yolo" || result.model == "yolo-tflite";

  /// Different angles may show the same waste. Select a single photo.
  DetectResult? strongest(Iterable<Photo> photos) {
    DetectResult? best;
    for (final photo in photos) {
      final result = results[photo];
      if (result != null &&
          (best == null ||
              (_isYolo(result) || _isYolo(best)
                  ? result.hasWaste &&
                      (!best.hasWaste ||
                          result.severity.index < best.severity.index)
                  : result.wasteCount > best.wasteCount))) {
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
