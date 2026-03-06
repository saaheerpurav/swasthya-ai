import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _sessionTokenKey = 'session_token';

final authProvider = AsyncNotifierProvider<AuthNotifier, String?>(() => AuthNotifier());

class AuthNotifier extends AsyncNotifier<String?> {
  static const _storage = FlutterSecureStorage();

  @override
  Future<String?> build() async {
    return _storage.read(key: _sessionTokenKey);
  }

  Future<void> setToken(String token) async {
    await _storage.write(key: _sessionTokenKey, value: token);
    state = AsyncData(token);
  }

  Future<void> clearToken() async {
    await _storage.delete(key: _sessionTokenKey);
    state = const AsyncData(null);
  }
}
