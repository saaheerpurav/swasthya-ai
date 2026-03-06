class VaccinationProfile {
  final String profileId;
  final String dateOfBirth;
  final String gender;
  final List<VaccinationRecord> vaccinations;
  final List<UpcomingVaccine> upcomingVaccines;
  final List<FamilyMember> familyMembers;
  final DateTime? updatedAt;

  const VaccinationProfile({
    required this.profileId,
    required this.dateOfBirth,
    required this.gender,
    required this.vaccinations,
    required this.upcomingVaccines,
    required this.familyMembers,
    this.updatedAt,
  });

  factory VaccinationProfile.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>? ?? json;
    return VaccinationProfile(
      profileId: profile['profileId'] as String? ?? '',
      dateOfBirth: profile['dateOfBirth'] as String? ?? '',
      gender: profile['gender'] as String? ?? '',
      vaccinations: (profile['vaccinations'] as List<dynamic>?)
              ?.map((e) => VaccinationRecord.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      upcomingVaccines: (profile['upcomingVaccines'] as List<dynamic>?)
              ?.map((e) => UpcomingVaccine.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      familyMembers: (profile['familyMembers'] as List<dynamic>?)
              ?.map((e) => FamilyMember.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      updatedAt: profile['updatedAt'] != null
          ? DateTime.tryParse(profile['updatedAt'] as String)
          : null,
    );
  }
}

class VaccinationRecord {
  final String vaccineId;
  final String vaccineName;
  final String dateAdministered;
  final String? facilityId;
  final String? batchNumber;

  const VaccinationRecord({
    required this.vaccineId,
    required this.vaccineName,
    required this.dateAdministered,
    this.facilityId,
    this.batchNumber,
  });

  factory VaccinationRecord.fromJson(Map<String, dynamic> json) {
    return VaccinationRecord(
      vaccineId: json['vaccineId'] as String? ?? '',
      vaccineName: json['vaccineName'] as String? ?? '',
      dateAdministered: json['dateAdministered'] as String? ?? '',
      facilityId: json['facilityId'] as String?,
      batchNumber: json['batchNumber'] as String?,
    );
  }
}

class UpcomingVaccine {
  final String vaccineId;
  final String vaccineName;
  final String dueDate;
  final bool reminderSent;
  final String priority; // 'high' | 'medium' | 'low'

  const UpcomingVaccine({
    required this.vaccineId,
    required this.vaccineName,
    required this.dueDate,
    this.reminderSent = false,
    required this.priority,
  });

  factory UpcomingVaccine.fromJson(Map<String, dynamic> json) {
    return UpcomingVaccine(
      vaccineId: json['vaccineId'] as String? ?? '',
      vaccineName: json['vaccineName'] as String? ?? '',
      dueDate: json['dueDate'] as String? ?? '',
      reminderSent: json['reminderSent'] as bool? ?? false,
      priority: json['priority'] as String? ?? 'medium',
    );
  }
}

class FamilyMember {
  final String memberId;
  final String name;
  final String relationship;
  final String dateOfBirth;
  final List<UpcomingVaccine> upcomingVaccines;

  const FamilyMember({
    required this.memberId,
    required this.name,
    required this.relationship,
    required this.dateOfBirth,
    required this.upcomingVaccines,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      memberId: json['memberId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      relationship: json['relationship'] as String? ?? 'other',
      dateOfBirth: json['dateOfBirth'] as String? ?? '',
      upcomingVaccines: (json['upcomingVaccines'] as List<dynamic>?)
              ?.map((e) => UpcomingVaccine.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
