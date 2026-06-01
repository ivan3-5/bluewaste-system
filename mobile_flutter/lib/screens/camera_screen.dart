import "dart:io";

import "package:flutter/material.dart";
import "package:image_picker/image_picker.dart";

import "../services/yolo_service.dart";
import "preview_screen.dart";

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  final ImagePicker _picker = ImagePicker();
  final YoloService _yoloService = YoloService.instance;

  bool _isProcessing = false;
  String? _errorMessage;

  bool _isModelError(String message) {
    final lower = message.toLowerCase();
    return lower.contains("unable to create model from buffer") ||
        lower.contains("interpreter") ||
        lower.contains("model file");
  }

  Future<void> _pickAndAnalyze(ImageSource source) async {
    final picked = await _picker.pickImage(
      source: source,
      imageQuality: 90,
    );
    if (picked == null) return;

    final imageFile = File(picked.path);

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      final detection = await _yoloService.detectWaste(imageFile);
      if (!mounted) return;

      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => PreviewScreen(
            imageFile: imageFile,
            detection: detection,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      final message = error.toString();

      if (_isModelError(message)) {
        final fallback = await _yoloService.buildFallbackResult(imageFile);
        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              "AI model unavailable on this device. Continuing without detection.",
            ),
          ),
        );

        await Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => PreviewScreen(
              imageFile: imageFile,
              detection: fallback,
            ),
          ),
        );
        return;
      }

      setState(() {
        _errorMessage = message;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Capture Waste Photo"),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.photo_camera_outlined, size: 72),
                const SizedBox(height: 16),
                Text(
                  "Take or upload one photo of the coastal area.",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: _isProcessing
                      ? null
                      : () => _pickAndAnalyze(ImageSource.camera),
                  icon: const Icon(Icons.photo_camera),
                  label: const Text("Use Camera"),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _isProcessing
                      ? null
                      : () => _pickAndAnalyze(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text("Choose from Gallery"),
                ),
                if (_isProcessing) ...[
                  const SizedBox(height: 24),
                  const CircularProgressIndicator(),
                  const SizedBox(height: 12),
                  const Text("Analyzing image with YOLO..."),
                ],
                if (_errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
