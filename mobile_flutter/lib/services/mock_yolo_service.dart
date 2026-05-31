import "dart:io";
import "dart:math" as math;
import "package:flutter/widgets.dart";
import "package:shared_preferences/shared_preferences.dart";

import "yolo_service.dart" show YoloDetectionResult, YoloBoundingBox;

class MockYoloService {
  MockYoloService._();

  static Future<YoloDetectionResult> detectWaste(File imageFile) async {
    final prefs = await SharedPreferences.getInstance();
    final demoMode = prefs.getBool('demo_mode') ?? false;

    if (!demoMode) {
      throw StateError('MockYoloService used while demo_mode is off');
    }

    int counter = prefs.getInt('demo_counter') ?? 1;
    final isOdd = (counter % 2) == 1;

    final rnd = math.Random();
    final confidence = isOdd
        ? 0.91 + rnd.nextDouble() * (0.96 - 0.91)
        : 0.93 + rnd.nextDouble() * (0.97 - 0.93);

    final label = isOdd ? 'with_waste' : 'no_waste';

    // increment counter and persist
    try {
      prefs.setInt('demo_counter', counter + 1);
    } catch (e) {
      // ignore
    }

    return YoloDetectionResult(
      label: label,
      confidence: double.parse(confidence.toStringAsFixed(4)),
      boxes: const <YoloBoundingBox>[],
      imageSize: const Size(1, 1),
    );
  }
}
