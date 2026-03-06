import 'package:dio/dio.dart';

class ImageApi {
  ImageApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> analyze({
    required String filePath,
    String language = 'en',
    String? description,
  }) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(filePath),
      'language': language,
      if (description != null && description.isNotEmpty) 'description': description,
    });
    final res = await _dio.post('/image/analyze', data: formData);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Image analysis failed',
      );
    }
    return data['data'] as Map<String, dynamic>;
  }
}
