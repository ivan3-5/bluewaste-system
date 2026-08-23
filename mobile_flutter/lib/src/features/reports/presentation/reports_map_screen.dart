import "dart:async";

import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:intl/intl.dart";
import "package:latlong2/latlong.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../data/report_service.dart";
import "../../../core/network/api_exception.dart";
import "../domain/report_models.dart";

class ReportsMapScreen extends ConsumerStatefulWidget {
  const ReportsMapScreen({
    super.key,
    this.assignedOnly = false,
  });

  final bool assignedOnly;

  @override
  ConsumerState<ReportsMapScreen> createState() => _ReportsMapScreenState();
}

class _ReportsMapScreenState extends ConsumerState<ReportsMapScreen>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  static const LatLng _panaboCenter = LatLng(7.3132, 125.6844);
  static const double _defaultZoom = 13;
  static const double _markerCanvasSize = 92;
  static const double _fixedMarkerDiameter = 23;
  static const double _fixedDotSize = 5;

  // Incident-grouped marker is slightly larger for visual emphasis.
  static const double _incidentMarkerDiameter = 32;

  final MapController _mapController = MapController();
  late final AnimationController _markerPulseController;

  // ── Marker widget cache ───────────────────────────────────────────────────
  // Keyed by "${id}_${status}" so markers are only rebuilt when their
  // status changes — not on every 60fps animation tick.
  final Map<String, Widget> _markerCache = {};

  // ── Raw reports (current behaviour) ──────────────────────────────────────
  List<ReportRecord> _reports = const [];

  // ── Grouped incidents ─────────────────────────────────────────────────────
  List<IncidentMapData> _incidents = const [];

  bool _loading = true;
  String? _errorMessage;
  Timer? _timer;

  /// When true the map shows one marker per WasteIncident (deduplicated).
  /// When false it shows all individual raw reports.
  /// The toggle is disabled for the worker "assignedOnly" view.
  bool _groupedMode = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _markerPulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat();
    _loadData();
    _startPolling();
  }

  void _startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(
      // Map data changes slowly; 45s is sufficient to stay fresh
      // while dramatically reducing backend load and battery drain.
      const Duration(seconds: 45),
      (_) => _loadData(silent: true),
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _markerPulseController.repeat();
      _loadData(silent: true);
      _startPolling();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.hidden) {
      // Stop 60fps redraws while the app is not visible.
      _markerPulseController.stop();
      _timer?.cancel();
      _timer = null;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _markerPulseController.dispose();
    super.dispose();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  Future<void> _loadData({bool silent = false}) async {
    if (!silent && mounted) {
      setState(() => _loading = true);
    }

    try {
      final service = ref.read(reportServiceProvider);

      if (widget.assignedOnly) {
        // Worker map: always show raw assigned reports.
        final result = await service.getAssignedReports(page: 1, limit: 500);
        if (!mounted) return;
        setState(() {
          _reports = result.data;
          _loading = false;
          _errorMessage = null;
        });
        return;
      }

      // Citizen / admin map: load both in parallel for instant toggle.
      // Limit 500 covers all practical deployment sizes; 2000 was wasteful
      // in memory and caused jank parsing huge JSON on the main thread.
      final results = await Future.wait([
        service.getMapReports(limit: 500),
        service.getIncidentMapData(limit: 500),
      ]);

      if (!mounted) return;

      final newReports = results[0] as List<ReportRecord>;
      final newIncidents = results[1] as List<IncidentMapData>;

      // Evict stale cache entries when the data set changes.
      if (newReports.length != _reports.length ||
          newIncidents.length != _incidents.length) {
        _markerCache.clear();
      }

      setState(() {
        _reports = newReports;
        _incidents = newIncidents;
        _loading = false;
        _errorMessage = null;
      });
    } catch (error) {
      if (!mounted) return;

      String message;
      if (error is ApiException) {
        message = error.statusCode != null
            ? "${error.message} (HTTP ${error.statusCode})"
            : error.message;
      } else {
        message = error.toString();
      }

      setState(() {
        _loading = false;
        _errorMessage = message;
      });
    }
  }

  // ── Marker helpers ────────────────────────────────────────────────────────

  Color _pinColor(String status) => AppColors.statusColor(status);

  double _markerPhase({required bool intense}) {
    final basePhase = _markerPulseController.value;
    if (!intense) return basePhase;
    const speedMultiplier = 3 / 1.8;
    final fasterPhase = basePhase * speedMultiplier;
    return fasterPhase - fasterPhase.floorToDouble();
  }

  ({double scale, double opacity}) _pulseGlow({
    required double phase,
    required bool intense,
  }) {
    final edgeDistance = (phase - 0.5).abs() / 0.5;
    final minScale = intense ? 1.15 : 1.1;
    final maxScale = intense ? 2.6 : 2.2;
    final maxOpacity = intense ? 0.5 : 0.3;
    return (
      scale: maxScale - ((maxScale - minScale) * edgeDistance),
      opacity: maxOpacity * edgeDistance,
    );
  }

  /// Standard raw-report marker (unchanged from original).
  Widget _buildReportMarker(ReportRecord report) {
    final cacheKey = '${report.id}_${report.status}';
    return _markerCache.putIfAbsent(cacheKey, () => _buildReportMarkerWidget(report));
  }

  Widget _buildReportMarkerWidget(ReportRecord report) {
    final isPending = report.status == 'PENDING';
    final categoryColor = AppColors.categoryColor(report.category);
    final statusColor = _pinColor(report.status);
    const markerDiameter = _fixedMarkerDiameter;
    const dotSize = _fixedDotSize;

    // Static marker body — cached, built once per status change.
    final markerBody = Container(
      width: markerDiameter,
      height: markerDiameter,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: categoryColor,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: Container(
          width: dotSize,
          height: dotSize,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: statusColor,
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.82),
              width: 1.5,
            ),
          ),
        ),
      ),
    );

    return GestureDetector(
      onTap: () => _showReportDetails(report),
      child: RepaintBoundary(
        child: SizedBox(
          width: _markerCanvasSize,
          height: _markerCanvasSize,
          child: Stack(
            alignment: Alignment.center,
            clipBehavior: Clip.none,
            children: [
              // Pulse overlay — only this part rebuilds at 60fps.
              IgnorePointer(
                child: AnimatedBuilder(
                  animation: _markerPulseController,
                  builder: (_, __) {
                    final pulse = _pulseGlow(
                      phase: _markerPhase(intense: isPending),
                      intense: isPending,
                    );
                    return Transform.scale(
                      scale: pulse.scale,
                      child: Opacity(
                        opacity: pulse.opacity,
                        child: Container(
                          width: markerDiameter,
                          height: markerDiameter,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: categoryColor,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Static body — not rebuilt by animation.
              markerBody,
            ],
          ),
        ),
      ),
    );
  }

  /// Incident-grouped marker — larger circle with optional contributor badge.
  Widget _buildIncidentMarker(IncidentMapData incident) {
    final cacheKey = 'incident_${incident.id}_${incident.status}';
    return _markerCache.putIfAbsent(cacheKey, () => _buildIncidentMarkerWidget(incident));
  }

  Widget _buildIncidentMarkerWidget(IncidentMapData incident) {
    final color = incident.category == 'with_waste'
        ? AppColors.destructive
        : AppColors.success;
    final isPending = incident.status == 'PENDING';
    final hasMultiple = incident.contributorCount > 1;
    final badgeLabel = incident.contributorCount > 99
        ? '99+'
        : incident.contributorCount.toString();

    // Static marker body — cached, only rebuilt when status changes.
    final markerBody = Container(
      width: _incidentMarkerDiameter,
      height: _incidentMarkerDiameter,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.32),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: const Center(
        child: SizedBox(
          width: 7,
          height: 7,
          child: DecoratedBox(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );

    return GestureDetector(
      onTap: () => _showIncidentDetails(incident),
      child: RepaintBoundary(
        child: SizedBox(
          width: _markerCanvasSize,
          height: _markerCanvasSize,
          child: Stack(
            alignment: Alignment.center,
            clipBehavior: Clip.none,
            children: [
              // Pulse glow ring — only this part rebuilds at 60fps.
              IgnorePointer(
                child: AnimatedBuilder(
                  animation: _markerPulseController,
                  builder: (_, __) {
                    final pulse = _pulseGlow(
                      phase: _markerPhase(intense: isPending),
                      intense: isPending,
                    );
                    return Transform.scale(
                      scale: pulse.scale,
                      child: Opacity(
                        opacity: pulse.opacity,
                        child: Container(
                          width: _incidentMarkerDiameter,
                          height: _incidentMarkerDiameter,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: color,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Static body — not rebuilt by animation.
              markerBody,
              // Contributor count badge (only when > 1)
              if (hasMultiple)
                Positioned(
                  top: (_markerCanvasSize / 2) - (_incidentMarkerDiameter / 2) - 7,
                  right: (_markerCanvasSize / 2) - (_incidentMarkerDiameter / 2) - 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                    constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E3A5F),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: Colors.white, width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        badgeLabel,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                          height: 1,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────

  int _countByStatus(String status) =>
      _reports.where((r) => r.status == status).length;

  int _incidentCountByStatus(String status) =>
      _incidents.where((i) => i.status == status).length;

  void _recenterMap() => _mapController.move(_panaboCenter, _defaultZoom);

  String _formatDate(DateTime value) =>
      DateFormat("MMM d, y • h:mm a").format(value.toLocal());

  // ── Bottom sheets ─────────────────────────────────────────────────────────

  void _showReportDetails(ReportRecord report) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final statusColor = _pinColor(report.status);
        final categoryColor = AppColors.categoryColor(report.category);
        final mediaQuery = MediaQuery.of(context);

        return SafeArea(
          top: false,
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              AppSpacing.sm,
              AppSpacing.sm,
              AppSpacing.sm,
              mediaQuery.viewInsets.bottom + AppSpacing.sm,
            ),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: mediaQuery.size.height * 0.78,
              ),
              child: Material(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(22),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    Flexible(
                      child: SingleChildScrollView(
                        padding: EdgeInsets.fromLTRB(
                          AppSpacing.md,
                          AppSpacing.sm,
                          AppSpacing.md,
                          mediaQuery.padding.bottom + AppSpacing.md,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              report.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Wrap(
                              spacing: AppSpacing.xs,
                              runSpacing: AppSpacing.xs,
                              children: [
                                AppStatusPill(
                                  label: statusLabels[report.status] ??
                                      report.status,
                                  color: statusColor,
                                ),
                                AppStatusPill(
                                  label:
                                      wasteCategoryLabels[report.category] ??
                                          report.category,
                                  color: categoryColor,
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.md),
                            _InfoRow(
                              icon: Icons.location_searching_outlined,
                              label: "Coordinates",
                              value:
                                  "${report.latitude.toStringAsFixed(5)}, ${report.longitude.toStringAsFixed(5)}",
                            ),
                            if ((report.address ?? "").isNotEmpty)
                              Padding(
                                padding:
                                    const EdgeInsets.only(top: AppSpacing.xs),
                                child: _InfoRow(
                                  icon: Icons.place_outlined,
                                  label: "Address",
                                  value: report.address!,
                                ),
                              ),
                            const SizedBox(height: AppSpacing.sm),
                            Text(
                              "Analysis Details",
                              style: Theme.of(context)
                                  .textTheme
                                  .titleSmall
                                  ?.copyWith(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(AppSpacing.sm),
                              decoration: BoxDecoration(
                                color: AppColors.secondary,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                report.displayDescription,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            _InfoRow(
                              icon: Icons.photo_library_outlined,
                              label: "Attached Photos",
                              value: "${report.images.length}",
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            _InfoRow(
                              icon: Icons.schedule_outlined,
                              label: "Reported",
                              value: _formatDate(report.createdAt),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            _InfoRow(
                              icon: Icons.update,
                              label: "Last Updated",
                              value: _formatDate(report.updatedAt),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton.tonal(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text("Close"),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showIncidentDetails(IncidentMapData incident) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final statusColor = _pinColor(incident.status);
        final categoryColor = AppColors.categoryColor(incident.category);
        final mediaQuery = MediaQuery.of(context);
        final hasMultiple = incident.contributorCount > 1;

        return SafeArea(
          top: false,
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              AppSpacing.sm,
              AppSpacing.sm,
              AppSpacing.sm,
              mediaQuery.viewInsets.bottom + AppSpacing.sm,
            ),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: mediaQuery.size.height * 0.78,
              ),
              child: Material(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(22),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    Flexible(
                      child: SingleChildScrollView(
                        padding: EdgeInsets.fromLTRB(
                          AppSpacing.md,
                          AppSpacing.sm,
                          AppSpacing.md,
                          mediaQuery.padding.bottom + AppSpacing.md,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── Header ──────────────────────────────────────
                            Text(
                              "Waste Incident",
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Wrap(
                              spacing: AppSpacing.xs,
                              runSpacing: AppSpacing.xs,
                              children: [
                                AppStatusPill(
                                  label: statusLabels[incident.status] ??
                                      incident.status,
                                  color: statusColor,
                                ),
                                AppStatusPill(
                                  label: wasteCategoryLabels[
                                          incident.category] ??
                                      incident.category,
                                  color: categoryColor,
                                ),
                                if (incident.severity != null)
                                  AppStatusPill(
                                    label: incident.severity!,
                                    color: incident.severity == "CRITICAL"
                                        ? AppColors.destructive
                                        : incident.severity == "HIGH"
                                            ? AppColors.orange
                                            : AppColors.warning,
                                  ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),

                            // ── Contributor badge ────────────────────────────
                            if (hasMultiple)
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E3A5F),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    const Text(
                                      "👥",
                                      style: TextStyle(fontSize: 18),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        "${incident.contributorCount} citizens reported this location",
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            if (hasMultiple)
                              const SizedBox(height: AppSpacing.sm),

                            // ── Location info ────────────────────────────────
                            _InfoRow(
                              icon: Icons.location_searching_outlined,
                              label: "Coordinates",
                              value:
                                  "${incident.latitude.toStringAsFixed(5)}, ${incident.longitude.toStringAsFixed(5)}",
                            ),
                            if ((incident.address ?? "").isNotEmpty)
                              Padding(
                                padding:
                                    const EdgeInsets.only(top: AppSpacing.xs),
                                child: _InfoRow(
                                  icon: Icons.place_outlined,
                                  label: "Address",
                                  value: incident.address!,
                                ),
                              ),
                            const SizedBox(height: AppSpacing.xs),
                            _InfoRow(
                              icon: Icons.assignment_outlined,
                              label: "Linked Reports",
                              value:
                                  "${incident.reportIds.length} report${incident.reportIds.length != 1 ? "s" : ""} consolidated",
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            _InfoRow(
                              icon: Icons.schedule_outlined,
                              label: "First Reported",
                              value: _formatDate(incident.createdAt),
                            ),
                            const SizedBox(height: AppSpacing.md),

                            // ── Info note ────────────────────────────────────
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(AppSpacing.sm),
                              decoration: BoxDecoration(
                                color: AppColors.tint(AppColors.primary),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.info_outline,
                                    size: 16,
                                    color: AppColors.primary,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      hasMultiple
                                          ? "Multiple reports within 50 m of each other have been consolidated into this single incident."
                                          : "This incident has a single report. Nearby future reports of the same category will be automatically grouped here.",
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: AppColors.primary,
                                          ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton.tonal(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text("Close"),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  // ── UI panels ─────────────────────────────────────────────────────────────

  Widget _buildTopPanel(BuildContext context) {
    final isGrouped = _groupedMode && !widget.assignedOnly;
    final totalCount = isGrouped ? _incidents.length : _reports.length;
    final pendingCount = isGrouped
        ? _incidentCountByStatus("PENDING")
        : _countByStatus("PENDING");
    final inProgressCount = isGrouped
        ? _incidentCountByStatus("IN_PROGRESS")
        : _countByStatus("IN_PROGRESS");
    final cleanedCount = isGrouped
        ? _incidentCountByStatus("CLEANED")
        : _countByStatus("CLEANED");

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.tint(AppColors.primary),
                  child: const Icon(
                    Icons.map_outlined,
                    color: AppColors.primary,
                    size: 18,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    "Tap any marker to open report details.",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.mutedForeground,
                        ),
                  ),
                ),
                IconButton(
                  onPressed: _loading ? null : () => _loadData(),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                  ),
                  icon: const Icon(Icons.refresh),
                  tooltip: "Refresh reports",
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: [
                AppStatusPill(
                  label: isGrouped
                      ? "$totalCount Incidents"
                      : "$totalCount Reports",
                  color: AppColors.primary,
                ),
                AppStatusPill(
                  label: "$pendingCount Pending",
                  color: AppColors.warning,
                ),
                AppStatusPill(
                  label: "$inProgressCount In Progress",
                  color: AppColors.orange,
                ),
                AppStatusPill(
                  label: "$cleanedCount Cleaned",
                  color: AppColors.success,
                ),
              ],
            ),
            // Group toggle — hidden in worker assignedOnly mode
            if (!widget.assignedOnly) ...[
              const SizedBox(height: AppSpacing.xs),
              GestureDetector(
                onTap: () => setState(() => _groupedMode = !_groupedMode),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _groupedMode
                        ? AppColors.tint(AppColors.primary, opacity: 0.15)
                        : AppColors.secondary,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: _groupedMode
                          ? AppColors.primary.withValues(alpha: 0.35)
                          : AppColors.border,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _groupedMode
                            ? Icons.layers_rounded
                            : Icons.scatter_plot_rounded,
                        size: 14,
                        color: _groupedMode
                            ? AppColors.primary
                            : AppColors.mutedForeground,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        _groupedMode ? "Grouped Incidents" : "Raw Reports",
                        style:
                            Theme.of(context).textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: _groupedMode
                                      ? AppColors.primary
                                      : AppColors.mutedForeground,
                                ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMapActions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              onPressed: _recenterMap,
              icon: const Icon(Icons.my_location),
              tooltip: "Recenter map",
            ),
            IconButton(
              onPressed: _loading ? null : () => _loadData(),
              icon: const Icon(Icons.sync),
              tooltip: "Refresh markers",
            ),
          ],
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final useGrouped = _groupedMode && !widget.assignedOnly;

    final markers = useGrouped
        ? _incidents
            .map(
              (incident) => Marker(
                point: LatLng(incident.latitude, incident.longitude),
                width: _markerCanvasSize,
                height: _markerCanvasSize,
                child: AnimatedBuilder(
                  animation: _markerPulseController,
                  builder: (context, _) => _buildIncidentMarker(incident),
                ),
              ),
            )
            .toList(growable: false)
        : _reports
            .map(
              (report) => Marker(
                point: LatLng(report.latitude, report.longitude),
                width: _markerCanvasSize,
                height: _markerCanvasSize,
                child: AnimatedBuilder(
                  animation: _markerPulseController,
                  builder: (context, _) => _buildReportMarker(report),
                ),
              ),
            )
            .toList(growable: false);

    final isEmpty = markers.isEmpty;

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: const MapOptions(
            initialCenter: _panaboCenter,
            initialZoom: _defaultZoom,
          ),
          children: [
            TileLayer(
              urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              userAgentPackageName: "com.bluewaste.mobile_flutter",
            ),
            MarkerLayer(markers: markers),
          ],
        ),
        Positioned.fill(
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withValues(alpha: 0.18),
                    Colors.transparent,
                    Colors.transparent,
                    Colors.white.withValues(alpha: 0.08),
                  ],
                  stops: const [0, 0.14, 0.76, 1],
                ),
              ),
            ),
          ),
        ),
        Positioned(
          left: AppSpacing.sm,
          right: AppSpacing.sm,
          top: AppSpacing.sm,
          child: _buildTopPanel(context),
        ),
        Positioned(
          right: AppSpacing.sm,
          bottom: AppSpacing.sm,
          child: _buildMapActions(),
        ),
        if (_loading)
          Positioned.fill(
            child: ColoredBox(
              color: Colors.black.withValues(alpha: 0.08),
              child: const Center(child: CircularProgressIndicator()),
            ),
          ),
        if (!_loading && isEmpty)
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 320),
              child: AppEmptyState(
                icon: _errorMessage == null
                    ? Icons.location_off_outlined
                    : Icons.cloud_off_outlined,
                title: _errorMessage == null
                    ? useGrouped
                        ? "No incidents on map"
                        : "No reports on map"
                    : "Unable to load map data",
                subtitle: _errorMessage ??
                    (useGrouped
                        ? "There are no active waste incidents right now."
                        : "There are no reports with map coordinates right now."),
              ),
            ),
          ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Icon(
            icon,
            size: 16,
            color: AppColors.mutedForeground,
          ),
        ),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: AppColors.mutedForeground,
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 1),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
