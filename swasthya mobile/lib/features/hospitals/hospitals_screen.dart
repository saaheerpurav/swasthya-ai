import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../core/models/facility.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/facility_card.dart';

const _overpassUrl = 'https://overpass-api.de/api/interpreter';
const _radiusMeters = 5000;

class HospitalsScreen extends ConsumerStatefulWidget {
  const HospitalsScreen({super.key});

  @override
  ConsumerState<HospitalsScreen> createState() => _HospitalsScreenState();
}

class _HospitalsScreenState extends ConsumerState<HospitalsScreen> {
  LatLng? _userPosition;
  List<PlaceResult> _places = [];
  String? _error;
  bool _loading = true;
  final _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _getLocationAndPlaces();
  }

  Future<void> _getLocationAndPlaces() async {
    setState(() { _loading = true; _error = null; });
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      final requested = await Geolocator.requestPermission();
      if (requested == LocationPermission.denied ||
          requested == LocationPermission.deniedForever) {
        setState(() {
          _loading = false;
          _error = 'Location permission denied.';
        });
        return;
      }
    }
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );
      final center = LatLng(position.latitude, position.longitude);
      setState(() => _userPosition = center);
      final places = await _findNearbyHospitals(
        position.latitude,
        position.longitude,
      );
      setState(() { _places = places; _loading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<List<PlaceResult>> _findNearbyHospitals(double lat, double lng) async {
    // Overpass: hospitals, clinics, pharmacies, doctors within radius
    final query = '''
[out:json][timeout:25];
(
  node["amenity"~"hospital|clinic|doctors|pharmacy"](around:$_radiusMeters,$lat,$lng);
  node["healthcare"](around:$_radiusMeters,$lat,$lng);
);
out body;
''';
    final res = await http.post(
      Uri.parse(_overpassUrl),
      body: query,
    );
    if (res.statusCode != 200) {
      throw Exception('Could not fetch places: ${res.statusCode}');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    final elements = json['elements'] as List<dynamic>? ?? [];
    final list = <PlaceResult>[];
    for (final e in elements) {
      final map = e as Map<String, dynamic>;
      if (map['lat'] != null && map['lon'] != null) {
        list.add(PlaceResult.fromOverpassJson(map));
      }
    }
    return list;
  }

  double _distanceKm(PlaceResult p) {
    if (_userPosition == null) return 0;
    const distance = Distance();
    return distance.as(LengthUnit.Kilometer, _userPosition!, LatLng(p.lat, p.lng));
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);

    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text(t('nearby_hospitals', lang))),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: Text(t('nearby_hospitals', lang))),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(_error!, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _getLocationAndPlaces,
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final center = _userPosition ?? const LatLng(12.9716, 77.5946);

    return Scaffold(
      appBar: AppBar(title: Text(t('nearby_hospitals', lang))),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: center,
              initialZoom: 14,
              onTap: (_, __) {},
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.swasthyaai.swasthya_ai',
              ),
              if (_userPosition != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _userPosition!,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.person_pin_circle,
                        color: primaryGreen,
                        size: 40,
                      ),
                    ),
                  ],
                ),
              MarkerLayer(
                markers: _places.map((p) {
                  return Marker(
                    point: LatLng(p.lat, p.lng),
                    width: 36,
                    height: 36,
                    child: InkWell(
                      onTap: () => _showPlaceSheet(context, p, lang),
                      child: const Icon(
                        Icons.local_hospital,
                        color: emergencyRed,
                        size: 36,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          DraggableScrollableSheet(
            initialChildSize: 0.35,
            minChildSize: 0.2,
            maxChildSize: 0.7,
            builder: (context, scrollController) => Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    t('nearby_hospitals', lang),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  ..._places.map((p) {
                    final dist = _distanceKm(p);
                    return FacilityCard(
                      facility: Facility(
                        facilityId: p.placeId,
                        name: p.name,
                        facilityType: p.facilityType,
                        distance: dist,
                        location: FacilityLocation(
                          latitude: p.lat,
                          longitude: p.lng,
                          address: p.address,
                        ),
                        phoneNumber: p.phone,
                      ),
                      onDirections: () => _openDirections(p.lat, p.lng),
                      distanceKm: dist,
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showPlaceSheet(BuildContext context, PlaceResult p, String lang) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(p.name, style: Theme.of(context).textTheme.titleLarge),
            if (p.address != null) Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(p.address!, style: TextStyle(color: textSecondary)),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                if (p.phone != null)
                  ElevatedButton.icon(
                    icon: const Icon(Icons.call),
                    label: Text(t('call', lang)),
                    onPressed: () => launchUrl(Uri.parse('tel:${p.phone}')),
                  ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  icon: const Icon(Icons.directions),
                  label: Text(t('get_directions', lang)),
                  onPressed: () => _openDirections(p.lat, p.lng),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openDirections(double lat, double lng) async {
    // Open in OSM or default maps app
    final url = Uri.parse('https://www.openstreetmap.org/directions?from=${_userPosition?.latitude},${_userPosition?.longitude}&to=$lat,$lng');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }
}
