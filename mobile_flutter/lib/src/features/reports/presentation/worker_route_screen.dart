import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../data/report_service.dart';
import '../domain/report_models.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Worker Route Screen
// ─────────────────────────────────────────────────────────────────────────────

class WorkerRouteScreen extends ConsumerStatefulWidget {
  const WorkerRouteScreen({
    super.key,
    this.targetReport,
  });

  final ReportRecord? targetReport;

  @override
  ConsumerState<WorkerRouteScreen> createState() => _WorkerRouteScreenState();
}

class _WorkerRouteScreenState extends ConsumerState<WorkerRouteScreen> {
  // ── State ───────────────────────────────────────────────────────────────────
  late final WebViewController _controller;

  bool _webViewReady = false;
  bool _dataReady    = false;
  bool _loading      = true;
  String? _errorMessage;

  Position? _workerPosition;
  List<ReportRecord> _sortedReports = const [];

  // Prevent re-injecting if already sent to the map
  bool _routeInjected = false;

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    _initController();
    _loadData();
  }

  // ── WebView setup ───────────────────────────────────────────────────────────
  void _initController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'RouteChannel',
        onMessageReceived: _onMarkResolved,
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            _webViewReady = true;
            _tryInjectRoute();
          },
        ),
      );

    // Load the HTML as a string so the WebView uses a web-origin context.
    // This allows external CDN resources (Leaflet JS/CSS, tile servers, OSRM
    // routing API) to load correctly — loadFlutterAsset uses file:// protocol
    // which blocks network requests in the WebView on many Android devices.
    _loadHtmlAsset();
  }

  Future<void> _loadHtmlAsset() async {
    try {
      final html = await rootBundle.loadString(
        'assets/html/worker_route_map.html',
      );
      await _controller.loadHtmlString(
        html,
        baseUrl: 'https://unpkg.com',
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Failed to load map: $e';
        _loading = false;
      });
    }
  }

  // ── Data loading ─────────────────────────────────────────────────────────────
  Future<void> _loadData() async {
    setState(() {
      _loading      = true;
      _errorMessage = null;
      _routeInjected = false;
    });

    try {
      // 1. Get GPS location
      Position position = await _fetchLocation();

      // 2. Fetch assigned reports
      final result = await ref
          .read(reportServiceProvider)
          .getAssignedReports(page: 1, limit: 100);

      if (!mounted) return;

      // 3. Filter reports: single specific task route vs full route
      List<ReportRecord> active;
      if (widget.targetReport != null) {
        active = [widget.targetReport!];
      } else {
        active = result.data
            .where((r) => r.status != 'CLEANED' && r.status != 'REJECTED')
            .toList();
      }

      // If worker position is far away (> 50km, e.g. emulator default in US),
      // place worker position ~400m from first report so route line is clearly visible
      if (active.isNotEmpty) {
        final dist = _euclideanDist(
          position.latitude,
          position.longitude,
          active.first.latitude,
          active.first.longitude,
        );
        if (dist > 0.5) {
          position = Position(
            latitude: active.first.latitude - 0.0035,
            longitude: active.first.longitude - 0.0035,
            timestamp: DateTime.now(),
            accuracy: 10,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: 0,
            headingAccuracy: 0,
            speed: 0,
            speedAccuracy: 0,
          );
        }
      }

      // 4. Sort with nearest-neighbour
      final sorted = _nearestNeighbor(position, active);

      setState(() {
        _workerPosition = position;
        _sortedReports  = sorted;
        _dataReady      = true;
        _loading        = false;
      });

      _tryInjectRoute();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString();
        _loading      = false;
      });
    }
  }

  // ── GPS helper ───────────────────────────────────────────────────────────────
  Future<Position> _fetchLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return _fallbackPosition();
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return _fallbackPosition();
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return _fallbackPosition();
      }

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 6),
      );
    } catch (_) {
      return _fallbackPosition();
    }
  }

  Position _fallbackPosition() {
    return Position(
      longitude: 120.9842,
      latitude: 14.5995,
      timestamp: DateTime.now(),
      accuracy: 10,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      headingAccuracy: 0,
      speed: 0,
      speedAccuracy: 0,
    );
  }

  // ── Nearest-Neighbour algorithm ──────────────────────────────────────────────
  /// Sorts [reports] greedily starting from [origin] so the route visits the
  /// closest unvisited stop first.
  List<ReportRecord> _nearestNeighbor(
    Position origin,
    List<ReportRecord> reports,
  ) {
    if (reports.isEmpty) return const [];

    final remaining = List<ReportRecord>.from(reports);
    final sorted    = <ReportRecord>[];
    double curLat   = origin.latitude;
    double curLng   = origin.longitude;

    while (remaining.isNotEmpty) {
      // Find the closest un-visited report to the current position
      remaining.sort((a, b) {
        final da = _euclideanDist(curLat, curLng, a.latitude, a.longitude);
        final db = _euclideanDist(curLat, curLng, b.latitude, b.longitude);
        return da.compareTo(db);
      });
      final next = remaining.removeAt(0);
      sorted.add(next);
      curLat = next.latitude;
      curLng = next.longitude;
    }
    return sorted;
  }

  /// Fast Euclidean approximation — sufficient for ordering at city scale.
  double _euclideanDist(
    double lat1, double lng1,
    double lat2, double lng2,
  ) {
    const kDegToRad = math.pi / 180.0;
    final dLat = (lat2 - lat1) * kDegToRad;
    final dLng = (lng2 - lng1) * kDegToRad;
    final cosLat = math.cos(lat1 * kDegToRad);
    return math.sqrt(dLat * dLat + (dLng * cosLat) * (dLng * cosLat));
  }

  // ── Route injection ──────────────────────────────────────────────────────────
  void _tryInjectRoute() {
    if (!_webViewReady || !_dataReady || _routeInjected) return;
    _routeInjected = true;

    final position = _workerPosition!;

    // Build waypoint array: worker first, then sorted reports
    final waypoints = <Map<String, dynamic>>[
      {
        'lat':   position.latitude,
        'lng':   position.longitude,
        'label': 'You',
        'id':    null,
        'title': null,
      },
      for (int i = 0; i < _sortedReports.length; i++)
        {
          'lat':      _sortedReports[i].latitude,
          'lng':      _sortedReports[i].longitude,
          'label':    'Stop ${i + 1}',
          'id':       _sortedReports[i].id,
          'title':    _sortedReports[i].title,
          'category': _sortedReports[i].category,
        },
    ];

    final js = 'initRoute(${jsonEncode(waypoints)})';
    _controller.runJavaScript(js);
  }

  // ── JavascriptChannel callback ───────────────────────────────────────────────
  Future<void> _onMarkResolved(JavaScriptMessage message) async {
    final reportId = message.message.trim();
    if (reportId.isEmpty) return;

    try {
      await ref.read(reportServiceProvider).updateStatus(
            reportId: reportId,
            status:   'CLEANED',
            notes:    'Marked as resolved via Worker Route Map',
          );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Report marked as resolved ✓'),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior:         SnackBarBehavior.floating,
          shape:            RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          margin: const EdgeInsets.all(AppSpacing.md),
          duration: const Duration(seconds: 3),
        ),
      );

      // Refresh route data so resolved report is removed
      _dataReady     = false;
      _routeInjected = false;
      await _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update report: $e'),
          backgroundColor: AppColors.destructive,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          margin: const EdgeInsets.all(AppSpacing.md),
        ),
      );
    }
  }

  // ── Build ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    // Error state
    if (_errorMessage != null) {
      return _ErrorView(
        message: _errorMessage!,
        onRetry:  _loadData,
      );
    }

    return Stack(
      children: [
        // WebView (always mounted so it can pre-load)
        WebViewWidget(controller: _controller),

        // Flutter-side loading overlay (shown while GPS + API fetch)
        if (_loading)
          const _LoadingOverlay(),

        // Info bar at the top showing stop count
        if (!_loading && _dataReady)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: _RouteInfoBar(
              stopCount: _sortedReports.length,
              onRefresh: _loadData,
            ),
          ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-widgets
// ─────────────────────────────────────────────────────────────────────────────

class _LoadingOverlay extends StatelessWidget {
  const _LoadingOverlay();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0066CC), Color(0xFF0284C7)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0066CC).withValues(alpha: 0.3),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.route_rounded,
                  color: Colors.white,
                  size: 36,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                "Building Cleanup Route",
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.foreground,
                      fontSize: 18,
                      letterSpacing: -0.4,
                    ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                "Detecting GPS & optimizing assigned stops...",
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.mutedForeground,
                      fontSize: 13,
                    ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.tint(AppColors.primary, opacity: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      "FIELD NAVIGATION ENGINE",
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RouteInfoBar extends StatelessWidget {
  const _RouteInfoBar({
    required this.stopCount,
    required this.onRefresh,
  });

  final int stopCount;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(
        AppSpacing.sm, AppSpacing.sm, AppSpacing.sm, 0,
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.tint(AppColors.primary),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.route, color: AppColors.primary, size: 16),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: stopCount == 0
                ? Text(
                    'No active stops — all reports resolved!',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.success,
                        ),
                  )
                : RichText(
                    text: TextSpan(
                      style: Theme.of(context).textTheme.bodySmall,
                      children: [
                        TextSpan(
                          text: '$stopCount stop${stopCount == 1 ? '' : 's'} ',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.foreground,
                          ),
                        ),
                        const TextSpan(
                          text: '• Nearest-neighbour order',
                          style: TextStyle(color: AppColors.mutedForeground),
                        ),
                      ],
                    ),
                  ),
          ),
          IconButton(
            tooltip: 'Refresh route',
            onPressed: onRefresh,
            icon: const Icon(Icons.refresh_rounded),
            iconSize: 18,
            color: AppColors.mutedForeground,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String  message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.screen,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.tint(AppColors.destructive),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.location_off_outlined,
                color: AppColors.destructive,
                size: 30,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Could not load route',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.mutedForeground,
                  ),
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton.icon(
              onPressed: onRetry,
              icon:  const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
