import 'package:dio/dio.dart';
import '../../config/env.dart';

bool isEmergencyResponse(String response) {
  final upper = response.toUpperCase();
  return upper.contains('EMERGENCY:') || upper.contains('CALL 108');
}

class OpenAIClient {
  static const _endpoint = 'https://api.openai.com/v1/chat/completions';

  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.openai.com',
    headers: {
      'Authorization': 'Bearer ${Env.openAiKey}',
      'Content-Type': 'application/json',
    },
  ));

  Future<String> healthChat({
    required String userMessage,
    required String language,
    List<Map<String, String>> history = const [],
  }) async {
    if (Env.openAiKey.isEmpty) {
      throw Exception(
        'OpenAI API key not set. Run the app with --dart-define=OPENAI_API_KEY=sk-... or add it in run.ps1 -OpenAiKey',
      );
    }
    final messages = <Map<String, String>>[
      {'role': 'system', 'content': _systemPrompt(language)},
      ...history,
      {'role': 'user', 'content': userMessage},
    ];

    final res = await _dio.post('/v1/chat/completions', data: {
      'model': Env.openAiModel,
      'messages': messages,
      'max_tokens': 600,
      'temperature': 0.2,
    });

    final content = res.data['choices']?[0]?['message']?['content'];
    if (content == null) throw Exception('Invalid OpenAI response');
    return content as String;
  }

  Future<String> symptomAnalysis({
    required String symptomsPrompt,
    required String language,
  }) async {
    final system = '''
You are SwasthyaAI, a public health education assistant for rural India.
The user reports these symptoms: $symptomsPrompt
Provide educational information about what conditions these symptoms may be associated with.
Emphasize the need to see a doctor. Flag if any symptom is an emergency.
If emergency symptoms (chest pain, difficulty breathing, loss of consciousness, severe bleeding, stroke signs), say:
"EMERGENCY: Please call 108 or go to the nearest hospital immediately."
Respond in $language.
Always end with: "⚠️ This is health education only — not a substitute for professional medical advice."
Keep responses under 200 words.
''';
    final res = await _dio.post('/v1/chat/completions', data: {
      'model': Env.openAiModel,
      'messages': [
        {'role': 'system', 'content': system},
        {'role': 'user', 'content': 'Analyse these symptoms and advise.'},
      ],
      'max_tokens': 600,
      'temperature': 0.2,
    });
    final content = res.data['choices']?[0]?['message']?['content'];
    if (content == null) throw Exception('Invalid OpenAI response');
    return content as String;
  }

  Future<String> quizSummary({
    required String answersSummary,
    required String language,
  }) async {
    final system = '''
You are SwasthyaAI. Based on these health assessment answers: $answersSummary
Provide a brief personalized health education summary and suggest 3 actionable improvements.
Be encouraging, not alarmist. Respond in $language.
End with the standard disclaimer about professional medical advice.
''';
    final res = await _dio.post('/v1/chat/completions', data: {
      'model': Env.openAiModel,
      'messages': [
        {'role': 'system', 'content': system},
        {'role': 'user', 'content': 'Summarise and suggest improvements.'},
      ],
      'max_tokens': 500,
      'temperature': 0.3,
    });
    final content = res.data['choices']?[0]?['message']?['content'];
    if (content == null) throw Exception('Invalid OpenAI response');
    return content as String;
  }

  String _systemPrompt(String language) => '''
You are SwasthyaAI, a public health education assistant for rural India.
Respond in $language.
Rules:
- Provide ONLY preventive healthcare education and general health information.
- NEVER diagnose any condition.
- NEVER prescribe medications.
- If asked for a diagnosis, say you cannot provide one and recommend seeing a doctor.
- If emergency symptoms are described (chest pain, difficulty breathing, loss of consciousness,
  severe bleeding, signs of stroke), immediately say:
  "EMERGENCY: Please call 108 or go to the nearest hospital immediately." and nothing else.
- Always end your response with: "⚠️ This is health education only — not a substitute for
  professional medical advice. Please consult a qualified doctor for personal health concerns."
- Keep responses concise (under 200 words) and use simple language.
- Source information from WHO and MoHFW guidelines only.
''';
}
