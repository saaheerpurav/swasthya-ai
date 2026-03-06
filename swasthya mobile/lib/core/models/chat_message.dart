class ChatMessage {
  final String id;
  final String role; // 'user' | 'assistant' | 'loading' | 'error'
  final String content;
  final bool isEmergency;
  final String? disclaimer;
  final DateTime timestamp;

  const ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.isEmergency = false,
    this.disclaimer,
    required this.timestamp,
  });

  ChatMessage copyWith({
    String? id,
    String? role,
    String? content,
    bool? isEmergency,
    String? disclaimer,
    DateTime? timestamp,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      role: role ?? this.role,
      content: content ?? this.content,
      isEmergency: isEmergency ?? this.isEmergency,
      disclaimer: disclaimer ?? this.disclaimer,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
