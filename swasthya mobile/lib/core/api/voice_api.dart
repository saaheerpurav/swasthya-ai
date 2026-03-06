import 'package:dio/dio.dart';

class VoiceApi {
  VoiceApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> transcribe({
    required String filePath,
    String? language,
  }) async {
    final formData = FormData.fromMap({
      'audio': await MultipartFile.fromFile(filePath),
      if (language != null) 'language': language,
    });
    final res = await _dio.post('/voice/transcribe', data: formData);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Transcription failed',
      );
    }
    return data['data'] as Map<String, dynamic>;
  }

  Future<String> synthesize({required String text, required String language}) async {
    final res = await _dio.post('/voice/synthesize', data: {
      'text': text,
      'language': language,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Synthesis failed',
      );
    }
    final inner = data['data'] as Map<String, dynamic>;
    return inner['audioUrl'] as String? ?? '';
  }
}
