import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _preferredLanguageKey = 'preferred_language';

typedef AppLanguage = String; // 'en' | 'hi' | 'kn' | 'te'

final preferredLanguageProvider =
    StateNotifierProvider<PreferredLanguageNotifier, AppLanguage>((ref) {
  return PreferredLanguageNotifier();
});

class PreferredLanguageNotifier extends StateNotifier<AppLanguage> {
  PreferredLanguageNotifier() : super('en') {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getString(_preferredLanguageKey) ?? 'en';
  }

  Future<void> setLanguage(AppLanguage lang) async {
    state = lang;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_preferredLanguageKey, lang);
  }
}
