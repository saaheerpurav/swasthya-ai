class NewsArticle {
  final String articleId;
  final String title;
  final String? summary;
  final String url;
  final String source;
  final DateTime publishedAt;

  const NewsArticle({
    required this.articleId,
    required this.title,
    this.summary,
    required this.url,
    required this.source,
    required this.publishedAt,
  });

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    return NewsArticle(
      articleId: json['articleId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      summary: json['summary'] as String?,
      url: json['url'] as String? ?? '',
      source: json['source'] as String? ?? '',
      publishedAt: json['publishedAt'] != null
          ? DateTime.parse(json['publishedAt'] as String)
          : DateTime.now(),
    );
  }
}
