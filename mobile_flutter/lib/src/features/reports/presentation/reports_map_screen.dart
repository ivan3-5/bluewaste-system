import "dart:async";

import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:intl/intl.dart";
import "package:latlong2/latlong.dart" hide Path;

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../data/report_service.dart";
import "../../../core/network/api_exception.dart";
import "../domain/report_models.dart";
import "../domain/report_map_date_range.dart";
import "widgets/map_date_range_filter.dart";

enum _MapStatusFilter { active, all, cleanupScheduled, inProgress, cleaned }

class ReportsMapScreen extends ConsumerStatefulWidget {
  const ReportsMapScreen({super.key, this.assignedOnly = false});

  final bool assignedOnly;

  @override
  ConsumerState<ReportsMapScreen> createState() => _ReportsMapScreenState();
}

class _ReportsMapScreenState extends ConsumerState<ReportsMapScreen>
    with WidgetsBindingObserver {
  static const LatLng _panaboCenter = LatLng(7.3132, 125.6844);
  static const double _defaultZoom = 13;
  static const double _markerWidth = 34;
  static const double _markerHeight = 44;
  static const double _areaMarkerWidth = 38;
  static const double _areaMarkerHeight = 48;
  static final _reportPinAlignment = Marker.computePixelAlignment(
    width: _markerWidth,
    height: _markerHeight,
    left: _WasteReportMarkerPainter.pinCenter.dx,
    top: _WasteReportMarkerPainter.pinCenter.dy,
  );

  final MapController _mapController = MapController();

  // ── Marker widget cache ───────────────────────────────────────────────────
  // Keyed by "${id}_${status}" so marker widgets are reused across map rebuilds.
  final Map<String, Widget> _markerCache = {};

  // ── Raw reports (current behaviour) ──────────────────────────────────────
  List<ReportRecord> _reports = const [];

  List<RadiusReportGroup> _radiusGroups = const [];

  bool _loading = true;
  bool _refreshInProgress = false;
  bool _auxiliaryFailure = false;
  String? _auxiliaryErrorMessage;
  String? _errorMessage;
  Timer? _timer;
  int _requestId = 0;
  int _radiusRequestId = 0;
  ReportMapDateRange _dateRange = ReportMapDateRange.last30Days;
  _MapStatusFilter _statusFilter = _MapStatusFilter.active;
  bool _showRadiusCircles = true;
  bool _legendExpanded = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadData();
    _startPolling();
  }

  void _startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(
      // Status changes should reach open maps within a few seconds.
      const Duration(seconds: 10),
      (_) => _loadData(silent: true),
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadData(silent: true);
      _startPolling();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.hidden) {
      _timer?.cancel();
      _timer = null;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  Future<void> _loadData({bool silent = false}) async {
    if (!mounted || (silent && (_loading || _refreshInProgress))) return;

    final requestId = ++_requestId;
    _refreshInProgress = true;
    final window = _dateRange.window();
    if (!silent) {
      setState(() => _loading = true);
    }

    try {
      final service = ref.read(reportServiceProvider);

      if (widget.assignedOnly) {
        // Worker map: always show raw assigned reports.
        final result = await service.getAssignedReports(
          page: 1,
          limit: 500,
          dateWindow: window,
        );
        if (!mounted || requestId != _requestId) return;
        _markerCache.clear();
        setState(() {
          _reports = result.data
              .where((report) => window.contains(report.createdAt))
              .toList();
          _radiusGroups = const [];
          _loading = false;
          _refreshInProgress = false;
          _auxiliaryFailure = false;
          _auxiliaryErrorMessage = null;
          _errorMessage = null;
        });
        return;
      }

      // Raw reports are the source for individual map pins. Load them first so
      // an unavailable optional radius endpoint cannot hide citizen reports.
      // Keep responses bounded to avoid parsing oversized payloads on mobile.
      final reports = await service.getMapReports(
        limit: 500,
        dateWindow: window,
      );
      if (!mounted || requestId != _requestId) return;
      final radiusRequestId = ++_radiusRequestId;

      // Render the authoritative report pins as soon as they arrive. The
      // radius data may be slower or unavailable.
      _markerCache.clear();
      setState(() {
        _reports = reports
            .where((report) => window.contains(report.createdAt))
            .toList();
        _radiusGroups = const [];
        _loading = false;
        _auxiliaryFailure = false;
        _auxiliaryErrorMessage = null;
        _errorMessage = null;
      });

      // Report markers are the primary map data. Radius overlays are loaded
      // separately so an optional overlay failure never marks report refresh
      // as failed.
      List<RadiusReportGroup>? radiusGroups;
      String? radiusError;
      try {
        radiusGroups = await service.getRadiusGroups(
          limit: 500,
          radius: 50,
          dateWindow: window,
          status: _radiusStatus,
          excludeStatus: _radiusExcludeStatus,
        );
      } catch (error) {
        radiusError = _describeMapError(error);
      }

      if (!mounted || requestId != _requestId) return;

      _markerCache.clear();
      setState(() {
        if (radiusRequestId == _radiusRequestId) {
          _radiusGroups = radiusGroups ?? const <RadiusReportGroup>[];
          _auxiliaryFailure = radiusGroups == null;
          _auxiliaryErrorMessage = radiusError;
        }
        _loading = false;
        _refreshInProgress = false;
        _errorMessage = null;
      });
    } catch (error) {
      if (!mounted || requestId != _requestId) return;

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
        _refreshInProgress = false;
        _auxiliaryFailure = false;
        _auxiliaryErrorMessage = null;
        _errorMessage = message;
      });
    }
  }

  String _describeMapError(Object error) {
    if (error is ApiException) {
      return error.statusCode == null
          ? error.message
          : "${error.message} (HTTP ${error.statusCode})";
    }
    return error.toString();
  }

  void _changeDateRange(ReportMapDateRange range) {
    if (range == _dateRange) return;
    _radiusRequestId++;
    setState(() {
      _dateRange = range;
      _reports = const [];
      _radiusGroups = const [];
      _auxiliaryFailure = false;
      _auxiliaryErrorMessage = null;
      _errorMessage = null;
      _markerCache.clear();
    });
    _loadData();
  }

  bool _matchesStatus(String status) {
    final normalized = status.trim().toUpperCase();
    return switch (_statusFilter) {
      _MapStatusFilter.active => normalized != "CLEANED",
      _MapStatusFilter.all => true,
      _MapStatusFilter.cleanupScheduled => normalized == "CLEANUP_SCHEDULED",
      _MapStatusFilter.inProgress => normalized == "IN_PROGRESS",
      _MapStatusFilter.cleaned => normalized == "CLEANED",
    };
  }

  String _statusFilterLabel(_MapStatusFilter filter) => switch (filter) {
    _MapStatusFilter.active => "Active",
    _MapStatusFilter.all => "All",
    _MapStatusFilter.cleanupScheduled => "Scheduled",
    _MapStatusFilter.inProgress => "In Progress",
    _MapStatusFilter.cleaned => "Cleaned",
  };

  List<ReportRecord> get _visibleReports =>
      _reports.where((report) => _matchesStatus(report.status)).toList();

  List<RadiusReportGroup> get _visibleRadiusGroups =>
      _radiusGroups.where((group) {
        if (_statusFilter == _MapStatusFilter.all) return true;
        return group.statuses.any(_matchesStatus);
      }).toList();

  String? get _radiusStatus => switch (_statusFilter) {
    _MapStatusFilter.cleanupScheduled => "CLEANUP_SCHEDULED",
    _MapStatusFilter.inProgress => "IN_PROGRESS",
    _MapStatusFilter.cleaned => "CLEANED",
    _MapStatusFilter.active || _MapStatusFilter.all => null,
  };

  String? get _radiusExcludeStatus =>
      _statusFilter == _MapStatusFilter.active ? "CLEANED" : null;

  void _changeStatusFilter(_MapStatusFilter filter) {
    if (filter == _statusFilter) return;
    setState(() => _statusFilter = filter);
    _refreshRadiusGroupsForStatus();
  }

  Future<void> _refreshRadiusGroupsForStatus() async {
    final requestId = ++_radiusRequestId;
    try {
      final groups = await ref
          .read(reportServiceProvider)
          .getRadiusGroups(
            limit: 500,
            radius: 50,
            dateWindow: _dateRange.window(),
            status: _radiusStatus,
            excludeStatus: _radiusExcludeStatus,
          );
      if (!mounted || requestId != _radiusRequestId) return;
      setState(() {
        _radiusGroups = groups;
        _auxiliaryFailure = false;
        _auxiliaryErrorMessage = null;
      });
    } catch (error) {
      if (!mounted || requestId != _radiusRequestId) return;
      setState(() {
        _auxiliaryFailure = true;
        _auxiliaryErrorMessage = _describeMapError(error);
      });
    }
  }

  // ── Marker helpers ────────────────────────────────────────────────────────

  Color _pinColor(String status) => AppColors.statusColor(status);

  ({
    Color stroke,
    Color fill,
    double fillOpacity,
    double strokeOpacity,
    double weight,
    List<double> dashSegments,
  })
  _radiusStyle(RadiusReportGroup group, {List<ReportRecord>? reports}) {
    final statuses =
        reports?.map((report) => report.status).toList() ?? group.statuses;
    final isGrouped = reports == null ? group.isGrouped : reports.length > 1;
    if (isGrouped) {
      final isCleaned =
          statuses.isNotEmpty &&
          statuses.every((status) => status.toUpperCase() == "CLEANED");
      return (
        stroke: Color(isCleaned ? 0xFF059669 : 0xFF4F46E5),
        fill: Color(isCleaned ? 0xFF10B981 : 0xFF6366F1),
        fillOpacity: 0.16,
        strokeOpacity: 0.9,
        weight: 2,
        dashSegments: const [6, 6],
      );
    }

    final status = statuses.isNotEmpty
        ? statuses.first.toUpperCase()
        : "VERIFIED";
    final colors = switch (status) {
      "CLEANED" => (stroke: 0xFF059669, fill: 0xFF10B981),
      "VERIFIED" => (stroke: 0xFF0284C7, fill: 0xFF38BDF8),
      "CLEANUP_SCHEDULED" => (stroke: 0xFF7C3AED, fill: 0xFFA855F7),
      "IN_PROGRESS" => (stroke: 0xFFD97706, fill: 0xFFF59E0B),
      "PENDING" => (stroke: 0xFFEA580C, fill: 0xFFF97316),
      "REJECTED" => (stroke: 0xFFDC2626, fill: 0xFFEF4444),
      _ => (stroke: 0xFF0284C7, fill: 0xFF38BDF8),
    };
    return (
      stroke: Color(colors.stroke),
      fill: Color(colors.fill),
      fillOpacity: 0.13,
      strokeOpacity: 0.85,
      weight: 1.5,
      dashSegments: const [4, 4],
    );
  }

  List<LatLng> _circleOutlinePoints(LatLng center, double radiusMeters) {
    const distance = Distance();
    return List<LatLng>.generate(
      73,
      (index) => distance.offset(center, radiusMeters, index * 5),
      growable: false,
    );
  }

  /// Standard raw-report marker matching the web Waste Map pin.
  Widget _buildReportMarker(ReportRecord report) {
    final cacheKey = '${report.id}_${report.status}';
    return _markerCache.putIfAbsent(
      cacheKey,
      () => _buildReportMarkerWidget(report),
    );
  }

  Widget _buildReportMarkerWidget(ReportRecord report) {
    final statusColor = _pinColor(report.status);
    return GestureDetector(
      onTap: () => _showReportDetails(report),
      child: RepaintBoundary(
        child: CustomPaint(
          size: const Size(_markerWidth, _markerHeight),
          painter: _WasteReportMarkerPainter(statusColor),
        ),
      ),
    );
  }

  Widget _buildAreaMarker(RadiusReportGroup group, List<ReportRecord> members) {
    final primaryReport = members.first;
    final count = members.length;
    if (count <= 1) return _buildReportMarker(primaryReport);

    final cacheKey = 'area_${group.id}_${primaryReport.status}_$count';
    return _markerCache.putIfAbsent(
      cacheKey,
      () => GestureDetector(
        onTap: () => _showRadiusGroupDetails(group, members),
        child: RepaintBoundary(
          child: SizedBox(
            width: _areaMarkerWidth,
            height: _areaMarkerHeight,
            child: Stack(
              alignment: Alignment.topCenter,
              clipBehavior: Clip.none,
              children: [
                CustomPaint(
                  size: const Size(_markerWidth, _markerHeight),
                  painter: _WasteReportMarkerPainter(
                    _pinColor(primaryReport.status),
                  ),
                ),
                Positioned(
                  top: 0,
                  right: 0,
                  child: Container(
                    constraints: const BoxConstraints(
                      minWidth: 22,
                      minHeight: 22,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E3A5F),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        count > 99 ? "99+" : "$count",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
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
      ),
    );
  }

  Widget _buildGroupMemberMarker(ReportRecord report) {
    final cacheKey = 'group_member_${report.id}_${report.status}';
    return _markerCache.putIfAbsent(
      cacheKey,
      () => GestureDetector(
        onTap: () => _showReportDetails(report),
        child: RepaintBoundary(
          child: Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: _pinColor(report.status),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2.5),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x732563EB),
                  blurRadius: 0,
                  spreadRadius: 2,
                ),
                BoxShadow(color: Color(0x59000000), blurRadius: 5),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────

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
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Wrap(
                              spacing: AppSpacing.xs,
                              runSpacing: AppSpacing.xs,
                              children: [
                                AppStatusPill(
                                  label:
                                      statusLabels[report.status] ??
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
                                padding: const EdgeInsets.only(
                                  top: AppSpacing.xs,
                                ),
                                child: _InfoRow(
                                  icon: Icons.place_outlined,
                                  label: "Address",
                                  value: report.address!,
                                ),
                              ),
                            const SizedBox(height: AppSpacing.sm),
                            Text(
                              "Citizen Comment",
                              style: Theme.of(context).textTheme.titleSmall
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

  void _showRadiusGroupDetails(
    RadiusReportGroup group,
    List<ReportRecord> reports,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
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
                maxHeight: mediaQuery.size.height * 0.72,
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
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.md,
                        AppSpacing.md,
                        AppSpacing.md,
                        AppSpacing.sm,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Cleanup Area",
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: AppSpacing.xxs),
                          Text(
                            "${reports.length} reports within ${group.radiusMeters.round()} m · ${group.citizenCount} citizen submissions",
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(color: AppColors.mutedForeground),
                          ),
                        ],
                      ),
                    ),
                    Flexible(
                      child: ListView.separated(
                        shrinkWrap: true,
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md,
                          0,
                          AppSpacing.md,
                          AppSpacing.md,
                        ),
                        itemCount: reports.length,
                        separatorBuilder: (_, _) =>
                            const SizedBox(height: AppSpacing.xs),
                        itemBuilder: (context, index) {
                          final report = reports[index];
                          return Container(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            decoration: BoxDecoration(
                              color: AppColors.secondary,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.place,
                                  size: 18,
                                  color: _pinColor(report.status),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        report.displayTitle,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: Theme.of(context)
                                            .textTheme
                                            .labelLarge
                                            ?.copyWith(
                                              fontWeight: FontWeight.w700,
                                            ),
                                      ),
                                      if ((report.address ?? "").isNotEmpty)
                                        Text(
                                          report.address!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(
                                                color:
                                                    AppColors.mutedForeground,
                                              ),
                                        ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                AppStatusPill(
                                  label:
                                      statusLabels[report.status] ??
                                      report.status,
                                  color: _pinColor(report.status),
                                ),
                              ],
                            ),
                          );
                        },
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
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                MapDateRangeFilter(
                  value: _dateRange,
                  onSelected: _changeDateRange,
                ),
                const Spacer(),
                IconButton(
                  onPressed: _loading ? null : () => _loadData(),
                  visualDensity: VisualDensity.compact,
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                    minimumSize: const Size(38, 38),
                    padding: EdgeInsets.zero,
                  ),
                  icon: const Icon(Icons.refresh, size: 20),
                  tooltip: "Refresh reports",
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                Expanded(
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: "Report Status",
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 2,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<_MapStatusFilter>(
                        value: _statusFilter,
                        isDense: true,
                        isExpanded: true,
                        items: _MapStatusFilter.values
                            .map(
                              (filter) => DropdownMenuItem(
                                value: filter,
                                child: Text(_statusFilterLabel(filter)),
                              ),
                            )
                            .toList(growable: false),
                        onChanged: (filter) {
                          if (filter != null) _changeStatusFilter(filter);
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.xs),
                FilterChip(
                  avatar: Icon(
                    Icons.circle_outlined,
                    size: 16,
                    color: _showRadiusCircles
                        ? AppColors.primary
                        : AppColors.mutedForeground,
                  ),
                  label: const Text("50 m"),
                  selected: _showRadiusCircles,
                  onSelected: (selected) =>
                      setState(() => _showRadiusCircles = selected),
                  showCheckmark: false,
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ],
            ),
            if (_errorMessage != null && _reports.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.xs),
              _buildMapWarning(
                icon: Icons.cloud_off_outlined,
                message: "Reports could not refresh: $_errorMessage",
              ),
            ],
            if (_auxiliaryFailure && _reports.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.xs),
              _buildMapWarning(
                icon: Icons.radio_button_unchecked,
                message:
                    "Report pins refreshed, but radius overlays failed: ${_auxiliaryErrorMessage ?? 'Unknown API error'}",
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMapWarning({required IconData icon, required String message}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.tint(AppColors.warning, opacity: 0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 15, color: AppColors.warning),
          const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: Text(
              message,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.foreground,
                fontSize: 11,
                height: 1.3,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
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
          ],
        ),
      ),
    );
  }

  Widget _buildLegend(BuildContext context) {
    const legendStatuses = [
      "PENDING",
      "VERIFIED",
      "CLEANUP_SCHEDULED",
      "IN_PROGRESS",
      "CLEANED",
      "REJECTED",
    ];

    return Card(
      elevation: 5,
      color: AppColors.card.withValues(alpha: 0.96),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => setState(() => _legendExpanded = !_legendExpanded),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.map_outlined,
                    size: 17,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Text(
                      "Grouped Areas · 50 m",
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Icon(
                    _legendExpanded ? Icons.expand_more : Icons.expand_less,
                    size: 20,
                    color: AppColors.mutedForeground,
                  ),
                ],
              ),
            ),
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeInOut,
            child: _legendExpanded
                ? Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.sm,
                      0,
                      AppSpacing.sm,
                      AppSpacing.sm,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Divider(height: AppSpacing.sm),
                        Row(
                          children: [
                            SizedBox(
                              width: 24,
                              height: 25,
                              child: Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  const Positioned(
                                    left: 0,
                                    bottom: 0,
                                    child: Icon(
                                      Icons.location_on,
                                      size: 21,
                                      color: Color(0xFF4F46E5),
                                    ),
                                  ),
                                  Positioned(
                                    top: -2,
                                    right: -2,
                                    child: Container(
                                      width: 13,
                                      height: 13,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF1E3A5F),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white,
                                          width: 1,
                                        ),
                                      ),
                                      child: const Center(
                                        child: Text(
                                          "2",
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 7,
                                            fontWeight: FontWeight.w800,
                                            height: 1,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 5),
                            Expanded(
                              child: Text(
                                "Area marker badge = reports within 50 m",
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xxs),
                        Row(
                          children: [
                            Container(
                              width: 13,
                              height: 13,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2,
                                ),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x732563EB),
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                "Dot = individual report in a group",
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Wrap(
                          spacing: AppSpacing.sm,
                          runSpacing: AppSpacing.xs,
                          children: legendStatuses
                              .map((status) {
                                final color = AppColors.statusColor(status);
                                return SizedBox(
                                  width: 96,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      CustomPaint(
                                        size: const Size(13, 17),
                                        painter: _WasteReportMarkerPainter(
                                          color,
                                        ),
                                      ),
                                      const SizedBox(width: 5),
                                      Flexible(
                                        child: Text(
                                          statusLabels[status] ?? status,
                                          overflow: TextOverflow.ellipsis,
                                          style: Theme.of(
                                            context,
                                          ).textTheme.labelSmall,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              })
                              .toList(growable: false),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Row(
                          children: [
                            Container(
                              width: 18,
                              height: 18,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(
                                  0xFF6366F1,
                                ).withValues(alpha: 0.16),
                                border: Border.all(
                                  color: const Color(0xFF4F46E5),
                                  width: 1.5,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                "50-meter report radius",
                                style: Theme.of(context).textTheme.labelSmall
                                    ?.copyWith(
                                      color: AppColors.mutedForeground,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final visibleReports = _visibleReports;
    final visibleGroups = widget.assignedOnly
        ? const <RadiusReportGroup>[]
        : _visibleRadiusGroups
              .where(
                (group) => group.reports.any(
                  (report) => _matchesStatus(report.status),
                ),
              )
              .toList(growable: false);
    final centerCounts = <String, int>{};
    for (final group in visibleGroups) {
      final centerKey =
          "${group.latitude.toStringAsFixed(6)},${group.longitude.toStringAsFixed(6)}";
      centerCounts.update(centerKey, (count) => count + 1, ifAbsent: () => 1);
    }
    final groupedReportIds = <String>{};
    final markers = <Marker>[];
    final groupConnections = <Polyline>[];

    for (final group in visibleGroups) {
      final members = group.reports
          .where((report) => _matchesStatus(report.status))
          .toList(growable: false);
      if (members.isEmpty) continue;

      groupedReportIds.addAll(members.map((report) => report.id));
      if (members.length > 1) {
        for (final report in members) {
          markers.add(
            Marker(
              point: LatLng(report.latitude, report.longitude),
              width: 22,
              height: 22,
              alignment: Alignment.center,
              child: _buildGroupMemberMarker(report),
            ),
          );
        }

        for (var first = 0; first < members.length; first++) {
          for (var second = first + 1; second < members.length; second++) {
            groupConnections.add(
              Polyline(
                points: [
                  LatLng(members[first].latitude, members[first].longitude),
                  LatLng(members[second].latitude, members[second].longitude),
                ],
                color: const Color(0xFF6366F1).withValues(alpha: 0.65),
                strokeWidth: 2,
                pattern: StrokePattern.dashed(segments: const [4, 6]),
              ),
            );
          }
        }
      }

      final centerKey =
          "${group.latitude.toStringAsFixed(6)},${group.longitude.toStringAsFixed(6)}";
      final isAllCleaned = members.every(
        (report) => report.status.toUpperCase() == "CLEANED",
      );
      final offsetX = centerCounts[centerKey]! > 1
          ? (isAllCleaned ? 22.0 : -22.0)
          : 0.0;
      final hasBadge = members.length > 1;
      final markerWidth = hasBadge ? _areaMarkerWidth : _markerWidth;
      final markerHeight = hasBadge ? _areaMarkerHeight : _markerHeight;
      markers.add(
        Marker(
          point: LatLng(group.latitude, group.longitude),
          width: markerWidth,
          height: markerHeight,
          alignment: Marker.computePixelAlignment(
            width: markerWidth,
            height: markerHeight,
            left: markerWidth / 2 - offsetX,
            top: _WasteReportMarkerPainter.pinCenter.dy,
          ),
          child: _buildAreaMarker(group, members),
        ),
      );
    }

    // Keep report pins visible while radius groups load or if a report is not
    // included in the backend's current grouping response.
    for (final report in visibleReports) {
      if (groupedReportIds.contains(report.id)) continue;
      markers.add(
        Marker(
          point: LatLng(report.latitude, report.longitude),
          width: _markerWidth,
          height: _markerHeight,
          alignment: _reportPinAlignment,
          child: _buildReportMarker(report),
        ),
      );
    }

    final visibleRadiusGroups = _showRadiusCircles
        ? visibleGroups
        : const <RadiusReportGroup>[];
    final radiusCircles = visibleRadiusGroups
        .map((group) {
          final members = group.reports
              .where((report) => _matchesStatus(report.status))
              .toList(growable: false);
          final style = _radiusStyle(group, reports: members);
          return CircleMarker(
            point: LatLng(group.latitude, group.longitude),
            radius: group.radiusMeters,
            useRadiusInMeter: true,
            color: style.fill.withValues(alpha: style.fillOpacity),
          );
        })
        .toList(growable: false);
    final radiusOutlines = visibleRadiusGroups
        .map((group) {
          final members = group.reports
              .where((report) => _matchesStatus(report.status))
              .toList(growable: false);
          final style = _radiusStyle(group, reports: members);
          return Polyline(
            points: _circleOutlinePoints(
              LatLng(group.latitude, group.longitude),
              group.radiusMeters,
            ),
            color: style.stroke.withValues(alpha: style.strokeOpacity),
            strokeWidth: style.weight,
            pattern: StrokePattern.dashed(segments: style.dashSegments),
          );
        })
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
            if (radiusCircles.isNotEmpty) CircleLayer(circles: radiusCircles),
            if (radiusOutlines.isNotEmpty)
              PolylineLayer(polylines: radiusOutlines),
            if (groupConnections.isNotEmpty)
              PolylineLayer(polylines: groupConnections),
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
        if (!widget.assignedOnly)
          Positioned(
            left: AppSpacing.sm,
            bottom: AppSpacing.sm,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.sizeOf(context).width - 112,
              ),
              child: _buildLegend(context),
            ),
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
                    ? "No reports on map"
                    : "Unable to load map data",
                subtitle:
                    _errorMessage ??
                    "No reports with map coordinates match the selected filters.",
              ),
            ),
          ),
      ],
    );
  }
}

/// Draws the same status-colored teardrop pin used by the web Waste Map.
class _WasteReportMarkerPainter extends CustomPainter {
  const _WasteReportMarkerPainter(this.color);

  static const pinCenter = Offset(17, 17);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final scaleX = size.width / 34;
    final scaleY = size.height / 44;
    canvas.save();
    canvas.scale(scaleX, scaleY);

    final pin = Path()
      ..moveTo(17, 1)
      ..cubicTo(8.16, 1, 1, 8.16, 1, 17)
      ..cubicTo(1, 28.25, 17, 43, 17, 43)
      ..cubicTo(17, 43, 33, 28.25, 33, 17)
      ..cubicTo(33, 8.16, 25.84, 1, 17, 1)
      ..close();

    canvas.drawShadow(pin, const Color(0x59000000), 3, false);
    canvas.drawPath(
      pin,
      Paint()
        ..color = color
        ..style = PaintingStyle.fill
        ..isAntiAlias = true,
    );
    canvas.drawPath(
      pin,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..strokeJoin = StrokeJoin.round
        ..isAntiAlias = true,
    );
    canvas.drawCircle(
      pinCenter,
      6.5,
      Paint()
        ..color = Colors.white
        ..isAntiAlias = true,
    );
    canvas.drawCircle(
      pinCenter,
      3.5,
      Paint()
        ..color = color
        ..isAntiAlias = true,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(_WasteReportMarkerPainter oldDelegate) =>
      color != oldDelegate.color;
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
          child: Icon(icon, size: 16, color: AppColors.mutedForeground),
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
              Text(value, style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
        ),
      ],
    );
  }
}
