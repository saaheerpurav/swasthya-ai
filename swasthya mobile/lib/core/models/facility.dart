class Facility {
  final String facilityId;
  final String name;
  final String facilityType;
  final double distance;
  final bool isOpen;
  final FacilityLocation location;
  final String? phoneNumber;
  final List<String> services;
  final List<String> languagesSupported;

  const Facility({
    required this.facilityId,
    required this.name,
    required this.facilityType,
    required this.distance,
    this.isOpen = true,
    required this.location,
    this.phoneNumber,
    this.services = const [],
    this.languagesSupported = const [],
  });

  factory Facility.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> locJson = json['location'] as Map<String, dynamic>? ?? {};
    if (json['geometry'] != null && json['geometry']['location'] != null) {
      final g = json['geometry']['location'] as Map<String, dynamic>;
      locJson = {'lat': g['lat'], 'lng': g['lng'], 'address': json['vicinity'] ?? json['formatted_address']};
    }
    final types = json['types'] as List<dynamic>?;
    final typeStr = types?.isNotEmpty == true ? (types!.first as String) : 'hospital';
    return Facility(
      facilityId: json['facilityId'] as String? ?? json['place_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      facilityType: json['facilityType'] as String? ?? typeStr,
      distance: (json['distance'] as num?)?.toDouble() ?? 0,
      isOpen: json['opening_hours']?['open_now'] as bool? ?? true,
      location: FacilityLocation.fromJson(locJson),
      phoneNumber: json['formatted_phone_number'] as String? ?? json['international_phone_number'] as String?,
      services: (json['services'] as List<dynamic>?)?.cast<String>() ?? [],
      languagesSupported:
          (json['languagesSupported'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }
}

/// Result from OpenStreetMap Overpass API (used in hospitals_screen).
class PlaceResult {
  final String placeId;
  final String name;
  final String? address;
  final double lat;
  final double lng;
  final double? rating;
  final String? phone;
  final String facilityType;

  const PlaceResult({
    required this.placeId,
    required this.name,
    this.address,
    required this.lat,
    required this.lng,
    this.rating,
    this.phone,
    this.facilityType = 'hospital',
  });

  /// From OSM Overpass API element (node with tags).
  factory PlaceResult.fromOverpassJson(Map<String, dynamic> json) {
    final tags = json['tags'] as Map<String, dynamic>? ?? {};
    final name = tags['name'] as String? ?? tags['name:en'] as String? ?? 'Unknown';
    final type = tags['amenity'] as String? ?? tags['healthcare'] as String? ?? 'hospital';
    final addr = _formatAddress(tags);
    final phone = tags['phone'] as String? ?? tags['contact:phone'] as String?;
    return PlaceResult(
      placeId: 'osm_${json['id']}',
      name: name,
      address: addr.isEmpty ? null : addr,
      lat: (json['lat'] as num?)?.toDouble() ?? 0,
      lng: (json['lon'] as num?)?.toDouble() ?? 0,
      phone: phone,
      facilityType: type,
    );
  }

  static String _formatAddress(Map<String, dynamic> tags) {
    final parts = <String>[];
    if (tags['addr:street'] != null) parts.add(tags['addr:street'] as String);
    if (tags['addr:city'] != null) parts.add(tags['addr:city'] as String);
    if (tags['addr:state'] != null) parts.add(tags['addr:state'] as String);
    return parts.join(', ');
  }
}

class FacilityLocation {
  final double latitude;
  final double longitude;
  final String? address;

  const FacilityLocation({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory FacilityLocation.fromJson(Map<String, dynamic> json) {
    return FacilityLocation(
      latitude: (json['lat'] as num?)?.toDouble() ??
          (json['latitude'] as num?)?.toDouble() ??
          0,
      longitude: (json['lng'] as num?)?.toDouble() ??
          (json['longitude'] as num?)?.toDouble() ??
          0,
      address: json['address'] as String? ?? json['vicinity'] as String? ?? json['formatted_address'] as String?,
    );
  }
}
