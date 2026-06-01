import "dart:io";

import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:latlong2/latlong.dart";

import "../models/report.dart";
import "../services/api_service.dart";
import "../services/location_service.dart";
import "../services/yolo_service.dart";
import "success_screen.dart";

class FormScreen extends StatefulWidget {
  const FormScreen({
    super.key,
    required this.imageFile,
    required this.detection,
  });

  final File imageFile;
  final YoloDetectionResult detection;

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  final _locationController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationService = LocationService();
  final _apiService = ApiService();
  late final MapController _mapController;

  late String _selectedCategory;
  double? _latitude;
  double? _longitude;
  bool _isLoadingLocation = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _selectedCategory = widget.detection.isFallback
        ? "with_waste"
        : widget.detection.hasWaste
            ? "with_waste"
            : "no_waste";
    _loadLocation();
  }

  @override
  void dispose() {
    _locationController.dispose();
    _descriptionController.dispose();
    _mapController.dispose();
    super.dispose();
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

    setState(() => _isSubmitting = true);

    try {
      final imageUrl = await _apiService.uploadImage(widget.imageFile);
      final result = await _apiService.submitReport(
        imageUrl: imageUrl,
        category: _selectedCategory,
        confidence: widget.detection.confidence,
        latitude: _latitude!,
        longitude: _longitude!,
        locationName: locationName,
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
      );

      if (!mounted) return;

      if (!result.success) {
        throw Exception(result.message);
      }

      final report = Report(
        imageUrl: imageUrl,
        category: _selectedCategory,
        confidence: widget.detection.confidence,
        latitude: _latitude!,
        longitude: _longitude!,
        locationName: locationName,
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
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

  @override
  Widget build(BuildContext context) {
    final defaultLocation = _latitude != null && _longitude != null
        ? LatLng(_latitude!, _longitude!)
        : const LatLng(7.3132, 125.6844); // Panabo default

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
                  labelText: "Description (optional)",
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
                                  color: Colors.red.shade700,
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
                onPressed: _isSubmitting || _isLoadingLocation ? null : _submit,
                child: Text(_isSubmitting ? "Submitting..." : "Submit Report"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
