import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/api/chat_api.dart';
import '../../core/api/dio_client.dart';
import '../../core/constants/quiz_questions.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/disclaimer_banner.dart';

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key});

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  int _index = 0;
  final List<bool?> _answers = [];
  bool _loading = false;
  String? _result;

  int get total => QUIZ_QUESTIONS.length;

  Future<void> _submitAnswers() async {
    if (_answers.length != total) return;
    setState(() => _loading = true);
    final lang = ref.read(preferredLanguageProvider) ?? 'en';
    final summary = QUIZ_QUESTIONS.asMap().entries
        .map((e) => 'Q: ${e.value['en']} A: ${_answers[e.key] == true ? "Yes" : "No"}')
        .join('\n');
    final prompt = 'Based on my health quiz answers:\n$summary\nPlease give me a personalized health education summary and 3 actionable improvements.';
    try {
      final result = await ChatApi(ref.read(dioProvider)).sendMessage(
        message: prompt,
        language: lang,
      );
      setState(() { _result = result['content'] as String? ?? ''; _loading = false; });
    } catch (e) {
      setState(() { _result = 'Error: $e'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);

    if (_result != null) {
      return Scaffold(
        appBar: AppBar(title: Text(t('take_quiz', lang))),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(_result!, style: const TextStyle(fontSize: 15)),
              const SizedBox(height: 12),
              const DisclaimerBanner(),
              const SizedBox(height: 24),
              OutlinedButton(onPressed: () => setState(() { _result = null; _index = 0; _answers.clear(); }), child: Text(t('retake_quiz', lang))),
              const SizedBox(height: 8),
              OutlinedButton(onPressed: () => context.go('/education'), child: Text(t('back_to_education', lang))),
            ],
          ),
        ),
      );
    }

    if (_index >= total) {
      return Scaffold(
        body: Center(
          child: _loading
              ? const CircularProgressIndicator()
              : ElevatedButton(onPressed: _submitAnswers, child: const Text('See results')),
        ),
      );
    }

    final q = QUIZ_QUESTIONS[_index];
    final questionText = q['en']!;

    return Scaffold(
      appBar: AppBar(title: Text('Question ${_index + 1} of $total')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            LinearProgressIndicator(value: (_index + 1) / total),
            const SizedBox(height: 24),
            Text(questionText, style: Theme.of(context).textTheme.titleLarge),
            const Spacer(),
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  setState(() { _answers.add(true); _index++; });
                },
                child: const Text('Yes'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 56,
              child: OutlinedButton(
                onPressed: () {
                  setState(() { _answers.add(false); _index++; });
                },
                child: const Text('No'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
