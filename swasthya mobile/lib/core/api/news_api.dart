import 'package:dio/dio.dart';
import '../models/news_article.dart';

class NewsApi {
  NewsApi(this._dio);

  final Dio _dio;

  Future<List<NewsArticle>> getNews({String language = 'en', int limit = 10, int page = 1}) async {
    final res = await _dio.get('/news', queryParameters: {
      'language': language,
      'limit': limit,
      'page': page,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to get news',
      );
    }
    final list = (data['data'] as Map<String, dynamic>)['articles'] as List<dynamic>? ?? [];
    return list.map((e) => NewsArticle.fromJson(e as Map<String, dynamic>)).toList();
  }
}
