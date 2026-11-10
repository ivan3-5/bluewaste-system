import "package:dio/dio.dart";
import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:latlong2/latlong.dart";

import "../../../core/config/app_env.dart";
import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";

/// Lets the citizen drop a pin manually. Pins are only accepted inside an
/// active reporting zone. Pops with the chosen [LatLng] on confirmation.
class LocationPickerScreen extends StatefulWidget {
  const LocationPickerScreen({super.key, this.initialLocation});

  final LatLng? initialLocation;

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  static const LatLng _fallbackCenter = LatLng(7.3132, 125.6844);

  final MapController _mapController = MapController();

  List<List<LatLng>> _zones = const [];
  bool _loading = true;
  String? _error;
  LatLng? _selected;

  @override
  void initState() {
    super.initState();
    _loadZones();
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _loadZones() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final dio = Dio(
        BaseOptions(
          baseUrl: AppEnv.apiBaseUrl,
          connectTimeout: const Duration(seconds: 8),
          receiveTimeout: const Duration(seconds: 8),
        ),
      );
      final response = await dio.get<List<dynamic>>("/reporting-zones");
      final zones = <List<LatLng>>[];
      for (final zone in response.data ?? const <dynamic>[]) {
        final raw = zone["coordinates"];
        if (raw is! List) continue;
        final ring = <LatLng>[
          for (final c in raw)
            if (c is Map && c["lat"] is num && c["lng"] is num)
              LatLng((c["lat"] as num).toDouble(), (c["lng"] as num).toDouble()),
        ];
        if (ring.length >= 3) zones.add(ring);
      }
      if (!mounted) return;
      setState(() {
        _zones = zones;
        _loading = false;
        final initial = widget.initialLocation;
        if (initial != null && _isInsideAnyZone(initial)) _selected = initial;
        if (zones.isEmpty) {
          _error = "No active reporting zones are available right now.";
        }
      });
      _focusZones();
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = "Could not load reporting zones. Check your connection.";
      });
    }
  }

  void _focusZones() {
    if (_zones.isEmpty) return;
    final points = _zones.expand((ring) => ring).toList();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _mapController.fitCamera(
        CameraFit.coordinates(
          coordinates: points,
          padding: const EdgeInsets.all(48),
          maxZoom: 17,
        ),
      );
    });
  }

  bool _isInsideAnyZone(LatLng point) =>
      _zones.any((ring) => _pointInPolygon(point, ring));

  /// Ray-casting point-in-polygon test.
  bool _pointInPolygon(LatLng point, List<LatLng> polygon) {
    var inside = false;
    var j = polygon.length - 1;
    for (var i = 0; i < polygon.length; i++) {
      final xi = polygon[i].longitude;
      final yi = polygon[i].latitude;
      final xj = polygon[j].longitude;
      final yj = polygon[j].latitude;
      final intersect =
          ((yi > point.latitude) != (yj > point.latitude)) &&
          (point.longitude < (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
      j = i;
    }
    return inside;
  }

  void _onTap(TapPosition _, LatLng point) {
    if (_zones.isEmpty) return;
    if (!_isInsideAnyZone(point)) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          const SnackBar(
            content: Text(
              "You can only mark a location inside the highlighted reporting zones.",
            ),
          ),
        );
      return;
    }
    setState(() => _selected = point);
  }

  @override
  Widget build(BuildContext context) {
    final selected = _selected;
    final initialCenter = widget.initialLocation ?? _fallbackCenter;

    return Scaffold(
      appBar: AppBar(title: const Text("Mark Location on Map")),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: initialCenter,
              initialZoom: 14,
              onTap: _onTap,
            ),
            children: [
              TileLayer(
                urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                userAgentPackageName: "com.bluewaste.mobile_flutter",
              ),
              PolygonLayer(
                polygons: [
                  for (final ring in _zones)
                    Polygon(
                      points: ring,
                      color: AppColors.success.withValues(alpha: 0.2),
                      borderColor: AppColors.success,
                      borderStrokeWidth: 2,
                    ),
                ],
              ),
              if (selected != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: selected,
                      width: 48,
                      height: 48,
                      alignment: Alignment.topCenter,
                      child: const Icon(
                        Icons.location_on,
                        size: 48,
                        color: AppColors.destructive,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          if (_loading)
            const Positioned.fill(
              child: ColoredBox(
                color: Color(0x14000000),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
          Positioned(
            left: AppSpacing.sm,
            right: AppSpacing.sm,
            top: AppSpacing.sm,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: Row(
                  children: [
                    Icon(
                      _error != null ? Icons.error_outline : Icons.touch_app,
                      color: _error != null
                          ? AppColors.destructive
                          : AppColors.info,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Text(
                        _error ??
                            "Tap inside a highlighted zone to mark where the waste is.",
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                    if (_error != null)
                      TextButton(
                        onPressed: _loadZones,
                        child: const Text("Retry"),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.sm),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (selected != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                  child: Text(
                    "${selected.latitude.toStringAsFixed(5)}, ${selected.longitude.toStringAsFixed(5)}",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  onPressed: selected == null
                      ? null
                      : () => Navigator.of(context).pop(selected),
                  icon: const Icon(Icons.check),
                  label: const Text("Confirm Location"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
