import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:bluewaste_mobile_flutter/src/features/reports/data/detect_service.dart';
import 'package:bluewaste_mobile_flutter/src/features/reports/data/report_photo_analysis.dart';

DetectResult result(String model, int count) => DetectResult(
  hasWaste: count >= 4,
  message: 'Analyzed',
  wasteCount: count,
  severity: WasteSeverity.fromWasteCount(count),
  layer1Passed: true,
  model: model,
);

void main() {
  test(
    'serializes five photos, skips a removed photo, and retries a failure',
    () async {
      final state = ReportPhotoAnalysis<int>();
      final holdFirstPhoto = Completer<void>();
      final started = <int>[];

      Future<void> analyze(int photo, {bool fail = false}) {
        state.pending.add(photo);
        return state.enqueue(photo, () async {
          started.add(photo);
          if (photo == 1) await holdFirstPhoto.future;
          state.pending.remove(photo);
          if (fail) {
            state.errors[photo] = 'Temporary error';
            return;
          }
          state.errors.remove(photo);
          state.results[photo] = result('yolo-tflite', 4);
        });
      }

      final initial = [
        analyze(1),
        analyze(2),
        analyze(3, fail: true),
        analyze(4),
        analyze(5),
      ];
      await Future<void>.delayed(Duration.zero);
      expect(started, [1]);
      state.remove(2);
      holdFirstPhoto.complete();

      await Future.wait(initial);
      expect(started, [1, 3, 4, 5]);
      expect(state.results.keys, [1, 4, 5]);
      expect(state.errors.keys, [3]);
      await analyze(3);
      expect(started, [1, 3, 4, 5, 3]);
      expect(state.ready([1, 3, 4, 5]), isTrue);
    },
  );

  for (final model in ['gemini', 'yolo-tflite']) {
    group('$model report photos', () {
      test('requires successful analysis for all five photos', () {
        final state = ReportPhotoAnalysis<int>();
        final photos = [1, 2, 3, 4, 5];
        for (final photo in photos) {
          expect(state.ready(photos), isFalse);
          state.results[photo] = result(model, 4);
        }
        expect(state.ready(photos), isTrue);
        expect(state.strongest(photos)!.wasteCount, 4);
      });
      test(
        'spam in each position can be removed without losing other results',
        () {
          for (final spamPhoto in [1, 2, 3, 4, 5]) {
            final state = ReportPhotoAnalysis<int>();
            final photos = [1, 2, 3, 4, 5];
            for (final photo in photos) {
              state.results[photo] = result(model, photo == spamPhoto ? 0 : 14);
            }
            expect(state.hasSpam(photos), isTrue);
            state.remove(spamPhoto);
            photos.remove(spamPhoto);
            expect(state.hasSpam(photos), isFalse);
            expect(state.ready(photos.reversed), isTrue);
            expect(state.strongest(photos)!.wasteCount, 14);
            expect(state.results.length, 4);
          }
        },
      );
      test('failed photos block submission until retried or removed', () {
        final state = ReportPhotoAnalysis<int>();
        state.results[1] = result(model, 26);
        state.errors[2] = 'Network error';
        expect(state.ready([1, 2]), isFalse);
        state.errors.remove(2);
        state.results[2] = result(model, 4);
        expect(state.ready([1, 2]), isTrue);
        expect(state.strongest([1, 2])!.wasteCount, 26);
        state.clear();
        expect(state.ready([]), isFalse);
        expect(state.hasSpam([]), isFalse);
      });
    });
  }
}
