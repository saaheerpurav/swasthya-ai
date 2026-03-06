# Mobile App — Required Backend Integration Changes

All changes are to the Flutter app at `swasthya mobile/lib/`.
Nothing in this file has been applied yet — this is the implementation guide.

---

## 1. OTP Auth Flow (phone_input_screen → new OTP screen)

### Problem
`phone_input_screen.dart` calls `POST /v1/auth/session` directly, which creates a session without OTP verification. No phone verification happens.

### Backend endpoints (already implemented)
- `POST /v1/auth/otp/send` — body: `{ phoneNumber: "+91XXXXXXXXXX" }`
- `POST /v1/auth/otp/verify` — body: `{ phoneNumber, otp }` → returns `{ token, userId, isNew, expiresAt }`

### Changes needed

#### A. `lib/core/models/session.dart`
Make `sessionId` nullable (OTP verify response has no `sessionId`):
```dart
// CHANGE:
final String sessionId;        // required
// TO:
final String? sessionId;       // nullable

// In constructor: required this.sessionId  →  this.sessionId
// In fromJson:    json['sessionId'] as String  →  json['sessionId'] as String?
```

#### B. `lib/core/api/auth_api.dart`
Add two new methods:
```dart
Future<void> sendOtp(String phoneNumber) async {
  final res = await _dio.post('/auth/otp/send', data: {'phoneNumber': phoneNumber});
  final data = res.data as Map<String, dynamic>;
  if (data['ok'] != true) {
    throw DioException(
      requestOptions: res.requestOptions,
      response: res,
      message: (data['error'] as Map<String, dynamic>?)?['message'] as String? ?? 'Failed to send OTP',
    );
  }
}

Future<Session> verifyOtp(String phoneNumber, String otp) async {
  final res = await _dio.post('/auth/otp/verify', data: {'phoneNumber': phoneNumber, 'otp': otp});
  final data = res.data as Map<String, dynamic>;
  if (data['ok'] != true) {
    throw DioException(
      requestOptions: res.requestOptions,
      response: res,
      message: (data['error'] as Map<String, dynamic>?)?['message'] as String? ?? 'Invalid OTP',
    );
  }
  return Session.fromJson(data['data'] as Map<String, dynamic>);
}
```

#### C. `lib/features/onboarding/phone_input_screen.dart`
Change `_continue()` — instead of creating a session directly, send OTP then navigate to the OTP screen:
```dart
Future<void> _continue() async {
  final raw = _controller.text.trim().replaceAll(RegExp(r'\s'), '');
  if (!_phoneRegex.hasMatch(raw)) {
    setState(() => _error = 'Enter a valid 10-digit mobile number');
    return;
  }
  setState(() { _error = null; _loading = true; });
  try {
    final phone = '+91$raw';
    await AuthApi(ref.read(dioProvider)).sendOtp(phone);
    if (mounted) context.go('/onboarding/otp', extra: phone);
  } catch (e) {
    setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
  } finally {
    if (mounted) setState(() => _loading = false);
  }
}
```

Also update `_skip()` to sync language + mark onboarding complete after anonymous session:
```dart
Future<void> _skip() async {
  setState(() => _loading = true);
  try {
    final dio = ref.read(dioProvider);
    final session = await AuthApi(dio).createSession();
    await ref.read(authProvider.notifier).setToken(session.token);
    final lang = ref.read(preferredLanguageProvider);
    await UsersApi(dio).updateMe({'preferredLanguage': lang, 'onboardingComplete': true});
    if (mounted) context.go('/home');
  } catch (e) {
    setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
  } finally {
    if (mounted) setState(() => _loading = false);
  }
}
// Add import: import '../../core/api/users_api.dart';
```

#### D. NEW FILE: `lib/features/onboarding/otp_verify_screen.dart`
```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/dio_client.dart';
import '../../core/api/auth_api.dart';
import '../../core/api/users_api.dart';
import '../../core/providers/auth_provider.dart';
import '../../l10n/l10n_provider.dart';

class OtpVerifyScreen extends ConsumerStatefulWidget {
  const OtpVerifyScreen({super.key, required this.phoneNumber});
  final String phoneNumber;

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _resending = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final otp = _controller.text.trim();
    if (otp.length != 6) {
      setState(() => _error = 'Enter the 6-digit code');
      return;
    }
    setState(() { _error = null; _loading = true; });
    try {
      final dio = ref.read(dioProvider);
      final session = await AuthApi(dio).verifyOtp(widget.phoneNumber, otp);
      await ref.read(authProvider.notifier).setToken(session.token);
      final lang = ref.read(preferredLanguageProvider);
      await UsersApi(dio).updateMe({'preferredLanguage': lang, 'onboardingComplete': true});
      if (mounted) context.go('/home');
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    setState(() => _resending = true);
    try {
      await AuthApi(ref.read(dioProvider)).sendOtp(widget.phoneNumber);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('OTP resent')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Phone')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            Text('Enter the 6-digit code sent to ${widget.phoneNumber}',
                style: const TextStyle(fontSize: 15)),
            const SizedBox(height: 24),
            TextField(
              controller: _controller,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 28, letterSpacing: 8),
              decoration: InputDecoration(
                hintText: '------',
                errorText: _error,
              ),
              onSubmitted: (_) => _verify(),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _verify,
                child: _loading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Verify'),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: _resending ? null : _resend,
              child: _resending ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Resend code'),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### E. `lib/config/router.dart`
Add OTP route (after `/onboarding/phone`):
```dart
import '../features/onboarding/otp_verify_screen.dart';

// Add this GoRoute:
GoRoute(
  path: '/onboarding/otp',
  parentNavigatorKey: _rootNavigatorKey,
  builder: (context, state) => OtpVerifyScreen(
    phoneNumber: state.extra as String,
  ),
),
```

---

## 2. Chat — Use Backend Instead of OpenAI Directly

### Problem
`chat_screen.dart` uses `OpenAIClient` which calls `api.openai.com` directly.
- Chat history is **not saved** to DynamoDB — lost on app restart.
- Responses don't go through backend safety filters / Bedrock RAG.

### Backend endpoint (already implemented)
- `POST /v1/chat` — body: `{ message, language }` → returns `{ content, responseId, emergencyDetected, disclaimers, suggestedActions, ... }`
- `GET /v1/chat/history` — returns `{ messages: [{ id, role, content, timestamp }] }`

### Changes needed

#### A. NEW FILE: `lib/core/api/chat_api.dart`
```dart
import 'package:dio/dio.dart';
import '../models/chat_message.dart';

class ChatApi {
  ChatApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> sendMessage({
    required String message,
    required String language,
  }) async {
    final res = await _dio.post('/chat', data: {'message': message, 'language': language});
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>?)?['message'] as String? ?? 'Chat failed',
      );
    }
    return data['data'] as Map<String, dynamic>;
  }

  Future<List<ChatMessage>> getHistory({int limit = 40}) async {
    final res = await _dio.get('/chat/history', queryParameters: {'limit': limit});
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) return [];
    final messages = ((data['data'] as Map<String, dynamic>)['messages'] as List<dynamic>?) ?? [];
    return messages.map((m) {
      final map = m as Map<String, dynamic>;
      return ChatMessage(
        id: map['id'] as String? ?? DateTime.now().millisecondsSinceEpoch.toString(),
        role: map['role'] as String? ?? 'user',
        content: map['content'] as String? ?? '',
        timestamp: DateTime.tryParse(map['timestamp'] as String? ?? '') ?? DateTime.now(),
      );
    }).toList();
  }
}
```

#### B. `lib/core/providers/chat_provider.dart`
Add `chatApiProvider` and `loadHistory` method with deduplication guard:
```dart
import '../api/chat_api.dart';
// Add at top (alongside other providers):
final chatApiProvider = Provider<ChatApi>((ref) => ChatApi(ref.read(dioProvider)));

// Add to ChatNotifier:
bool _historyLoaded = false;

void loadHistory(List<ChatMessage> history) {
  if (_historyLoaded || history.isEmpty) return;
  _historyLoaded = true;
  state = [...history, ...state];
}

// Update clear():
void clear() {
  state = [];
  _historyLoaded = false;
}
```
Also add import for `dio_client.dart`.

#### C. `lib/features/chat/chat_screen.dart`
Replace `OpenAIClient` usage with backend chat API:

1. Remove `import '../../core/openai/openai_client.dart';` and `final _openAiClient = OpenAIClient();`
2. Add import: `import '../../core/providers/chat_provider.dart';` (already there, just chatApiProvider is now in it)
3. Add `initState` to load history:
```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) => _loadHistory());
}

Future<void> _loadHistory() async {
  try {
    final history = await ref.read(chatApiProvider).getHistory();
    ref.read(chatProvider.notifier).loadHistory(history);
    _scrollToBottom();
  } catch (_) {}
}
```
4. Replace `_sendMessage` body — remove `_openAiClient.healthChat(...)`, use:
```dart
final api = ref.read(chatApiProvider);
final result = await api.sendMessage(message: text.trim(), language: lang);
final content = result['content'] as String? ?? '';
final isEmergency = result['emergencyDetected'] as bool? ?? false;
final disclaimers = (result['disclaimers'] as List<dynamic>?)?.map((d) => d.toString()).join('\n') ?? '';
ref.read(chatProvider.notifier).replaceLastLoading(ChatMessage(
  id: result['responseId'] as String? ?? DateTime.now().millisecondsSinceEpoch.toString(),
  role: 'assistant',
  content: content,
  isEmergency: isEmergency,
  disclaimer: disclaimers.isNotEmpty ? disclaimers : null,
  timestamp: DateTime.now(),
));
```
Also remove `history` variable (backend handles context internally).

---

## 3. Symptom Checker — Use Backend Instead of OpenAI Directly

### Problem
`symptom_checker_screen.dart` uses `OpenAIClient.symptomAnalysis()` directly.

### Change needed in `lib/features/symptom_checker/symptom_checker_screen.dart`
Replace `_analyse()` with backend chat call:
```dart
// Remove: import '../../core/openai/openai_client.dart';
// Add:    import '../../core/api/chat_api.dart';
//         import '../../core/api/dio_client.dart';

Future<void> _analyse() async {
  if (!_canAnalyse || _loading) return;
  setState(() => _loading = true);
  final lang = ref.read(preferredLanguageProvider);
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
```

---

## 4. Quiz — Use Backend Instead of OpenAI Directly

### Problem
`quiz_screen.dart` uses `OpenAIClient.quizSummary()` directly.

### Change needed in `lib/features/education/quiz_screen.dart`
Replace `_submitAnswers()`:
```dart
// Remove: import '../../core/openai/openai_client.dart';
// Add:    import '../../core/api/chat_api.dart';
//         import '../../core/api/dio_client.dart';

Future<void> _submitAnswers() async {
  if (_answers.length != total) return;
  setState(() => _loading = true);
  final lang = ref.read(preferredLanguageProvider);
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
```

---

## 5. Onboarding State — Sync Language to Backend

### Problem
`preferredLanguage` is only stored in `SharedPreferences`, never synced to backend. `onboardingComplete` is never set to `true`.

### Already handled by changes in sections 1C and 1D above
- `_skip()` in phone_input_screen PUTs `{ preferredLanguage, onboardingComplete: true }` after session
- `_verify()` in otp_verify_screen PUTs `{ preferredLanguage, onboardingComplete: true }` after OTP verify

---

## Summary of Files to Create/Modify

| File | Action | Reason |
|------|--------|--------|
| `lib/core/models/session.dart` | Modify | Make `sessionId` nullable for OTP verify response |
| `lib/core/api/auth_api.dart` | Modify | Add `sendOtp()` and `verifyOtp()` methods |
| `lib/core/api/chat_api.dart` | **Create** | Backend chat API wrapper (POST /v1/chat, GET /v1/chat/history) |
| `lib/core/providers/chat_provider.dart` | Modify | Add `chatApiProvider`, `loadHistory()`, `_historyLoaded` flag |
| `lib/features/chat/chat_screen.dart` | Modify | Use backend chat, load history on open, remove OpenAI |
| `lib/features/onboarding/phone_input_screen.dart` | Modify | Send OTP instead of direct session; sync onboarding on skip |
| `lib/features/onboarding/otp_verify_screen.dart` | **Create** | 6-digit OTP input screen |
| `lib/config/router.dart` | Modify | Add `/onboarding/otp` route |
| `lib/features/symptom_checker/symptom_checker_screen.dart` | Modify | Use backend chat instead of OpenAI |
| `lib/features/education/quiz_screen.dart` | Modify | Use backend chat instead of OpenAI |

## Notes
- `openai_client.dart` can be kept as-is (or deleted later) — it just won't be called anymore
- `Env.openAiKey` and `Env.openAiModel` in `env.dart` can be removed once all screens are migrated
- The backend `/v1/chat` endpoint handles conversation context internally using DynamoDB history, so there's no need to pass `history[]` from the app
