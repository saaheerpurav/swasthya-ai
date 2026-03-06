import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/constants/education_topics.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/web_safe_network_image.dart';

class EducationScreen extends ConsumerWidget {
  const EducationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(preferredLanguageProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(t('health_education', lang)),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.95,
            children: EDUCATION_TOPICS.map((topic) => _EducationTopicCard(topic: topic, lang: lang ?? 'en')).toList(),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: primaryGreen,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.quiz_rounded),
              label: Text(t('take_quiz', lang)),
              onPressed: () => context.push('/education/quiz'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

/// Topic card with background image, gradient overlay, icon and title (same style as home cards).
class _EducationTopicCard extends StatelessWidget {
  const _EducationTopicCard({required this.topic, required this.lang});

  final EducationTopic topic;
  final String lang;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push('/education/${topic.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: primaryGreen.withOpacity(0.25),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              fit: StackFit.expand,
              children: [
                buildWebSafeNetworkImage(
                  imageUrl: topic.imageUrl,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    color: primaryGreen.withOpacity(0.15),
                    child: Center(child: Icon(topic.icon, color: primaryGreen.withOpacity(0.6), size: 44)),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    color: primaryGreen.withOpacity(0.2),
                    child: Center(child: Icon(topic.icon, color: primaryGreen, size: 44)),
                  ),
                  httpHeaders: const {'User-Agent': 'SwasthyaAI-HealthApp/1.0'},
                ),
                DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.4),
                        primaryGreen.withOpacity(0.88),
                      ],
                      stops: const [0.0, 0.35, 1.0],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.25),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(topic.icon, color: Colors.white, size: 22),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        t(topic.titleKey, lang),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          shadows: [Shadow(color: Colors.black26, blurRadius: 2, offset: Offset(0, 1))],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
