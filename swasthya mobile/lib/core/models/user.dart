class User {
  final String userId;
  final String? phoneNumber;
  final String preferredLanguage;
  final UserLocation? location;
  final PrivacySettings privacySettings;
  final bool onboardingComplete;
  final DateTime createdAt;
  final DateTime lastActive;

  const User({
    required this.userId,
    this.phoneNumber,
    required this.preferredLanguage,
    this.location,
    required this.privacySettings,
    required this.onboardingComplete,
    required this.createdAt,
    required this.lastActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      preferredLanguage: json['preferredLanguage'] as String? ?? 'en',
      location: json['location'] != null
          ? UserLocation.fromJson(json['location'] as Map<String, dynamic>)
          : null,
      privacySettings: json['privacySettings'] != null
          ? PrivacySettings.fromJson(
              json['privacySettings'] as Map<String, dynamic>)
          : const PrivacySettings(shareLocation: true, allowAlerts: true),
      onboardingComplete: json['onboardingComplete'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastActive: DateTime.parse(json['lastActive'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'userId': userId,
        'phoneNumber': phoneNumber,
        'preferredLanguage': preferredLanguage,
        'location': location?.toJson(),
        'privacySettings': privacySettings.toJson(),
        'onboardingComplete': onboardingComplete,
        'createdAt': createdAt.toIso8601String(),
        'lastActive': lastActive.toIso8601String(),
      };
}

class UserLocation {
  final String regionCode;
  final double? latitude;
  final double? longitude;
  final String? address;

  const UserLocation({
    required this.regionCode,
    this.latitude,
    this.longitude,
    this.address,
  });

  factory UserLocation.fromJson(Map<String, dynamic> json) {
    return UserLocation(
      regionCode: json['regionCode'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'regionCode': regionCode,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
      };
}

class PrivacySettings {
  final bool shareLocation;
  final bool allowAlerts;

  const PrivacySettings({
    required this.shareLocation,
    required this.allowAlerts,
  });

  factory PrivacySettings.fromJson(Map<String, dynamic> json) {
    return PrivacySettings(
      shareLocation: json['shareLocation'] as bool? ?? true,
      allowAlerts: json['allowAlerts'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() =>
      {'shareLocation': shareLocation, 'allowAlerts': allowAlerts};
}
