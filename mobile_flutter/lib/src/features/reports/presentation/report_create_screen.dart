import "dart:io";

import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:geolocator/geolocator.dart";
import "package:image_picker/image_picker.dart";
import "package:dio/dio.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../../../core/config/app_env.dart";
import "../data/report_service.dart";
import "../domain/report_models.dart";
import "../../../../services/detect_service.dart";

class ReportCreateScreen extends ConsumerStatefulWidget {
  const ReportCreateScreen({super.key});

  @override
  ConsumerState<ReportCreateScreen> createState() => _ReportCreateScreenState();
}

class _ReportCreateScreenState extends ConsumerState<ReportCreateScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  final List<XFile> _images = <XFile>[];
  final ImagePicker _picker = ImagePicker();

  String _category = "PLASTIC_WASTE";
  bool _isAnonymous = false;
  double? _latitude;
  double? _longitude;
  bool _isSubmitting = false;
  bool _isOutsideZone = false;

  // ── YOLO detection state ──────────────────────────────────────────────────
  bool _isDetecting = false;
  double? _detectedConfidence; // null = not yet run; 0.0 = no waste
  bool _isSpamFlagged = false;
  bool _detectionFailed = false; // true = server unreachable

  bool get _hasLocation => _latitude != null && _longitude != null;

  /// Detection must have run successfully before submission is allowed.
  bool get _detectionReady =>
      _detectedConfidence != null && !_detectionFailed;

  int get _remainingImageSlots => 1 - _images.length;

  // ── helpers ───────────────────────────────────────────────────────────────

  /// Resets all detection state to pristine (call when image is removed).
  void _resetDetection() {
    _detectedConfidence = null;
    _isSpamFlagged = false;
    _detectionFailed = false;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  // ── Detection ─────────────────────────────────────────────────────────────

  /// Calls the FastAPI /detect endpoint and handles the result in-place.
  /// Always called after a new image is picked.
  Future<void> _runDetection(XFile pickedFile) async {
    if (!mounted) return;
    setState(() {
      _isDetecting = true;
      _detectionFailed = false;
      _detectedConfidence = null;
      _isSpamFlagged = false;
    });

    DetectResult? result;
    String? errorMessage;

    try {
      result = await DetectService.instance.detect(File(pickedFile.path));
    } on DetectServerUnreachableException catch (e) {
      errorMessage = e.message;
    } on DetectServerException catch (e) {
      errorMessage = e.message;
    } catch (e) {
      errorMessage = "Detection failed unexpectedly. Please try again.";
    }

    if (!mounted) return;

    if (errorMessage != null) {
      // Server unreachable — remove the image and block submission.
      setState(() {
        _images.clear();
        _isDetecting = false;
        _detectionFailed = true;
      });
      _showMessage("❌ Detection error: $errorMessage");
      return;
    }

    setState(() {
      _isDetecting = false;
      _detectedConfidence = result!.confidence;
      _isSpamFlagged = false; // may be updated by dialog below
    });

    if (!result!.hasWaste) {
      await _showNoWasteDialog();
    }
  }

  /// Dialog shown when the model returns has_waste: false.
  Future<void> _showNoWasteDialog() async {
    if (!mounted) return;
    final action = await showDialog<_NoWasteAction>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text("No Waste Detected"),
        content: const Text(
          "Our system did not detect any waste in your photo. "
          "Submitting false reports may be flagged as spam.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(_NoWasteAction.retake),
            child: const Text("Retake Photo"),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(_NoWasteAction.submitAnyway),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.destructive,
            ),
            child: const Text("Submit Anyway"),
          ),
        ],
      ),
    );

    if (!mounted) return;

    if (action == _NoWasteAction.retake || action == null) {
      setState(() {
        _images.clear();
        _resetDetection();
      });
    } else {
      // Submit Anyway — mark as spam flagged
      setState(() => _isSpamFlagged = true);
    }
  }

  Future<void> _pickFromCamera() async {
    final picked =
        await _picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (picked == null) {
      return;
    }

    // Replace any existing image — only one image is required/allowed.
    setState(() {
      _images.clear();
      _images.add(picked);
      _resetDetection();
    });

    await _runDetection(picked);
  }

  Future<void> _pickFromGallery() async {
    // Pick a single image from gallery and replace any existing image.
    final picked =
        await _picker.pickImage(source: ImageSource.gallery, imageQuality: 75);
    if (picked == null) return;

    setState(() {
      _images.clear();
      _images.add(picked);
      _resetDetection();
    });

    await _runDetection(picked);
  }

  Future<void> _getCurrentLocation() async {
    final enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) {
      // Offer to open location settings so the user can enable services.
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Location services are disabled."),
          action: SnackBarAction(
            label: "Open settings",
            onPressed: () => Geolocator.openLocationSettings(),
          ),
        ),
      );
      return;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied) {
      _showMessage("Location permission is required.");
      return;
    }

    if (permission == LocationPermission.deniedForever) {
      // Permission permanently denied — guide user to app settings.
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Location permission permanently denied."),
          action: SnackBarAction(
            label: "Open settings",
            onPressed: () => Geolocator.openAppSettings(),
          ),
        ),
      );
      return;
    }

    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    // Validate against active reporting zones
    final outside = await _checkOutsideZones(
      position.latitude,
      position.longitude,
    );

    setState(() {
      _latitude = position.latitude;
      _longitude = position.longitude;
      _isOutsideZone = outside;
    });

    if (outside) {
      _showMessage(
        "Reporting is only allowed within designated coastal zones.",
      );
    }
  }

  /// Returns true if [lat]/[lng] is NOT inside any active reporting zone.
  /// Falls back to false (allow) on network errors so offline users aren't blocked.
  Future<bool> _checkOutsideZones(double lat, double lng) async {
    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppEnv.apiBaseUrl,
        connectTimeout: const Duration(seconds: 6),
        receiveTimeout: const Duration(seconds: 6),
      ));
      final response = await dio.get<List<dynamic>>(
        "/reporting-zones",
        queryParameters: <String, dynamic>{"activeOnly": "true"},
      );
      final zones = response.data;
      if (zones == null || zones.isEmpty) return false;
      for (final zone in zones) {
        final coords = (zone["coordinates"] as List<dynamic>)
            .map((c) => <String, double>{
                  "lat": (c["lat"] as num).toDouble(),
                  "lng": (c["lng"] as num).toDouble(),
                })
            .toList();
        if (_pointInPolygon(lat, lng, coords)) return false;
      }
      return true;
    } catch (_) {
      return false; // Allow on error
    }
  }

  /// Ray-casting point-in-polygon test.
  bool _pointInPolygon(
    double lat,
    double lng,
    List<Map<String, double>> polygon,
  ) {
    bool inside = false;
    final n = polygon.length;
    int j = n - 1;
    for (int i = 0; i < n; i++) {
      final xi = polygon[i]["lng"]!;
      final yi = polygon[i]["lat"]!;
      final xj = polygon[j]["lng"]!;
      final yj = polygon[j]["lat"]!;
      final intersect = ((yi > lat) != (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
      j = i;
    }
    return inside;
  }

  Future<void> _submitReport() async {
    final title = _titleController.text.trim();
    final description = _descriptionController.text.trim();

    if (title.length < 5) {
      _showMessage("Title must be at least 5 characters.");
      return;
    }

    if (description.length < 20) {
      _showMessage("Description must be at least 20 characters.");
      return;
    }

    if (_latitude == null || _longitude == null) {
      _showMessage("Please capture your location first.");
      return;
    }

    if (_images.isEmpty) {
      _showMessage("Please attach one clear image before submitting.");
      return;
    }

    if (!_detectionReady) {
      _showMessage("Please wait for detection to complete or retake the photo.");
      return;
    }

    // Hard zone guard — catches any state mismatch
    if (_isOutsideZone) {
      _showMessage(
        "Reporting is only allowed within the designated coastal zone.",
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final reportService = ref.read(reportServiceProvider);

      final report = await reportService.createReport(
        title: title,
        description: description,
        category: _category,
        latitude: _latitude!,
        longitude: _longitude!,
        isAnonymous: _isAnonymous,
        isSpamFlagged: _isSpamFlagged,
        spamReason: _isSpamFlagged ? "No waste detected by YOLOv8" : null,
        yoloConfidence: _detectedConfidence ?? 0.0,
      );

      if (_images.isNotEmpty) {
        await reportService.uploadReportImages(
          reportId: report.id,
          images: _images,
          type: "REPORT",
        );
      }

      _titleController.clear();
      _descriptionController.clear();

      setState(() {
        _images.clear();
        _isAnonymous = false;
        _category = "PLASTIC_WASTE";
        _resetDetection();
      });

      _showMessage("Report submitted successfully.");
    } catch (error) {
      _showMessage(error.toString());
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showMessage(String message) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = wasteCategoryLabels.entries.toList(growable: false);
    final missingRequirements = <String>[
      if (_titleController.text.trim().length < 5) "Title",
      if (_descriptionController.text.trim().length < 20) "Description",
      if (!_hasLocation) "Location",
    ];
    if (_images.isEmpty) missingRequirements.add("Photo");
    if (_images.isNotEmpty && !_detectionReady) {
      missingRequirements.add("Detection");
    }
    final canSubmit = !_isSubmitting &&
        !_isDetecting &&
        missingRequirements.isEmpty &&
        !_isOutsideZone &&
        _images.isNotEmpty;

    return ListView(
      padding: AppSpacing.screen,
      children: [
        // ── Detection loading overlay ────────────────────────────────────────
        if (_isDetecting)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    SizedBox(width: AppSpacing.sm),
                    Text(
                      "Analyzing image for waste…",
                      style: TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ),
          ),

        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _FormSectionHeader(
                icon: Icons.edit_note,
                title: "Submit Waste Report",
                subtitle:
                    "Provide clear details, location, and photos for faster validation.",
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.xs,
                runSpacing: AppSpacing.xs,
                children: const [
                  _StepChip(number: "1", label: "Details"),
                  _StepChip(number: "2", label: "Location"),
                  _StepChip(number: "3", label: "Photos"),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Report Details",
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                "Required: title (5+) and description (20+ characters).",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.mutedForeground,
                    ),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _titleController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  labelText: "Title",
                  prefixIcon: Icon(Icons.title_outlined),
                ),
                maxLength: 100,
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _descriptionController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  labelText: "Description",
                  alignLabelWithHint: true,
                  prefixIcon: Icon(Icons.description_outlined),
                ),
                minLines: 4,
                maxLines: 6,
              ),
              const SizedBox(height: AppSpacing.sm),
              DropdownButtonFormField<String>(
                initialValue: _category,
                decoration: const InputDecoration(
                  labelText: "Category",
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                items: categories
                    .map(
                      (entry) => DropdownMenuItem<String>(
                        value: entry.key,
                        child: Text(entry.value),
                      ),
                    )
                    .toList(growable: false),
                onChanged: (value) {
                  if (value == null) {
                    return;
                  }
                  setState(() => _category = value);
                },
              ),
              const SizedBox(height: AppSpacing.sm),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: SwitchListTile(
                  title: const Text("Submit anonymously"),
                  subtitle: const Text("Hide your identity from public view"),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                  ),
                  value: _isAnonymous,
                  onChanged: (value) => setState(() => _isAnonymous = value),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _FormSectionHeader(
                icon: Icons.my_location,
                title: "Location",
                subtitle: _hasLocation
                    ? "Location captured. You can update it anytime."
                    : "Capture your current location before submitting.",
              ),
              const SizedBox(height: AppSpacing.sm),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: _hasLocation
                      ? AppColors.tint(AppColors.success, opacity: 0.1)
                      : AppColors.secondary,
                  border: Border.all(
                    color: _hasLocation ? AppColors.success : AppColors.border,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      _hasLocation
                          ? Icons.check_circle_outline
                          : Icons.location_off_outlined,
                      color: _hasLocation
                          ? AppColors.success
                          : AppColors.mutedForeground,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Text(
                        _hasLocation
                            ? "${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}"
                            : "No location captured yet.",
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: _hasLocation
                                  ? AppColors.success
                                  : AppColors.mutedForeground,
                              fontWeight: _hasLocation
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              FilledButton.tonalIcon(
                onPressed: _getCurrentLocation,
                icon: const Icon(Icons.my_location),
                label:
                    Text(_hasLocation ? "Update Location" : "Capture Location"),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _FormSectionHeader(
                icon: Icons.photo_library_outlined,
                title: "Photos",
                subtitle: "Attach one clear photo (required). Detection runs automatically.",
              ),
              const SizedBox(height: AppSpacing.xs),
              Row(
                children: [
                  AppStatusPill(
                    label: "${_images.length}/1 selected",
                    color: _images.isEmpty
                        ? AppColors.mutedForeground
                        : AppColors.info,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    _images.isEmpty
                        ? "$_remainingImageSlots slot(s) left"
                        : "1 attached — tap to replace or remove",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.mutedForeground,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isDetecting ? null : _pickFromCamera,
                      icon: const Icon(Icons.photo_camera_outlined),
                      label: const Text("Camera"),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isDetecting ? null : _pickFromGallery,
                      icon: const Icon(Icons.image_outlined),
                      label: const Text("Gallery (single)"),
                    ),
                  ),
                ],
              ),
              if (_images.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.sm),
                Wrap(
                  spacing: AppSpacing.xs,
                  runSpacing: AppSpacing.xs,
                  children: _images
                      .asMap()
                      .entries
                      .map(
                        (entry) => Stack(
                          clipBehavior: Clip.none,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.file(
                                File(entry.value.path),
                                width: 94,
                                height: 94,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: -8,
                              right: -8,
                              child: InkWell(
                                onTap: () {
                                  setState(() {
                                    _images.removeAt(entry.key);
                                    _resetDetection();
                                  });
                                },
                                child: const CircleAvatar(
                                  radius: 12,
                                  backgroundColor: AppColors.destructive,
                                  child: Icon(
                                    Icons.close,
                                    size: 14,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                      .toList(growable: false),
                ),
                // ── Confidence badge ───────────────────────────────────────
                if (_detectedConfidence != null) ...[
                  const SizedBox(height: AppSpacing.xs),
                  _ConfidenceBadge(
                    confidence: _detectedConfidence!,
                    hasWaste: _detectedConfidence! > 0,
                    isSpamFlagged: _isSpamFlagged,
                  ),
                ],
              ],
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FilledButton.icon(
                onPressed: canSubmit ? _submitReport : null,
                icon: _isSubmitting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_outlined),
                label: Text(_isSubmitting ? "Submitting…" : "Submit Report"),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                missingRequirements.isEmpty
                    ? _isSpamFlagged
                        ? "⚠️ Submitting as spam-flagged report."
                        : "Ready to submit. Please review details before sending."
                    : "Complete required fields: ${missingRequirements.join(", ")}",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _isSpamFlagged
                          ? AppColors.destructive
                          : AppColors.mutedForeground,
                    ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }
}

class _FormSectionHeader extends StatelessWidget {
  const _FormSectionHeader({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 15,
          backgroundColor: AppColors.tint(AppColors.primary),
          child: Icon(icon, size: 16, color: AppColors.primary),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: AppSpacing.xxs),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.mutedForeground,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StepChip extends StatelessWidget {
  const _StepChip({required this.number, required this.label});

  final String number;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xs,
        vertical: AppSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: AppColors.secondary,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 18,
            height: 18,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.tint(AppColors.primary),
            ),
            child: Text(
              number,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.secondaryForeground,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/// Actions available in the "No Waste Detected" dialog.
enum _NoWasteAction { retake, submitAnyway }

/// Small badge shown below the selected photo preview with the YOLO confidence.
class _ConfidenceBadge extends StatelessWidget {
  const _ConfidenceBadge({
    required this.confidence,
    required this.hasWaste,
    required this.isSpamFlagged,
  });

  final double confidence;
  final bool hasWaste;
  final bool isSpamFlagged;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final IconData icon;
    final String label;

    if (!hasWaste) {
      color = isSpamFlagged ? AppColors.destructive : Colors.orange;
      icon = isSpamFlagged ? Icons.warning_amber_rounded : Icons.help_outline;
      label = isSpamFlagged
          ? "Spam flagged — no waste detected"
          : "No waste detected (${confidence.toStringAsFixed(1)}%)";
    } else {
      color = confidence >= 75
          ? const Color(0xFF2ECC71)
          : confidence >= 40
              ? const Color(0xFFF39C12)
              : Colors.orange;
      icon = Icons.check_circle_outline;
      label = "Waste detected — confidence ${confidence.toStringAsFixed(1)}%";
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}
