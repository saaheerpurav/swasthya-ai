import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/api/chat_api.dart';
import '../../core/api/dio_client.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/disclaimer_banner.dart';
import '../../widgets/emergency_banner.dart';

const List<String> COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Cough', 'Sore Throat', 'Body Ache', 'Fatigue',
  'Nausea', 'Diarrhoea', 'Rash', 'Shortness of Breath', 'Chest Pain', 'Vomiting',
];

class SymptomCheckerScreen extends ConsumerStatefulWidget {
  const SymptomCheckerScreen({super.key});

  @override
  ConsumerState<SymptomCheckerScreen> createState() => _SymptomCheckerScreenState();
}

class _SymptomCheckerScreenState extends ConsumerState<SymptomCheckerScreen> {
  final Set<String> _selected = {};
  final _extraController = TextEditingController();
  bool _loading = false;
  String? _result;
  bool _isEmergency = false;

  @override
  void dispose() {
    _extraController.dispose();
    super.dispose();
  }

  bool get _canAnalyse => _selected.isNotEmpty || (_extraController.text.trim().isNotEmpty);

  Future<void> _analyse() async {
    if (!_canAnalyse || _loading) return;
    setState(() => _loading = true);
    final lang = ref.read(preferredLanguageProvider) ?? 'en';
    final parts = [..._selected];
    final extra = _extraController.text.trim();
    if (extra.isNotEmpty) parts.add(extra);
    final prompt = 'I have the following symptoms: ${parts.join(", ")}. What could this indicate and what should I do?';
    try {
      final result = await ChatApi(ref.read(dioProvider)).sendMessage(
        message: prompt,
        language: lang,
      );
      final response = result['content'] as String? ?? '';
      final isEmergency = result['emergencyDetected'] as bool? ?? false;
      setState(() { _result = response; _isEmergency = isEmergency; _loading = false; });
    } catch (e) {
      setState(() { _result = 'Error: ${e.toString()}'; _isEmergency = false; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t('symptom_checker', lang))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(t('common_symptoms', lang), style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: COMMON_SYMPTOMS.map((s) {
                final selected = _selected.contains(s);
                return FilterChip(
                  label: Text(s),
                  selected: selected,
                  onSelected: (_) => setState(() {
                    if (selected) _selected.remove(s); else _selected.add(s);
                  }),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _extraController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: "Describe any other symptoms you're experiencing...",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _canAnalyse && !_loading ? _analyse : null,
              child: _loading ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t('analyse_symptoms', lang)),
            ),
            if (_result != null) ...[
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_result!, style: const TextStyle(fontSize: 15)),
                      const SizedBox(height: 12),
                      const DisclaimerBanner(),
                      if (_isEmergency) const EmergencyBanner(visible: true),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.local_hospital),
                          label: Text(t('find_hospitals', lang)),
                          onPressed: () => context.go('/hospitals'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
