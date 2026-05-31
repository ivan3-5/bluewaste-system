import "dart:io";
import "dart:math" as math;
import "dart:ui";

import "package:image/image.dart" as img;
import "package:shared_preferences/shared_preferences.dart";
import "mock_yolo_service.dart";
import "package:tflite_flutter/tflite_flutter.dart";

class YoloBoundingBox {
  const YoloBoundingBox({
    required this.rect,
    required this.confidence,
    required this.label,
    required this.classIndex,
  });

  final Rect rect;
  final double confidence;
  final String label;
  final int classIndex;
}

class YoloDetectionResult {
  const YoloDetectionResult({
    required this.label,
    required this.confidence,
    required this.boxes,
    required this.imageSize,
  });

  final String label;
  final double confidence;
  final List<YoloBoundingBox> boxes;
  final Size imageSize;

  bool get hasWaste => label == "with_waste";
}

class YoloService {
  YoloService._();

  static final YoloService instance = YoloService._();

  static const double _threshold = 0.5;
  static const double _nmsIouThreshold = 0.45;
  static const String _assetPath = "assets/models/yolov8n.tflite";

  Interpreter? _interpreter;

  Future<void> loadModel() async {
    if (_interpreter != null) return;

    final options = InterpreterOptions()..threads = 4;
    _interpreter = await Interpreter.fromAsset(_assetPath, options: options);
  }

  Future<YoloDetectionResult> detectWaste(File imageFile) async {
    // If demo mode is enabled, use the mock service which returns deterministic odd/even responses.
    try {
      final prefs = await SharedPreferences.getInstance();
      final demoMode = prefs.getBool('demo_mode') ?? false;
      if (demoMode) {
        return await MockYoloService.detectWaste(imageFile);
      }
    } catch (e) {
      // ignore and fall back to real analysis
    }

    await loadModel();
    final interpreter = _interpreter;
    if (interpreter == null) {
      throw StateError("YOLO interpreter is not available.");
    }

    final bytes = await imageFile.readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) {
      throw StateError("Unable to decode selected image.");
    }

    final originalSize = Size(
      decoded.width.toDouble(),
      decoded.height.toDouble(),
    );

    const inputWidth = 640;
    const inputHeight = 640;

    final resized = img.copyResize(
      decoded,
      width: inputWidth,
      height: inputHeight,
      interpolation: img.Interpolation.linear,
    );

    final inputTensor = interpreter.getInputTensor(0);
    final inputShape = inputTensor.shape;
    final nchw = inputShape.length == 4 && inputShape[1] == 3;
    final input = nchw
        ? List.generate(
            1,
            (_) => List.generate(
              3,
              (channel) => List.generate(
                inputHeight,
                (y) => List.generate(
                  inputWidth,
                  (x) {
                    final pixel = resized.getPixel(x, y);
                    final channelValue = switch (channel) {
                      0 => pixel.r,
                      1 => pixel.g,
                      _ => pixel.b,
                    };
                    return channelValue / 255.0;
                  },
                  growable: false,
                ),
                growable: false,
              ),
              growable: false,
            ),
            growable: false,
          )
        : List.generate(
            1,
            (_) => List.generate(
              inputHeight,
              (y) => List.generate(
                inputWidth,
                (x) {
                  final pixel = resized.getPixel(x, y);
                  return <double>[
                    pixel.r / 255.0,
                    pixel.g / 255.0,
                    pixel.b / 255.0,
                  ];
                },
                growable: false,
              ),
              growable: false,
            ),
            growable: false,
          );

    final outputShape = interpreter.getOutputTensor(0).shape;
    final output = _buildOutputBuffer(outputShape);
    interpreter.run(input, output);

    final predictions = _extractPredictions(output, outputShape);
    final boxes = _postProcessPredictions(
      predictions,
      originalSize,
      inputWidth.toDouble(),
      inputHeight.toDouble(),
    );

    if (boxes.isEmpty) {
      return YoloDetectionResult(
        label: "no_waste",
        confidence: 0,
        boxes: const [],
        imageSize: originalSize,
      );
    }

    final bestConfidence = boxes.first.confidence;
    return YoloDetectionResult(
      label: "with_waste",
      confidence: bestConfidence,
      boxes: boxes,
      imageSize: originalSize,
    );
  }

  dynamic _buildOutputBuffer(List<int> shape) {
    if (shape.length == 3) {
      return List.generate(
        shape[0],
        (_) => List.generate(
          shape[1],
          (_) => List.filled(shape[2], 0.0),
          growable: false,
        ),
        growable: false,
      );
    }

    if (shape.length == 2) {
      return List.generate(
        shape[0],
        (_) => List.filled(shape[1], 0.0),
        growable: false,
      );
    }

    if (shape.length == 4) {
      return List.generate(
        shape[0],
        (_) => List.generate(
          shape[1],
          (_) => List.generate(
            shape[2],
            (_) => List.filled(shape[3], 0.0),
            growable: false,
          ),
          growable: false,
        ),
        growable: false,
      );
    }

    return List.filled(1, 0.0);
  }

  List<List<double>> _extractPredictions(dynamic output, List<int> shape) {
    final predictions = <List<double>>[];

    if (shape.length == 3 && shape[1] == 5) {
      final count = shape[2];
      for (var i = 0; i < count; i++) {
        predictions.add([
          (output[0][0][i] as num).toDouble(),
          (output[0][1][i] as num).toDouble(),
          (output[0][2][i] as num).toDouble(),
          (output[0][3][i] as num).toDouble(),
          (output[0][4][i] as num).toDouble(),
        ]);
      }
      return predictions;
    }

    if (shape.length == 3) {
      final count = shape[1];
      for (var i = 0; i < count; i++) {
        final row = <double>[];
        for (var j = 0; j < shape[2]; j++) {
          row.add((output[0][i][j] as num).toDouble());
        }
        predictions.add(row);
      }
      return predictions;
    }

    if (shape.length == 2) {
      final count = shape[0];
      for (var i = 0; i < count; i++) {
        final row = <double>[];
        for (var j = 0; j < shape[1]; j++) {
          row.add((output[i][j] as num).toDouble());
        }
        predictions.add(row);
      }
      return predictions;
    }

    return predictions;
  }

  List<YoloBoundingBox> _postProcessPredictions(
    List<List<double>> predictions,
    Size originalSize,
    double inputWidth,
    double inputHeight,
  ) {
    final candidates = <YoloBoundingBox>[];
    final scaleX = originalSize.width / inputWidth;
    final scaleY = originalSize.height / inputHeight;

    for (final prediction in predictions) {
      if (prediction.length < 5) {
        continue;
      }

      final xCenter = prediction[0];
      final yCenter = prediction[1];
      final width = prediction[2];
      final height = prediction[3];

      double confidence;
      int classIndex = 1;
      String label = "with_waste";

      if (prediction.length > 5) {
        final classScores = prediction.sublist(4);
        final maxScore = classScores.reduce(math.max);
        classIndex = classScores.indexOf(maxScore);
        confidence = maxScore;
        label = classIndex == 0 ? "no_waste" : "with_waste";
      } else {
        confidence = prediction[4];
      }

      if (confidence < _threshold) {
        continue;
      }

      if (label == "no_waste") {
        continue;
      }

      final rect = Rect.fromCenter(
        center: Offset(xCenter * scaleX, yCenter * scaleY),
        width: width * scaleX,
        height: height * scaleY,
      );

      candidates.add(
        YoloBoundingBox(
          rect: rect,
          confidence: confidence,
          label: label,
          classIndex: classIndex,
        ),
      );
    }

    candidates.sort((a, b) => b.confidence.compareTo(a.confidence));
    final selected = <YoloBoundingBox>[];

    for (final candidate in candidates) {
      final shouldKeep = selected.every(
        (existing) =>
            _intersectionOverUnion(existing.rect, candidate.rect) <
            _nmsIouThreshold,
      );
      if (shouldKeep) {
        selected.add(candidate);
      }
    }

    return selected;
  }

  double _intersectionOverUnion(Rect a, Rect b) {
    final left = math.max(a.left, b.left);
    final top = math.max(a.top, b.top);
    final right = math.min(a.right, b.right);
    final bottom = math.min(a.bottom, b.bottom);

    if (right <= left || bottom <= top) {
      return 0;
    }

    final intersectionArea = (right - left) * (bottom - top);
    final unionArea =
        a.width * a.height + b.width * b.height - intersectionArea;
    if (unionArea <= 0) {
      return 0;
    }

    return intersectionArea / unionArea;
  }
}
