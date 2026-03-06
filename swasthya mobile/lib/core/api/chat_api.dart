import 'package:dio/dio.dart';
import '../models/chat_message.dart';

class ChatApi {
  ChatApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> sendMessage({
    required String message,
    required String language,
  }) async {
    final res = await _dio.post('/chat', data: {'message': message, 'language': language});
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>?)?['message'] as String? ?? 'Chat failed',
      );
    }
    return data['data'] as Map<String, dynamic>;
  }

  Future<List<ChatMessage>> getHistory({int limit = 40}) async {
    final res = await _dio.get('/chat/history', queryParameters: {'limit': limit});
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) return [];
    final messages = ((data['data'] as Map<String, dynamic>)['messages'] as List<dynamic>?) ?? [];
    return messages.map((m) {
      final map = m as Map<String, dynamic>;
      return ChatMessage(
        id: map['id'] as String? ?? DateTime.now().millisecondsSinceEpoch.toString(),
        role: map['role'] as String? ?? 'user',
        content: map['content'] as String? ?? '',
        timestamp: DateTime.tryParse(map['timestamp'] as String? ?? '') ?? DateTime.now(),
      );
    }).toList();
  }
}
