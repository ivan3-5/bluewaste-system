import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:latlong2/latlong.dart";

import "../../../core/network/api_exception.dart";
import "../data/reporting_zones.dart";
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
      final zones = await ReportingZones().load();
      if (!mounted) return;
      setState(() {
        _zones = zones;
        _loading = false;
        final initial = widget.initialLocation;
        final candidate = _selected ?? initial;
        _selected = candidate != null && _isInsideAnyZone(candidate) ? candidate : null;
        if (zones.isEmpty) {
          _error = "No active reporting zones are available right now.";
        }
      });
      _focusZones();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _zones = [];
        _selected = null;
        _error = error is ApiException ? error.message : "Could not load reporting zones.";
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

  bool _isInsideAnyZone(LatLng point) => isInsideReportingZones(point, _zones);

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
