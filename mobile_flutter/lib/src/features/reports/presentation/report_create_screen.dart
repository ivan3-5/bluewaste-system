import "dart:async";
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
import "../../../core/network/api_exception.dart";
import "../../../core/providers.dart";
import "../data/report_service.dart";
import "../data/offline_service.dart";
import "../data/detect_service.dart";
import "../domain/report_models.dart";
import "widgets/report_result_card.dart";
import "widgets/report_step_indicator.dart";
import "my_reports_screen.dart";
import "../../notifications/presentation/notification_providers.dart";

enum _NoWasteAction { retake, submitAnyway }

class ReportCreateScreen extends ConsumerStatefulWidget {
  const ReportCreateScreen({super.key});

  @override
  ConsumerState<ReportCreateScreen> createState() => _ReportCreateScreenState();
}

class _ReportCreateScreenState extends ConsumerState<ReportCreateScreen> {
  final _descriptionController = TextEditingController();

  final List<XFile> _images = <XFile>[];
  final ImagePicker _picker = ImagePicker();

  String _category = "with_waste";
  bool _isAnonymous = false;
  double? _latitude;
  double? _longitude;
  bool _isSubmitting = false;
  bool _isOutsideZone = false;

  // ── AI analysis state ───────────────────────────────────────────────────
  bool _isDetecting = false;
  double? _detectedConfidence; // null = not yet run; 0.0 = no waste
  bool _isSpamFlagged = false;
  bool _detectionFailed = false; // true = server unreachable
  DetectResult? _detectResult; // full pipeline result (set after detect runs)
  // Submission result card state
  bool _showResultCard = false;
  DetectResult? _submittedResult;
  bool _isSubmittedSuccess = false;
  int _countdownSeconds = 3;
  Timer? _redirectTimer;

  bool get _hasLocation => _latitude != null && _longitude != null;

  /// Detection must have run successfully before submission is allowed.
  bool get _detectionReady =>
      _detectedConfidence != null && !_detectionFailed;
  // ── helpers ───────────────────────────────────────────────────────────────

  /// Resets all detection state to pristine (call when image is removed).
  void _resetDetection() {
    _detectedConfidence = null;
    _isSpamFlagged = false;
    _detectionFailed = false;
    _detectResult = null;
    _category = "with_waste";
  }

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _redirectTimer?.cancel();
    _descriptionController.dispose();
    super.dispose();
  }

  // ── Detection ─────────────────────────────────────────────────────────────

  /// Calls the backend /ai/analyze-report endpoint and handles the result in-place.
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
      final detectService = ref.read(detectServiceProvider);
      final userJson = await ref.read(sessionStorageProvider).readUserJson();
      final citizenId = userJson?["id"]?.toString() ?? "citizen";

      result = await detectService.detect(
        imageFile: File(pickedFile.path),
        latitude: _latitude ?? 0.0,
        longitude: _longitude ?? 0.0,
        description: _descriptionController.text.trim().isNotEmpty
            ? _descriptionController.text.trim()
            : null,
        citizenId: citizenId,
      );
    } on ApiException catch (e) {
      errorMessage = e.message;
    } catch (e) {
      errorMessage = "Photo analysis failed unexpectedly. Please try again.";
    }

    if (!mounted) return;

    if (errorMessage != null) {
      // Server error/unreachable — remove the image and block submission.
      setState(() {
        _images.clear();
        _isDetecting = false;
        _detectionFailed = true;
      });
      _showMessage("❌ Analysis error: $errorMessage");
      return;
    }

    final detectedResult = result!;
    final detectedCategory = detectedResult.hasWaste ? "with_waste" : "no_waste";
    setState(() {
      _isDetecting = false;
      _detectedConfidence = detectedResult.confidence;
      _detectResult = detectedResult;
      _category = detectedCategory;
      _isSpamFlagged = false; // may be updated by dialog below
    });

    if (!detectedResult.hasWaste || detectedResult.isSpam) {
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
      // Submit Anyway — mark as spam flagged and submit directly quickly
      setState(() => _isSpamFlagged = true);
      await _submitReport(isDirectSpamSubmit: true);
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
        "Notice: Location outside coastal zone (Submission allowed for testing demonstration).",
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

  Future<void> _submitReport({bool isDirectSpamSubmit = false}) async {
    final rawDescription = _descriptionController.text.trim();

    if (!isDirectSpamSubmit && rawDescription.isNotEmpty && rawDescription.length < 10) {
      _showMessage("Description must be at least 10 characters when provided.");
      return;
    }

    if (_latitude == null || _longitude == null) {
      if (isDirectSpamSubmit) {
        await _getCurrentLocation();
        if (_latitude == null || _longitude == null) {
          _latitude ??= 0.0;
          _longitude ??= 0.0;
        }
      } else {
        _showMessage("Please capture your location first.");
        return;
      }
    }

    if (_images.isEmpty) {
      _showMessage("Please attach one clear image before submitting.");
      return;
    }

    if (!_detectionReady && !isDirectSpamSubmit) {
      _showMessage("Please wait for detection to complete or retake the photo.");
      return;
    }

    // Hard zone guard — temporarily bypassed for testing demonstration
    // if (_isOutsideZone) {
    //   _showMessage(
    //     "Reporting is only allowed within the designated coastal zone.",
    //   );
    //   return;
    // }

    setState(() => _isSubmitting = true);
    try {
      final reportService = ref.read(reportServiceProvider);
      final offlineService = ref.read(offlineServiceProvider);

      final effectiveCategory = isDirectSpamSubmit ? "no_waste" : _category;
      final effectiveIsSpam = isDirectSpamSubmit || _isSpamFlagged;
      final categoryLabel = wasteCategoryLabels[effectiveCategory] ??
          (effectiveCategory == "with_waste" ? "With Waste" : "No Waste");
      final title = "Waste report - $categoryLabel";
      final aiAnalysisReason = _detectResult?.reason ?? _detectResult?.message;
      final description = rawDescription.isNotEmpty
          ? rawDescription
          : (aiAnalysisReason != null && aiAnalysisReason.trim().isNotEmpty
              ? aiAnalysisReason
              : "Waste report submitted via mobile capture. Category: $categoryLabel.");

      final report = await reportService.submitFullReport(
        data: {
          "title": title,
          "description": description,
          "category": effectiveCategory,
          "latitude": _latitude!,
          "longitude": _longitude!,
          "isAnonymous": _isAnonymous,
          "isSpamFlagged": effectiveIsSpam,
          "spamReason": effectiveIsSpam
              ? (_detectResult?.spamReason ?? "No visible waste detected during photo analysis")
              : null,
          "severity": isDirectSpamSubmit ? "SPAM" : _detectResult?.severity.dbValue,
          "analysisStatus": isDirectSpamSubmit ? "CLEAN" : (_detectResult?.hasWaste == true ? "DIRTY" : "CLEAN"),
          "analysisConfidence": _detectResult?.confidence,
          "analysisWasteCount": (_detectResult?.hasWaste == true && !isDirectSpamSubmit) ? (_detectResult?.labels.length ?? 1) : 0,
          "aiModel": _detectResult != null ? "gemini-3.5-flash" : null,
          "aiCategories": _detectResult?.categories.isNotEmpty == true
              ? _detectResult!.categories
              : (_detectResult?.labels.map((l) => l.label).toList() ?? []),
          "aiReason": _detectResult?.reason ?? _detectResult?.message,
        },
        images: _images,
        offlineService: offlineService,
      );

      try {
        ref.read(unreadCountProvider.notifier).refresh();
        ref.read(notificationsListProvider.notifier).refresh();
      } catch (_) {}

      _descriptionController.clear();

      final submittedResult = _detectResult;
      setState(() {
        _images.clear();
        _isAnonymous = false;
        _category = "with_waste";
        _isSpamFlagged = false;
        _resetDetection();
        if (isDirectSpamSubmit) {
          _showResultCard = false;
          _submittedResult = null;
        } else {
          _showResultCard = submittedResult != null;
          _submittedResult = submittedResult;
        }
      });

      if (report == null && submittedResult == null) {
        _showMessage("You are offline. Report queued and will sync later.");
      } else if (isDirectSpamSubmit) {
        _showMessage("Spam report submitted directly. Screen refreshed so you can submit again.");
      } else {
        _startSuccessCountdown();
      }
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

  void _startSuccessCountdown() {
    _redirectTimer?.cancel();
    setState(() {
      _isSubmittedSuccess = true;
      _countdownSeconds = 3;
    });

    _redirectTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_countdownSeconds <= 1) {
        timer.cancel();
        _navigateToMyReports();
      } else {
        setState(() => _countdownSeconds--);
      }
    });
  }

  void _navigateToMyReports() {
    _redirectTimer?.cancel();
    if (!mounted) return;
    setState(() {
      _isSubmittedSuccess = false;
      _showResultCard = false;
      _submittedResult = null;
      _countdownSeconds = 3;
    });
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          appBar: AppBar(title: const Text("My Reports")),
          body: const SafeArea(
            child: MyReportsScreen(),
          ),
        ),
      ),
    );
  }

  Widget _buildGuidelineRow(BuildContext context, IconData icon, Color color, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.secondaryForeground,
                ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = const [
      MapEntry("with_waste", "With Waste"),
      MapEntry("no_waste", "No Waste"),
    ];
    final rawDescription = _descriptionController.text.trim();
    final missingRequirements = <String>[
      if (rawDescription.isNotEmpty && rawDescription.length < 10)
        "Description (10+ characters)",
      if (!_hasLocation) "Location",
    ];
    if (_images.isEmpty) missingRequirements.add("Photo");
    if (_images.isNotEmpty && !_detectionReady) {
      missingRequirements.add("Detection");
    }
    final canSubmit = !_isSubmitting &&
        !_isDetecting &&
        missingRequirements.isEmpty &&
        _images.isNotEmpty;

    if (_isSubmittedSuccess) {
      return Center(
        child: SingleChildScrollView(
          padding: AppSpacing.screen,
          child: AppSectionCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.success,
                    size: 40,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  "Report Submitted Successfully!",
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  "Thank you for helping protect our coastal areas. Your waste report has been received and queued for review.",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.mutedForeground,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Text(
                    "Redirecting to My Reports in $_countdownSeconds seconds…",
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _navigateToMyReports,
                    child: const Text("Go to My Reports Now"),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      _redirectTimer?.cancel();
                      setState(() {
                        _isSubmittedSuccess = false;
                        _showResultCard = false;
                        _submittedResult = null;
                      });
                    },
                    child: const Text("Submit Another Report"),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_images.isEmpty) {
      return ListView(
        padding: AppSpacing.screen,
        children: [
          if (_showResultCard && _submittedResult != null) ...[
            ReportResultCard(
              result: _submittedResult!,
              onDismiss: () {
                setState(() {
                  _showResultCard = false;
                  _submittedResult = null;
                });
              },
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          AppSectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: AppSpacing.md),
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.tint(AppColors.primary, opacity: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.add_a_photo_rounded,
                    size: 40,
                    color: AppColors.primary,
                  ),
                ),

                const SizedBox(height: AppSpacing.md),
                Text(
                  "Take a clear photo of coastal waste or upload one from your gallery. The system will automatically detect waste and classify the category.",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.mutedForeground,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xl),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: FilledButton.icon(
                    onPressed: _isDetecting ? null : _pickFromCamera,
                    icon: const Icon(Icons.photo_camera_rounded, size: 22),
                    label: const Text(
                      "Take a Photo",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton.icon(
                    onPressed: _isDetecting ? null : _pickFromGallery,
                    icon: const Icon(Icons.photo_library_rounded, size: 22),
                    label: const Text(
                      "Choose from Gallery",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppSectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ReportFormSectionHeader(
                  icon: Icons.my_location_rounded,
                  title: "GPS Location Status",
                  subtitle: _hasLocation
                      ? "Location captured automatically. Ready for report."
                      : "Locating your position within coastal reporting zones...",
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
                            : Icons.location_searching_rounded,
                        color: _hasLocation
                            ? AppColors.success
                            : AppColors.mutedForeground,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          _hasLocation
                              ? "${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}"
                              : "Acquiring coastal coordinates...",
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
                if (_isOutsideZone) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    "⚠️ Location outside designated coastal zone (Allowed for testing demonstration).",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.info,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
                const SizedBox(height: AppSpacing.sm),
                FilledButton.tonalIcon(
                  onPressed: _getCurrentLocation,
                  icon: const Icon(Icons.my_location),
                  label: Text(_hasLocation ? "Update Location" : "Capture Location"),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppSectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ReportFormSectionHeader(
                  icon: Icons.tips_and_updates_outlined,
                  title: "Photo Guidelines",
                  subtitle: "Ensure accurate detection by following these quick tips.",
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildGuidelineRow(context, Icons.check_circle_outline, AppColors.success, "Center the waste item clearly in the frame."),
                const SizedBox(height: AppSpacing.xs),
                _buildGuidelineRow(context, Icons.check_circle_outline, AppColors.success, "Ensure good lighting and avoid blurry images."),
                const SizedBox(height: AppSpacing.xs),
                _buildGuidelineRow(context, Icons.info_outline, AppColors.primary, "The system will analyze and classify the waste upon selection."),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      );
    }

    return ListView(
      padding: AppSpacing.screen,
      children: [
        if (_showResultCard && _submittedResult != null) ...[
          ReportResultCard(
            result: _submittedResult!,
            onDismiss: () {
              setState(() {
                _showResultCard = false;
                _submittedResult = null;
              });
            },
          ),
          const SizedBox(height: AppSpacing.md),
        ],
        if (_isDetecting)
          const Padding(
            padding: EdgeInsets.only(bottom: AppSpacing.md),
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
                    Flexible(
                      child: Text(
                        "Analyzing photo…",
                        style: TextStyle(fontWeight: FontWeight.w500),
                        overflow: TextOverflow.ellipsis,
                      ),
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
              ReportFormSectionHeader(
                icon: Icons.photo_camera_rounded,
                title: "Review Photo & Analysis",
                subtitle: "The system verifies and categorizes your captured image.",
              ),
              const SizedBox(height: AppSpacing.md),
              Stack(
                clipBehavior: Clip.none,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(
                      File(_images.first.path),
                      width: double.infinity,
                      height: 220,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _images.clear();
                          _resetDetection();
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.destructive,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          size: 18,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              if (_detectedConfidence != null) ...[
                const SizedBox(height: AppSpacing.sm),
                ConfidenceBadge(
                  confidence: _detectedConfidence!,
                  hasWaste: _detectResult?.hasWaste == true,
                  isSpamFlagged: _isSpamFlagged,
                ),
              ],
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isDetecting ? null : _pickFromCamera,
                      icon: const Icon(Icons.photo_camera_outlined, size: 18),
                      label: const Text("Retake Camera"),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isDetecting ? null : _pickFromGallery,
                      icon: const Icon(Icons.photo_library_outlined, size: 18),
                      label: const Text("Replace Gallery"),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ReportFormSectionHeader(
                icon: Icons.edit_note,
                title: "Report Details",
                subtitle: "Category auto-classified. Add notes if desired.",
              ),
              const SizedBox(height: AppSpacing.md),
              DropdownButtonFormField<String>(
                key: ValueKey(_category),
                initialValue: _category,
                decoration: const InputDecoration(
                  labelText: "Waste Category *",
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
                onChanged: (_detectResult?.hasWaste == true || _isDetecting)
                    ? null
                    : (value) {
                        if (value != null) {
                          setState(() => _category = value);
                        }
                      },
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _descriptionController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  labelText: "Description (optional)",
                  alignLabelWithHint: true,
                  prefixIcon: Icon(Icons.description_outlined),
                ),
                minLines: 3,
                maxLines: 5,
              ),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isAnonymous
                        ? AppColors.primary.withValues(alpha: 0.5)
                        : AppColors.border,
                  ),
                ),
                child: SwitchListTile(
                  secondary: Icon(
                    _isAnonymous
                        ? Icons.visibility_off_outlined
                        : Icons.person_outline,
                    color: _isAnonymous
                        ? AppColors.primary
                        : AppColors.mutedForeground,
                  ),
                  title: const Text(
                    "Submit anonymously",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text(
                    "Your identity will be protected and hidden from city authorities and field workers.",
                    style: TextStyle(fontSize: 12),
                  ),
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
        const SizedBox(height: AppSpacing.md),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ReportFormSectionHeader(
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
              if (_isOutsideZone) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  "⚠️ Location outside designated coastal zone (Allowed for testing demonstration).",
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.info,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
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
        const SizedBox(height: AppSpacing.md),
        AppSectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton.icon(
                  onPressed: canSubmit ? () => _submitReport() : null,
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send_rounded, size: 20),
                  label: Text(
                    _isSubmitting ? "Submitting Report…" : "Submit Report",
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
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

