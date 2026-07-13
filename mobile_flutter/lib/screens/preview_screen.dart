import "dart:io";

import "package:flutter/material.dart";
import "package:geolocator/geolocator.dart";

import "../services/api_service.dart";
import "../services/yolo_service.dart";
import "form_screen.dart";

// ── Category display helpers ───────────────────────────────────────────────────

const _categoryLabels = <String, String>{
  "plastic_bottle": "Plastic Bottle",
  "plastic_bag": "Plastic Bag",
  "fishing_net": "Fishing Net",
  "rope": "Rope",
  "styrofoam": "Styrofoam",
  "can": "Can",
  "glass": "Glass",
  "battery": "Battery",
  "diaper": "Diaper",
  "cigarette_butt": "Cigarette Butt",
};

const _categoryColors = <String, Color>{
  "plastic_bottle": Color(0xFF3B82F6),
  "plastic_bag": Color(0xFF06B6D4),
  "fishing_net": Color(0xFF14B8A6),
  "rope": Color(0xFFF59E0B),
  "styrofoam": Color(0xFF8B5CF6),
  "can": Color(0xFF6B7280),
  "glass": Color(0xFF10B981),
  "battery": Color(0xFFEF4444),
  "diaper": Color(0xFFEC4899),
  "cigarette_butt": Color(0xFFF97316),
};

Color _severityColor(String severity) {
  switch (severity) {
    case "Critical":
      return const Color(0xFFDC2626);
    case "High":
      return const Color(0xFFEA580C);
    case "Medium":
      return const Color(0xFFD97706);
    case "Low":
      return const Color(0xFF16A34A);
    default:
      return const Color(0xFF6B7280);
  }
}

// ── Preview screen ─────────────────────────────────────────────────────────────

/// Shows the captured image, automatically calls Gemini AI analysis,
/// and presents results. The user then confirms and proceeds to the form.
/// Zero Gemini SDK/key/prompt in this file — all AI happens server-side.
class PreviewScreen extends StatefulWidget {
  const PreviewScreen({
    super.key,
    required this.imageFile,
    required this.detection,
  });

  final File imageFile;
  final YoloDetectionResult detection;

  @override
  State<PreviewScreen> createState() => _PreviewScreenState();
}

class _PreviewScreenState extends State<PreviewScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  bool _isAnalyzing = false;
  GeminiAnalysisResult? _geminiResult;
  String? _geminiError;

  double? _latitude;
  double? _longitude;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _fetchLocationAndAnalyze();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _fetchLocationAndAnalyze() async {
    // Try to get location first (best-effort, non-blocking)
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (serviceEnabled) {
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
        }
        if (permission != LocationPermission.deniedForever &&
            permission != LocationPermission.denied) {
          final pos = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
            timeLimit: const Duration(seconds: 8),
          );
          _latitude = pos.latitude;
          _longitude = pos.longitude;
        }
      }
    } catch (_) {
      // Location unavailable — continue without coordinates
    }

    await _runGeminiAnalysis();
  }

  Future<void> _runGeminiAnalysis() async {
    if (!mounted) return;
    setState(() {
      _isAnalyzing = true;
      _geminiError = null;
      _geminiResult = null;
    });

    final service = ApiService();
    final result = await service.analyzeWithGemini(
      imageFile: widget.imageFile,
      latitude: _latitude ?? 0.0,
      longitude: _longitude ?? 0.0,
    );

    if (!mounted) return;
    setState(() {
      _isAnalyzing = false;
      if (result.success) {
        _geminiResult = result;
      } else {
        _geminiError = result.errorMessage ?? "AI analysis failed. Please try again.";
      }
    });
  }

  void _proceedToForm() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => FormScreen(
          imageFile: widget.imageFile,
          detection: widget.detection,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Waste Analysis"),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Image
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.file(
                    widget.imageFile,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
            ),

            // Bottom panel
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _isAnalyzing
                  ? _AnalyzingPanel(pulseAnimation: _pulseAnimation)
                  : _geminiError != null
                      ? _ErrorPanel(
                          error: _geminiError!,
                          onRetry: _runGeminiAnalysis,
                          onSkip: _proceedToForm,
                        )
                      : _geminiResult != null
                          ? _ResultPanel(
                              result: _geminiResult!,
                              onContinue: _proceedToForm,
                            )
                          : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Analyzing panel ────────────────────────────────────────────────────────────

class _AnalyzingPanel extends StatelessWidget {
  const _AnalyzingPanel({required this.pulseAnimation});
  final Animation<double> pulseAnimation;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: pulseAnimation,
            builder: (_, child) => Opacity(
              opacity: pulseAnimation.value,
              child: child,
            ),
            child: Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFF7C3AED).withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.auto_awesome,
                color: Color(0xFF7C3AED),
                size: 28,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            "Analyzing image…",
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "Gemini Vision AI is scanning your photo for waste.\nThis usually takes 3–8 seconds.",
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 16),
          const LinearProgressIndicator(
            backgroundColor: Color(0xFFEDE9FE),
            color: Color(0xFF7C3AED),
          ),
        ],
      ),
    );
  }
}

// ── Error panel ────────────────────────────────────────────────────────────────

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({
    required this.error,
    required this.onRetry,
    required this.onSkip,
  });
  final String error;
  final VoidCallback onRetry;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              error,
              style: TextStyle(color: Colors.red.shade800, fontSize: 13),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: onRetry,
            child: const Text("Retry Analysis"),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: onSkip,
            child: const Text("Skip & Submit Manually"),
          ),
        ],
      ),
    );
  }
}

// ── Result panel ───────────────────────────────────────────────────────────────

class _ResultPanel extends StatelessWidget {
  const _ResultPanel({required this.result, required this.onContinue});
  final GeminiAnalysisResult result;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Status row
          Row(
            children: [
              Icon(
                result.hasWaste ? Icons.warning_amber_rounded : Icons.check_circle_rounded,
                color: result.hasWaste ? Colors.orange.shade700 : Colors.green.shade700,
                size: 22,
              ),
              const SizedBox(width: 8),
              Text(
                result.hasWaste ? "Waste Detected" : "No Waste Found",
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: result.hasWaste ? Colors.orange.shade700 : Colors.green.shade700,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.auto_awesome, size: 12, color: Color(0xFF7C3AED)),
                    SizedBox(width: 4),
                    Text(
                      "Gemini AI",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF7C3AED),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Spam / no waste message
          if (!result.hasWaste) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Text(
                result.message ??
                    "No visible waste was detected in this image. Your report has been marked as Spam.",
                style: TextStyle(color: Colors.amber.shade900, fontSize: 13),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Categories
          if (result.hasWaste && result.categories.isNotEmpty) ...[
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: result.categories.map((cat) {
                final color = _categoryColors[cat] ?? Colors.grey;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    _categoryLabels[cat] ?? cat.replaceAll("_", " "),
                    style: TextStyle(
                      color: color,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 10),
          ],

          // Severity + Confidence row
          if (result.hasWaste) ...[
            Row(
              children: [
                if (result.severity != "None") ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _severityColor(result.severity).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: _severityColor(result.severity).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      result.severity,
                      style: TextStyle(
                        color: _severityColor(result.severity),
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                Text(
                  "Confidence: ${(result.confidence * 100).toStringAsFixed(0)}%",
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],

          // Reason
          if (result.reason.isNotEmpty) ...[
            Text(
              result.reason,
              style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 12),
          ],

          // Continue button
          FilledButton(
            onPressed: onContinue,
            child: Text(
              result.hasWaste ? "Continue to Submit Report" : "Done",
            ),
          ),
        ],
      ),
    );
  }
}
