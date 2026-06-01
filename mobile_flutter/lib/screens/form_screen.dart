import "dart:convert";
import "dart:io";

import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:image_picker/image_picker.dart";
import "package:latlong2/latlong.dart";

import "../models/report.dart";
import "../services/location_service.dart";
import "../services/yolo_service.dart";
import "../src/core/providers.dart";
import "../src/features/reports/data/report_service.dart";
import "success_screen.dart";

class FormScreen extends ConsumerStatefulWidget {
  const FormScreen({
    super.key,
    required this.imageFile,
    required this.detection,
  });

  final File imageFile;
  final YoloDetectionResult detection;

  @override
  ConsumerState<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends ConsumerState<FormScreen> {
  final _locationController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationService = LocationService();
  late final MapController _mapController;

  late String _selectedCategory;
  double? _latitude;
  double? _longitude;
  bool _isLoadingLocation = true;
  bool _isSubmitting = false;
  String? _errorMessage;
  bool _zonesLoading = true;
  String? _zonesError;
  List<List<LatLng>> _zonePolygons = const [];
  bool _isOutsideZone = false;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _selectedCategory = widget.detection.isFallback
        ? "with_waste"
        : widget.detection.hasWaste
            ? "with_waste"
            : "no_waste";
    _loadZones();
    _loadLocation();
  }

  @override
  void dispose() {
    _locationController.dispose();
    _descriptionController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _loadZones() async {
    setState(() {
      _zonesLoading = true;
      _zonesError = null;
    });

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get<List<dynamic>>("/reporting-zones");
      final data = response.data ?? const [];

      final polygons = <List<LatLng>>[];
      for (final zone in data) {
        if (zone is Map<String, dynamic>) {
          final points = _parseZonePoints(zone["coordinates"]);
          if (points.length >= 3) {
            polygons.add(points);
          }
        }
      }

      setState(() {
        _zonePolygons = polygons;
        _zonesLoading = false;
        _zonesError =
            polygons.isEmpty ? "No active coastal zones available." : null;
      });

      if (_latitude != null && _longitude != null) {
        _applyZoneValidation(LatLng(_latitude!, _longitude!), notify: false);
      }
    } catch (error) {
      setState(() {
        _zonesLoading = false;
        _zonesError = "Failed to load coastal zones. Please try again.";
        _zonePolygons = const [];
        _isOutsideZone = true;
      });
    }
  }

  Future<void> _loadLocation() async {
    setState(() {
      _isLoadingLocation = true;
      _errorMessage = null;
    });

    try {
      final location = await _locationService.getCurrentLocation();
      if (!mounted) return;

      setState(() {
        _latitude = location.latitude;
        _longitude = location.longitude;
        _locationController.text = location.locationName;
      });

      _applyZoneValidation(
        LatLng(location.latitude, location.longitude),
        notify: true,
      );
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = error.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
        });
      }
    }
  }

  void _updateLocationFromMap(LatLng point) {
    setState(() {
      _latitude = point.latitude;
      _longitude = point.longitude;
    });

    _applyZoneValidation(point, notify: true);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          "Location updated: ${point.latitude.toStringAsFixed(5)}, ${point.longitude.toStringAsFixed(5)}",
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _submit() async {
    final locationName = _locationController.text.trim();
    final rawDescription = _descriptionController.text.trim();
    final description =
        rawDescription.isEmpty ? "Submitted via mobile app." : rawDescription;
    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Location is not ready yet.")),
      );
      return;
    }

    if (locationName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter a location name.")),
      );
      return;
    }

    if (_zonesLoading || _zonePolygons.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please wait for coastal zones to load."),
        ),
      );
      return;
    }

    if (_isOutsideZone) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Reports must be inside the designated coastal zone."),
        ),
      );
      return;
    }

    if (description.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Description must be at least 10 characters."),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final reportService = ref.read(reportServiceProvider);
      final created = await reportService.createReport(
        title: locationName,
        description: description,
        category: _selectedCategory,
        latitude: _latitude!,
        longitude: _longitude!,
        address: locationName,
        isAnonymous: false,
      );

      await reportService.uploadReportImages(
        reportId: created.id,
        images: [XFile(widget.imageFile.path)],
        type: "REPORT",
      );

      if (!mounted) return;

      final report = Report(
        imageUrl: "",
        category: _selectedCategory,
        confidence: widget.detection.confidence,
        latitude: _latitude!,
        longitude: _longitude!,
        locationName: locationName,
        description: rawDescription.isNotEmpty ? rawDescription : null,
        reportedAt: DateTime.now(),
      );

      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => SuccessScreen(report: report),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  double? _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? "");
  }

  List<LatLng> _parseZonePoints(dynamic raw) {
    if (raw is String) {
      try {
        return _parseZonePoints(jsonDecode(raw));
      } catch (_) {
        return const [];
      }
    }

    if (raw is List) {
      final points = <LatLng>[];
      for (final entry in raw) {
        if (entry is Map) {
          final lat = _toDouble(entry["lat"] ?? entry["latitude"]);
          final lng = _toDouble(entry["lng"] ?? entry["longitude"]);
          if (lat != null && lng != null) {
            points.add(LatLng(lat, lng));
          }
        }
      }
      return points;
    }

    return const [];
  }

  bool _isPointInPolygon(LatLng point, List<LatLng> polygon) {
    bool inside = false;
    final n = polygon.length;
    int j = n - 1;
    for (int i = 0; i < n; i++) {
      final xi = polygon[i].longitude;
      final yi = polygon[i].latitude;
      final xj = polygon[j].longitude;
      final yj = polygon[j].latitude;
      final intersect = ((yi > point.latitude) != (yj > point.latitude)) &&
          (point.longitude <
              (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
      j = i;
    }
    return inside;
  }

  bool _isInsideAnyZone(LatLng point) {
    for (final polygon in _zonePolygons) {
      if (_isPointInPolygon(point, polygon)) {
        return true;
      }
    }
    return false;
  }

  void _applyZoneValidation(LatLng point, {required bool notify}) {
    if (_zonesLoading) {
      return;
    }

    if (_zonePolygons.isEmpty) {
      setState(() => _isOutsideZone = true);
      if (notify) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Coastal zones are unavailable right now."),
          ),
        );
      }
      return;
    }

    final outside = !_isInsideAnyZone(point);
    setState(() => _isOutsideZone = outside);
    if (outside && notify) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Location is outside the designated coastal zone."),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final defaultLocation = _latitude != null && _longitude != null
        ? LatLng(_latitude!, _longitude!)
        : const LatLng(7.3132, 125.6844); // Panabo default
    final markerColor =
        _isOutsideZone ? Colors.red.shade700 : Colors.green.shade600;
    final canSubmit = !_isSubmitting &&
        !_isLoadingLocation &&
        !_zonesLoading &&
        _zonePolygons.isNotEmpty &&
        !_isOutsideZone &&
        _latitude != null &&
        _longitude != null;

    return Scaffold(
      appBar: AppBar(title: const Text("Report Details")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Category",
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                      value: "with_waste", child: Text("With Waste")),
                  DropdownMenuItem(value: "no_waste", child: Text("No Waste")),
                ],
                onChanged: (value) {
                  if (value == null) return;
                  setState(() => _selectedCategory = value);
                },
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: "Location name",
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: "Description (10+ chars)",
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                "Mark Location on Map",
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              Text(
                "Tap on the map to mark or confirm your report location within the coastal zone.",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey.shade600,
                    ),
              ),
              const SizedBox(height: 12),
              Container(
                height: 320,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      initialCenter: defaultLocation,
                      initialZoom: 15,
                      onTap: (tapPosition, point) {
                        _updateLocationFromMap(point);
                      },
                    ),
                    children: [
                      TileLayer(
                        urlTemplate:
                            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                        userAgentPackageName: "com.bluewaste.mobile_flutter",
                      ),
                      PolygonLayer(
                        polygons: _zonePolygons
                            .map(
                              (points) => Polygon(
                                points: points,
                                color: Colors.teal.withValues(alpha: 0.18),
                                borderColor: Colors.teal.shade700,
                                borderStrokeWidth: 2,
                              ),
                            )
                            .toList(growable: false),
                      ),
                      MarkerLayer(
                        markers: [
                          if (_latitude != null && _longitude != null)
                            Marker(
                              point: LatLng(_latitude!, _longitude!),
                              width: 40,
                              height: 40,
                              child: Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: markerColor,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 3,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color:
                                          Colors.black.withValues(alpha: 0.3),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.location_on,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (_zonesLoading)
                const LinearProgressIndicator()
              else if (_zonesError != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _zonesError!,
                        style: const TextStyle(color: Colors.red),
                      ),
                      const SizedBox(height: 8),
                      OutlinedButton.icon(
                        onPressed: _loadZones,
                        icon: const Icon(Icons.refresh),
                        label: const Text("Retry coastal zones"),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _isOutsideZone
                        ? Colors.red.shade50
                        : Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _isOutsideZone
                          ? Colors.red.shade200
                          : Colors.green.shade200,
                    ),
                  ),
                  child: Text(
                    _isOutsideZone
                        ? "Outside the coastal zone. Move the pin inside to submit."
                        : "Inside the coastal zone. You can submit this report.",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              const SizedBox(height: 12),
              if (_isLoadingLocation)
                const LinearProgressIndicator()
              else if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                )
              else
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.shade200),
                  ),
                  child: Text(
                    _latitude != null && _longitude != null
                        ? "GPS: ${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}"
                        : "GPS not available",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: canSubmit ? _submit : null,
                child: Text(_isSubmitting ? "Submitting..." : "Submit Report"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
