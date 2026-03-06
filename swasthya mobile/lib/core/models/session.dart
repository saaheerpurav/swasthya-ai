class Session {
  final String? sessionId;
  final String userId;
  final String token;
  final bool isNew;
  final DateTime expiresAt;

  const Session({
    this.sessionId,
    required this.userId,
    required this.token,
    required this.isNew,
    required this.expiresAt,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      sessionId: json['sessionId'] as String?,
      userId: json['userId'] as String,
      token: json['token'] as String,
      isNew: json['isNew'] as bool? ?? false,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
    );
  }
}
