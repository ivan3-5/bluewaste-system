import "dart:io";

import "package:flutter/material.dart";

import "../services/yolo_service.dart";
import "form_screen.dart";

class PreviewScreen extends StatelessWidget {
  const PreviewScreen({
    super.key,
    required this.imageFile,
    required this.detection,
  });

  final File imageFile;
  final YoloDetectionResult detection;

  Color get _badgeColor =>
      detection.hasWaste ? Colors.red.shade700 : Colors.green.shade700;

  String get _badgeLabel => detection.hasWaste ? "With Waste" : "No Waste";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Preview Detection")),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        AspectRatio(
                          aspectRatio: detection.imageSize.width /
                              detection.imageSize.height,
                          child: Image.file(
                            imageFile,
                            fit: BoxFit.contain,
                          ),
                        ),
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _DetectionPainter(
                              boxes: detection.boxes,
                              imageSize: detection.imageSize,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, -6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: _badgeColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          _badgeLabel,
                          style: TextStyle(
                            color: _badgeColor,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Text(
                        "Confidence ${(detection.confidence * 100).toStringAsFixed(1)}%",
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    detection.boxes.isEmpty
                        ? "No waste was detected above the confidence threshold."
                        : "${detection.boxes.length} waste box${detection.boxes.length == 1 ? "" : "es"} detected.",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => FormScreen(
                            imageFile: imageFile,
                            detection: detection,
                          ),
                        ),
                      );
                    },
                    child: const Text("Submit Report"),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetectionPainter extends CustomPainter {
  const _DetectionPainter({
    required this.boxes,
    required this.imageSize,
  });

  final List<YoloBoundingBox> boxes;
  final Size imageSize;

  @override
  void paint(Canvas canvas, Size size) {
    if (boxes.isEmpty || imageSize.width <= 0 || imageSize.height <= 0) {
      return;
    }

    final scaleX = size.width / imageSize.width;
    final scaleY = size.height / imageSize.height;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..color = Colors.redAccent;

    final fillPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = Colors.redAccent.withValues(alpha: 0.12);

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    for (final box in boxes) {
      final rect = Rect.fromLTWH(
        box.rect.left * scaleX,
        box.rect.top * scaleY,
        box.rect.width * scaleX,
        box.rect.height * scaleY,
      );

      canvas.drawRRect(
        RRect.fromRectAndRadius(rect, const Radius.circular(10)),
        fillPaint,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(rect, const Radius.circular(10)),
        paint,
      );

      final label =
          "${box.label} ${(box.confidence * 100).toStringAsFixed(1)}%";
      textPainter.text = TextSpan(
        text: label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      );
      textPainter.layout();

      final background = RRect.fromRectAndRadius(
        Rect.fromLTWH(
          rect.left,
          (rect.top - textPainter.height - 10).clamp(0, size.height),
          textPainter.width + 16,
          textPainter.height + 8,
        ),
        const Radius.circular(8),
      );

      canvas.drawRRect(
        background,
        Paint()..color = Colors.black.withValues(alpha: 0.72),
      );
      textPainter.paint(
        canvas,
        Offset(background.left + 8, background.top + 4),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _DetectionPainter oldDelegate) {
    return oldDelegate.boxes != boxes || oldDelegate.imageSize != imageSize;
  }
}
