import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../config/theme.dart';
import '../../core/constants/education_topics.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';

class TopicDetailScreen extends ConsumerWidget {
  const TopicDetailScreen({super.key, required this.topicId});

  final String topicId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(preferredLanguageProvider);
    EducationTopic? topic;
    try {
      topic = EDUCATION_TOPICS.firstWhere((t) => t.id == topicId);
    } catch (_) {
      topic = null;
    }
    final Map<String, String> contentMap = lang == 'hi'
        ? EDUCATION_CONTENT_HI
        : lang == 'kn'
            ? EDUCATION_CONTENT_KN
            : lang == 'te'
                ? EDUCATION_CONTENT_TE
                : EDUCATION_CONTENT_EN;
    final content = contentMap[topicId] ?? EDUCATION_CONTENT_EN[topicId] ?? '# Topic\nContent not found.';

    if (topic == null) {
      return Scaffold(appBar: AppBar(title: const Text('Topic')), body: const Center(child: Text('Not found')));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(t(topic.titleKey, lang)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            MarkdownBody(data: content),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.chat_bubble_outline),
                label: const Text('Ask AI about this topic'),
                onPressed: () {
                  context.go('/chat');
                  // Pre-fill could be done via a provider or query param
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
