import "dart:io";

import "package:flutter/material.dart";
import "package:flutter_test/flutter_test.dart";
import "package:dio/dio.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/data/detect_service.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/presentation/widgets/report_result_card.dart";

void main() {
  test("server results retain the selected model and categories", () {
    final result = DetectResult.fromJson({
      "hasWaste": true,
      "model": "yolo",
      "categories": ["plastic", "glass"],
      "severity": "High",
      "confidence": 0.8,
      "reason": "Plastic and glass detected.",
    });
    expect(result.model, "yolo");
    expect(result.categories, ["plastic", "glass"]);
    expect(result.severity, WasteSeverity.high);
    expect(result.confidence, 0.8);
  });

  test("on-device results identify the TFLite model", () {
    const result = DetectResult(
      hasWaste: false,
      message: "No waste detected.",
      confidence: 0,
      severity: WasteSeverity.spam,
      layer1Passed: true,
    );
    expect(result.model, "yolo-tflite");
  });

  test("cloud mode retains the model returned by the server", () async {
    final dio = Dio(BaseOptions(baseUrl: "https://example.test/api"));
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          expect(options.path, "/ai/analyze-report");
          final form = options.data as FormData;
          expect(form.files.single.value.contentType.toString(), "image/png");
          handler.resolve(
            Response(
              requestOptions: options,
              data: {
                "provider": "yolo",
                "model": "yolo",
                "hasWaste": false,
                "categories": <String>[],
                "severity": "None",
                "confidence": 0.0,
                "reason": "No waste detected.",
              },
            ),
          );
        },
      ),
    );
    final result = await DetectService(dio: dio, useServer: true).detect(
      imageFile: File("assets/images/logo-final.png"),
      latitude: 1,
      longitude: 2,
    );
    expect(result.model, "yolo");
    expect(result.hasWaste, false);
  });

  test("cloud mode rejects incomplete responses", () async {
    final dio = Dio(BaseOptions(baseUrl: "https://example.test/api"));
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              data: {"provider": "yolo", "model": "yolo"},
            ),
          );
        },
      ),
    );
    expect(
      DetectService(dio: dio, useServer: true).detect(
        imageFile: File("assets/images/logo-final.png"),
        latitude: 1,
        longitude: 2,
      ),
      throwsA(isA<DetectServerException>()),
    );
  });

  testWidgets("summary shows detection fields and available details", (
    tester,
  ) async {
    final result = DetectResult.fromJson({
      "hasWaste": true,
      "model": "gemini-test",
      "categories": ["plastic_bottle"],
      "severity": "High",
      "confidence": 0.8,
      "reason": "A bottle is visible.",
    });
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: ReportResultCard(result: result, onDismiss: () {}),
          ),
        ),
      ),
    );
    expect(find.text("Analysis Summary"), findsOneWidget);
    expect(find.text("Waste Detected"), findsOneWidget);
    expect(find.text("Confidence"), findsOneWidget);
    expect(find.text("80.0%"), findsOneWidget);
    expect(find.text("Analysis Details"), findsOneWidget);
    expect(find.text("A bottle is visible."), findsOneWidget);
  });
}
