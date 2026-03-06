import 'package:flutter/material.dart';
import '../l10n/strings.dart';

typedef AppLanguage = String;

const List<Map<String, String>> LANGUAGES = [
  {'code': 'en', 'label': 'English'},
  {'code': 'hi', 'label': 'हिन्दी'},
  {'code': 'kn', 'label': 'ಕನ್ನಡ'},
  {'code': 'te', 'label': 'తెలుగు'},
];

class LanguagePickerSheet extends StatelessWidget {
  const LanguagePickerSheet({
    super.key,
    required this.currentLanguage,
    required this.onSelected,
  });

  final AppLanguage currentLanguage;
  final ValueChanged<AppLanguage> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            t('select_language', currentLanguage),
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          ...LANGUAGES.map((lang) {
            final code = lang['code']!;
            final isSelected = code == currentLanguage;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
              child: ListTile(
                title: Text(lang['label']!),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: isSelected ? Theme.of(context).colorScheme.primary : Colors.transparent,
                    width: 2,
                  ),
                ),
                trailing: isSelected ? const Icon(Icons.check_circle) : null,
                onTap: () {
                  onSelected(code);
                  Navigator.of(context).pop();
                },
              ),
            );
          }),
        ],
      ),
    );
  }
}
