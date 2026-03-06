import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import '../../config/theme.dart';
import '../../core/openai/openai_client.dart';
import '../../core/api/dio_client.dart';
import '../../core/api/voice_api.dart';
import '../../core/providers/chat_provider.dart';
import '../../core/models/chat_message.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/mic_button.dart';
import '../../core/openai/openai_client.dart' as openai;

enum VoiceState { idle, recording, transcribing, thinking, result, error }

class VoiceInputScreen extends ConsumerStatefulWidget {
  const VoiceInputScreen({super.key});

  @override
  ConsumerState<VoiceInputScreen> createState() => _VoiceInputScreenState();
}

class _VoiceInputScreenState extends ConsumerState<VoiceInputScreen> {
  VoiceState _state = VoiceState.idle;
  String _transcript = '';
  String _response = '';
  String _error = '';
  final _recorder = AudioRecorder();
  final _openAiClient = OpenAIClient();

  Future<void> _startRecording() async {
    final perm = await _recorder.hasPermission();
    if (!perm) {
      setState(() { _state = VoiceState.error; _error = 'Microphone permission denied'; });
      return;
    }
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(const RecordConfig(encoder: AudioEncoder.aacLc, sampleRate: 44100), path: path);
    setState(() => _state = VoiceState.recording);
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    if (path == null) {
      setState(() { _state = VoiceState.error; _error = 'Recording failed'; });
      return;
    }
    setState(() => _state = VoiceState.transcribing);
    try {
      final api = VoiceApi(ref.read(dioProvider));
      final result = await api.transcribe(filePath: path);
      final transcript = result['transcript'] as String? ?? '';
      final detectedLang = result['detectedLanguage'] as String? ?? 'en';
      if (transcript.isEmpty) {
        setState(() { _state = VoiceState.error; _error = 'Could not transcribe. Try again.'; });
        return;
      }
      setState(() { _transcript = transcript; _state = VoiceState.thinking; });
      final response = await _openAiClient.healthChat(userMessage: transcript, language: detectedLang);
      setState(() { _response = response; _state = VoiceState.result; });
      // Optionally call synthesize and play
    } catch (e) {
      setState(() { _state = VoiceState.error; _error = e.toString(); });
    }
  }

  void _addToChatAndPop() {
    if (_transcript.isNotEmpty && _response.isNotEmpty) {
      ref.read(chatProvider.notifier).addMessage(ChatMessage(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            role: 'user',
            content: _transcript,
            timestamp: DateTime.now(),
          ));
      ref.read(chatProvider.notifier).addMessage(ChatMessage(
            id: '${DateTime.now().millisecondsSinceEpoch}a',
            role: 'assistant',
            content: _response,
            isEmergency: openai.isEmergencyResponse(_response),
            timestamp: DateTime.now(),
          ));
    }
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t('talk_to_ai', lang))),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _buildBody(lang),
        ),
      ),
    );
  }

  Widget _buildBody(String lang) {
    switch (_state) {
      case VoiceState.idle:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            MicButton(onPressed: _startRecording, isRecording: false, size: 80),
            const SizedBox(height: 16),
            Text(t('tap_to_speak', lang), style: TextStyle(color: textSecondary)),
          ],
        );
      case VoiceState.recording:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            MicButton(onPressed: _stopRecording, isRecording: true, size: 80),
            const SizedBox(height: 16),
            Text(t('listening', lang), style: TextStyle(color: emergencyRed, fontWeight: FontWeight.w600)),
            const SizedBox(height: 24),
            TextButton(onPressed: _stopRecording, child: const Text('Stop')),
          ],
        );
      case VoiceState.transcribing:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(t('transcribing', lang)),
          ],
        );
      case VoiceState.thinking:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(t('thinking', lang)),
          ],
        );
      case VoiceState.result:
        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(_transcript, style: TextStyle(fontStyle: FontStyle.italic, color: textSecondary)),
              const SizedBox(height: 16),
              Text(_response, style: const TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _startRecording, child: Text(t('speak_again', lang))),
              const SizedBox(height: 8),
              OutlinedButton(onPressed: _addToChatAndPop, child: Text(t('back_to_chat', lang))),
            ],
          ),
        );
      case VoiceState.error:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error, textAlign: TextAlign.center, style: TextStyle(color: emergencyRed)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: () => setState(() => _state = VoiceState.idle), child: Text(t('try_again', lang))),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: context.pop, child: Text(t('back_to_chat', lang))),
          ],
        );
    }
  }
}
