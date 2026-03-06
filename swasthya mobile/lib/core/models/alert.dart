class Alert {
  final String alertId;
  final String type; // 'outbreak' | 'weather' | 'health'
  final String severity; // 'critical' | 'high' | 'medium' | 'low'
  final String title;
  final String message;
  final String regionCode;
  final String? sourceUrl;
  final DateTime createdAt;
  final DateTime expiresAt;

  const Alert({
    required this.alertId,
    required this.type,
    required this.severity,
    required this.title,
    required this.message,
    required this.regionCode,
    this.sourceUrl,
    required this.createdAt,
    required this.expiresAt,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      alertId: json['alertId'] as String? ?? '',
      type: json['type'] as String? ?? 'health',
      severity: json['severity'] as String? ?? 'medium',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      regionCode: json['regionCode'] as String? ?? '',
      sourceUrl: json['sourceUrl'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : DateTime.now(),
    );
  }
}
