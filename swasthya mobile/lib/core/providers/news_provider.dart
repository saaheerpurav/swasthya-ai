import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/dio_client.dart';
import '../api/news_api.dart';
import '../models/news_article.dart';
import '../../l10n/l10n_provider.dart';

final newsApiProvider = Provider<NewsApi>((ref) => NewsApi(ref.read(dioProvider)));

final newsProvider = FutureProvider<List<NewsArticle>>((ref) async {
  final lang = ref.watch(preferredLanguageProvider);
  return ref.read(newsApiProvider).getNews(language: lang, limit: 10);
});

final latestNewsProvider = FutureProvider<NewsArticle?>((ref) async {
  final lang = ref.watch(preferredLanguageProvider);
  final list = await ref.read(newsApiProvider).getNews(language: lang, limit: 1);
  return list.isNotEmpty ? list.first : null;
});
