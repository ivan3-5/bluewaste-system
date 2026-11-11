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
      "wasteCount": 4,
      "severity": "Low",
      "reason": "Plastic and glass detected.",
    });
    expect(result.model, "yolo");
    expect(result.categories, ["plastic", "glass"]);
    expect(result.wasteCount, 4);
    expect(result.severity, WasteSeverity.high);
  });

  test("severity is based on the number of waste items detected", () {
    expect(WasteSeverity.fromWasteCount(0), WasteSeverity.spam);
    expect(WasteSeverity.fromWasteCount(1), WasteSeverity.moderate);
    expect(WasteSeverity.fromWasteCount(2), WasteSeverity.moderate);
    expect(WasteSeverity.fromWasteCount(3), WasteSeverity.high);
    expect(WasteSeverity.fromWasteCount(6), WasteSeverity.high);
    expect(WasteSeverity.fromWasteCount(7), WasteSeverity.critical);
    expect(WasteSeverity.fromWasteCount(20), WasteSeverity.critical);
  });

  test("on-device results identify the TFLite model", () {
    const result = DetectResult(
      hasWaste: false,
      message: "No waste detected.",
      wasteCount: 0,
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
                "wasteCount": 0,
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
      "wasteCount": 3,
      "severity": "High",
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
    expect(find.text("Confidence"), findsNothing);
    expect(find.text("Waste items detected"), findsOneWidget);
    expect(find.text("3"), findsOneWidget);
    expect(find.text("Analysis Details"), findsOneWidget);
    expect(find.text("A bottle is visible."), findsOneWidget);
  });
}
