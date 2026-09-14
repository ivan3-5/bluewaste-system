import "dart:io";
import "dart:math";
import "dart:typed_data";

import "package:flutter/services.dart";
import "package:image/image.dart" as img;
import "package:tflite_flutter/tflite_flutter.dart";

import "detect_service.dart";
import "../domain/report_models.dart";

// ── Custom Marine Debris / Waste Classes (from weights/best.pt - YOLO26-seg) ─
// 0: box_shaped_case, 1: buoy, 2: fishing_net, 3: fragment, 4: other_bottle,
// 5: other_container, 6: other_fishing_gear, 7: other_string, 8: others,
// 9: pet_bottle, 10: plastic_bag, 11: rope, 12: styrene_foam.
const int _numCustomWasteClasses = 13;

const Map<int, String> _customClassIdToWasteCategory = {
  0: "other",          // box_shaped_case
  1: "other",          // buoy
  2: "fishing_net",    // fishing_net
  3: "other",          // fragment
  4: "plastic_bottle", // other_bottle
  5: "other",          // other_container
  6: "fishing_net",    // other_fishing_gear
  7: "rope",           // other_string
  8: "other",          // others
  9: "plastic_bottle", // pet_bottle
  10: "plastic_bag",   // plastic_bag
  11: "rope",          // rope
  12: "styrofoam",     // styrene_foam
};

const Map<int, String> _customClassIdToLabel = {
  0: "Case Debris",
  1: "Buoy Debris",
  2: "Fishing Net",
  3: "Debris Fragment",
  4: "Plastic Bottle",
  5: "Waste Container",
  6: "Fishing Gear Debris",
  7: "String Debris",
  8: "Marine Debris",
  9: "PET Plastic Bottle",
  10: "Plastic Bag",
  11: "Rope",
  12: "Styrofoam",
};

// ── COCO fallback mapping (if standard yolov8n.tflite is loaded) ────────────
const Map<int, String> _cocoIdToWasteCategory = {
  39: "plastic_bottle",  // bottle
  41: "cup",             // cup
  45: "bowl",            // bowl
  40: "glass",           // wine glass
  75: "glass",           // vase
  33: "metal",           // kite
  73: "paper",           // book
  46: "organic",         // banana
  47: "organic",         // apple
  48: "organic",         // sandwich
  49: "organic",         // orange
  53: "other",           // pizza
  54: "other",           // donut
  26: "other",           // handbag
  28: "other",           // suitcase
};

// Minimum confidence to consider a detection valid (0-1).
const double _confThreshold = 0.20;

// NMS IoU threshold.
const double _nmsIouThreshold = 0.45;

// Input image size expected by the YOLO TFLite model.
const int _inputSize = 640;

// ── Box helper ───────────────────────────────────────────────────────────────
class _Box {
  _Box({
    required this.x1,
    required this.y1,
    required this.x2,
    required this.y2,
    required this.confidence,
    required this.classId,
  });

  final double x1, y1, x2, y2;
  final double confidence;
  final int classId;

  double get area => max(0, x2 - x1) * max(0, y2 - y1);

  double iou(_Box other) {
    final ix1 = max(x1, other.x1);
    final iy1 = max(y1, other.y1);
    final ix2 = min(x2, other.x2);
    final iy2 = min(y2, other.y2);
    final inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1);
    final union = area + other.area - inter;
    return union > 0 ? inter / union : 0;
  }
}

// ── TFLite service ────────────────────────────────────────────────────────────
class TFLiteService {
  TFLiteService._();

  static TFLiteService? _instance;
  static TFLiteService get instance {
    _instance ??= TFLiteService._();
    return _instance!;
  }

  Interpreter? _interpreter;
  bool _isInitialized = false;

  // Cached tensor shapes resolved after model load
  bool _isNHWC = true;
  int _numPreds = 8400;
  int _numAttrs = 49;
  bool _isCustomModel = true;

  /// Loads the TFLite model from assets. Prefers custom best.tflite, falls back to yolov8n.tflite.
  Future<void> initialize() async {
    if (_isInitialized) return;
    try {
      ByteData modelData;
      try {
        modelData = await rootBundle.load("assets/models/best.tflite");
        _isCustomModel = true;
      } catch (_) {
        modelData = await rootBundle.load("assets/models/yolov8n.tflite");
        _isCustomModel = false;
      }

      final buffer = modelData.buffer.asUint8List(
        modelData.offsetInBytes,
        modelData.lengthInBytes,
      );
      _interpreter = Interpreter.fromBuffer(buffer);

      // Resolve input layout
      final inputShape = _interpreter!.getInputTensor(0).shape;
      _isNHWC = inputShape.length == 4 && inputShape[3] == 3;

      // Resolve output dims
      final outputShape = _interpreter!.getOutputTensor(0).shape;
      if (outputShape.length >= 3) {
        _numAttrs = outputShape[1];
        _numPreds = outputShape[2];
        if (_numAttrs == 49) {
          _isCustomModel = true;
        } else if (_numAttrs == 84) {
          _isCustomModel = false;
        }
      }

      _isInitialized = true;
    } catch (e) {
      throw Exception("Failed to load TFLite model: $e");
    }
  }

  /// Runs on-device YOLO inference on [imageFile] and returns a [DetectResult].
  Future<DetectResult> runInference(File imageFile) async {
    if (!_isInitialized || _interpreter == null) {
      await initialize();
    }
    final interpreter = _interpreter!;

    // ── 1. Load & resize image ─────────────────────────────────────────────
    final bytes = await imageFile.readAsBytes();
    final img.Image? decoded = img.decodeImage(bytes);
    if (decoded == null) return DetectResult.unreachable();

    final resized = img.copyResize(decoded, width: _inputSize, height: _inputSize);

    // ── 2. Build input tensor ──────────────────────────────────────────────
    final inputBuffer = Float32List(1 * 3 * _inputSize * _inputSize);
    if (_isNHWC) {
      // [1, H, W, 3]
      int idx = 0;
      for (int y = 0; y < _inputSize; y++) {
        for (int x = 0; x < _inputSize; x++) {
          final pixel = resized.getPixel(x, y);
          inputBuffer[idx++] = pixel.r / 255.0;
          inputBuffer[idx++] = pixel.g / 255.0;
          inputBuffer[idx++] = pixel.b / 255.0;
        }
      }
    } else {
      // [1, 3, H, W] NCHW
      for (int c = 0; c < 3; c++) {
        for (int y = 0; y < _inputSize; y++) {
          for (int x = 0; x < _inputSize; x++) {
            final pixel = resized.getPixel(x, y);
            final val = c == 0 ? pixel.r : c == 1 ? pixel.g : pixel.b;
            inputBuffer[c * _inputSize * _inputSize + y * _inputSize + x] =
                val / 255.0;
          }
        }
      }
    }

    // ── 3. Prepare output buffer [1, numAttrs, numPreds] ──────────────────
    final outputData = List.generate(
      1,
      (_) => List.generate(
        _numAttrs,
        (_) => List.filled(_numPreds, 0.0),
      ),
    );

    // ── 4. Run inference ───────────────────────────────────────────────────
    final inputTensor = _isNHWC
        ? _reshapeNHWC(inputBuffer)
        : _reshapeNCHW(inputBuffer);

    try {
      interpreter.run(inputTensor, outputData);
    } catch (_) {
      // Fallback for multi-output models (e.g. segmentation output tensor)
      final outputs = <int, Object>{0: outputData};
      final outCount = interpreter.getOutputTensors().length;
      if (outCount > 1) {
        for (int i = 1; i < outCount; i++) {
          final s = interpreter.getOutputTensor(i).shape;
          if (s.length == 4) {
            outputs[i] = List.generate(
              s[0],
              (_) => List.generate(
                s[1],
                (_) => List.generate(
                  s[2],
                  (_) => List.filled(s[3], 0.0),
                ),
              ),
            );
          }
        }
      }
      interpreter.runForMultipleInputs([inputTensor], outputs);
    }

    // ── 5. Decode + NMS + map to DetectResult ────────────────────────────
    final boxes = _decodeBoxes(outputData[0]);
    final kept = _nms(boxes);
    return _buildDetectResult(kept);
  }

  // ── Tensor reshaping ───────────────────────────────────────────────────────

  List _reshapeNHWC(Float32List buf) {
    // [1, 640, 640, 3]
    int idx = 0;
    return [
      List.generate(
        _inputSize,
        (_) => List.generate(
          _inputSize,
          (_) => [buf[idx++], buf[idx++], buf[idx++]],
        ),
      )
    ];
  }

  List _reshapeNCHW(Float32List buf) {
    // [1, 3, 640, 640]
    return [
      List.generate(
        3,
        (c) => List.generate(
          _inputSize,
          (y) => List.generate(
            _inputSize,
            (x) => buf[c * _inputSize * _inputSize + y * _inputSize + x],
          ),
        ),
      )
    ];
  }

  // ── Decode raw YOLO output tensor ─────────────────────────────────────────

  List<_Box> _decodeBoxes(List<List<double>> output) {
    final boxes = <_Box>[];
    final classCount = _isCustomModel ? _numCustomWasteClasses : (_numAttrs - 4);

    for (int i = 0; i < _numPreds; i++) {
      final cx = output[0][i];
      final cy = output[1][i];
      final w = output[2][i];
      final h = output[3][i];

      double bestConf = 0;
      int bestClass = -1;
      for (int c = 4; c < 4 + classCount && c < _numAttrs; c++) {
        final score = output[c][i];
        if (score > bestConf) {
          bestConf = score;
          bestClass = c - 4;
        }
      }

      if (bestConf < _confThreshold || bestClass < 0) continue;

      boxes.add(_Box(
        x1: cx - w / 2,
        y1: cy - h / 2,
        x2: cx + w / 2,
        y2: cy + h / 2,
        confidence: bestConf,
        classId: bestClass,
      ));
    }
    return boxes;
  }

  // ── Non-Maximum Suppression ────────────────────────────────────────────────

  List<_Box> _nms(List<_Box> boxes) {
    final sorted = List<_Box>.from(boxes)
      ..sort((a, b) => b.confidence.compareTo(a.confidence));

    final suppressed = List.filled(sorted.length, false);
    final kept = <_Box>[];

    for (int i = 0; i < sorted.length; i++) {
      if (suppressed[i]) continue;
      kept.add(sorted[i]);
      for (int j = i + 1; j < sorted.length; j++) {
        if (!suppressed[j] && sorted[i].iou(sorted[j]) > _nmsIouThreshold) {
          suppressed[j] = true;
        }
      }
    }
    return kept;
  }

  // ── Build DetectResult from NMS-filtered boxes ─────────────────────────────

  DetectResult _buildDetectResult(List<_Box> boxes) {
    if (boxes.isEmpty) {
      return const DetectResult(
        hasWaste: false,
        message: "No objects detected in the photo.",
        confidence: 0.0,
        severity: WasteSeverity.spam,
        layer1Passed: true,
        categories: [],
        labels: [],
        allLabels: [],
        spamReason: "No visible waste or pollution detected in the submitted image.",
      );
    }

    // Filter to waste-related detections
    final wasteBoxes = _isCustomModel
        ? boxes.where((b) => _customClassIdToWasteCategory.containsKey(b.classId)).toList()
        : boxes.where((b) => _cocoIdToWasteCategory.containsKey(b.classId)).toList();

    if (wasteBoxes.isEmpty) {
      return const DetectResult(
        hasWaste: false,
        message: "No waste-related objects detected.",
        confidence: 0.0,
        severity: WasteSeverity.spam,
        layer1Passed: true,
        categories: [],
        labels: [],
        allLabels: [],
        spamReason: "No visible waste or pollution detected in the submitted image.",
      );
    }

    double maxConf = 0;
    final categorySet = <String>{};
    final labelConfidenceMap = <String, double>{};

    for (final b in wasteBoxes) {
      if (b.confidence > maxConf) maxConf = b.confidence;
      final cat = _isCustomModel
          ? _customClassIdToWasteCategory[b.classId]
          : _cocoIdToWasteCategory[b.classId];
      if (cat != null) {
        categorySet.add(cat);
        final labelText = _isCustomModel
            ? (_customClassIdToLabel[b.classId] ?? wasteCategoryLabels[cat] ?? cat.replaceAll("_", " "))
            : (wasteCategoryLabels[cat] ?? cat.replaceAll("_", " "));
        if (!labelConfidenceMap.containsKey(labelText) || b.confidence > labelConfidenceMap[labelText]!) {
          labelConfidenceMap[labelText] = b.confidence;
        }
      }
    }

    final categories = categorySet.toList();
    final severity = _confidenceToSeverity(maxConf);
    final labels = labelConfidenceMap.entries
        .map((e) => WasteLabel(label: e.key, confidence: e.value))
        .toList()
      ..sort((a, b) => b.confidence.compareTo(a.confidence));

    final message = _buildMessage(List.from(categories), maxConf);

    return DetectResult(
      hasWaste: true,
      message: message,
      confidence: maxConf,
      severity: severity,
      layer1Passed: true,
      categories: categories,
      labels: labels,
      allLabels: labels,
      spamReason: severity == WasteSeverity.spam
          ? "Waste detected with low confidence."
          : null,
      reason: message,
    );
  }

  WasteSeverity _confidenceToSeverity(double conf) {
    if (conf >= 0.90) return WasteSeverity.critical;
    if (conf >= 0.70) return WasteSeverity.high;
    if (conf >= 0.50) return WasteSeverity.moderate;
    if (conf >= 0.20) return WasteSeverity.low;
    return WasteSeverity.spam;
  }

  String _buildMessage(List<String> categories, double conf) {
    if (categories.isEmpty) {
      return "Waste detected with ${(conf * 100).toStringAsFixed(1)}% confidence.";
    }
    final readable =
        categories.map((c) => c.replaceAll("_", " ")).toSet().toList();
    if (readable.length == 1) {
      return "Detected ${readable.first} waste — ${(conf * 100).toStringAsFixed(1)}% confidence.";
    }
    final last = readable.removeLast();
    return "Detected ${readable.join(", ")} and $last waste — ${(conf * 100).toStringAsFixed(1)}% confidence.";
  }

  void dispose() {
    _interpreter?.close();
    _interpreter = null;
    _isInitialized = false;
    _instance = null;
  }
}
