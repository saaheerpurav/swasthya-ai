import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';

const List<Map<String, String>> LANGUAGES = [
  {'code': 'en', 'label': 'English'},
  {'code': 'hi', 'label': 'हिन्दी'},
  {'code': 'kn', 'label': 'ಕನ್ನಡ'},
  {'code': 'te', 'label': 'తెలుగు'},
];

class LanguageSelectScreen extends ConsumerStatefulWidget {
  const LanguageSelectScreen({super.key});

  @override
  ConsumerState<LanguageSelectScreen> createState() => _LanguageSelectScreenState();
}

class _LanguageSelectScreenState extends ConsumerState<LanguageSelectScreen> {
  String? _selected;

  @override
  void initState() {
    super.initState();
    _selected = ref.read(preferredLanguageProvider);
  }

  @override
  Widget build(BuildContext context) {
    final lang = _selected ?? ref.watch(preferredLanguageProvider) ?? 'en';
    return Scaffold(
      appBar: AppBar(title: Text(t('select_language', lang))),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            ...LANGUAGES.map((l) {
              final code = l['code']!;
              final isSelected = _selected == code;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => setState(() => _selected = code),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: isSelected ? primaryGreen : textMuted,
                          width: isSelected ? 3 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Expanded(child: Text(l['label']!, style: const TextStyle(fontSize: 18))),
                          if (isSelected) Icon(Icons.check_circle, color: primaryGreen),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _selected == null
                    ? null
                    : () {
                        ref.read(preferredLanguageProvider.notifier).setLanguage(_selected!);
                        context.go('/onboarding/phone');
                      },
                child: Text(t('continue_btn', lang)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
