import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:just_audio/just_audio.dart';
import '../../config/theme.dart';
import '../../core/models/chat_message.dart';
import '../../core/providers/chat_provider.dart';
import '../../core/api/dio_client.dart';
import '../../core/api/voice_api.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/chat_bubble.dart';
import '../../widgets/language_picker_sheet.dart';
import '../../widgets/mic_button.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  final _audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadHistory());
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    try {
      final history = await ref.read(chatApiProvider).getHistory();
      ref.read(chatProvider.notifier).loadHistory(history);
      _scrollToBottom();
    } catch (_) {}
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    final lang = ref.read(preferredLanguageProvider) ?? 'en';
    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      role: 'user',
      content: text.trim(),
      timestamp: DateTime.now(),
    );
    ref.read(chatProvider.notifier).addMessage(userMsg);
    _textController.clear();

    ref.read(chatProvider.notifier).addMessage(ChatMessage(
      id: 'loading',
      role: 'loading',
      content: '',
      timestamp: DateTime.now(),
    ));
    _scrollToBottom();

    try {
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
    } catch (e) {
      String message = 'Something went wrong.';
      if (e is DioException) {
        if (e.response?.statusCode == 401) {
          message = 'Sign in to use chat (backend).';
        } else {
          message = e.response?.statusMessage ?? e.message ?? e.toString();
        }
      } else {
        message = e.toString().replaceFirst('Exception: ', '');
      }
      ref.read(chatProvider.notifier).replaceLastLoading(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        role: 'error',
        content: message,
        timestamp: DateTime.now(),
      ));
    }
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(0, duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _onSpeak(ChatMessage msg) async {
    final lang = ref.read(preferredLanguageProvider) ?? 'en';
    try {
      final api = VoiceApi(ref.read(dioProvider));
      final url = await api.synthesize(text: msg.content, language: lang);
      if (url.isNotEmpty) {
        await _audioPlayer.stop();
        await _audioPlayer.setUrl(url);
        await _audioPlayer.play();
      }
    } on DioException catch (e) {
      if (!mounted) return;
      if (e.response?.statusCode == 401) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sign in to use voice playback.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not play audio')));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not play audio')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);
    final messages = ref.watch(chatProvider);

    return Scaffold(
      backgroundColor: backgroundWhite,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              margin: const EdgeInsets.only(right: 10),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.chat_bubble_rounded, size: 22),
            ),
            Text(t('chatbot', lang)),
          ],
        ),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.language_rounded),
            onPressed: () => showModalBottomSheet(
              context: context,
              builder: (_) => LanguagePickerSheet(
                currentLanguage: lang,
                onSelected: (l) => ref.read(preferredLanguageProvider.notifier).setLanguage(l),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    primaryGreen.withOpacity(0.04),
                    backgroundWhite,
                  ],
                  stops: const [0.0, 0.15],
                ),
              ),
              child: messages.isEmpty
                  ? _EmptyChatState(
                      hint: t('ask_question', lang),
                      onSuggestionTap: _sendMessage,
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      reverse: true,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                      itemCount: messages.length,
                      itemBuilder: (_, i) {
                        final msg = messages[messages.length - 1 - i];
                        return ChatBubble(
                          message: msg,
                          onSpeakPressed: msg.role == 'assistant' ? () => _onSpeak(msg) : null,
                        );
                      },
                    ),
            ),
          ),
          _ChatInputBar(
            controller: _textController,
            hint: t('ask_question', lang),
            onSend: () => _sendMessage(_textController.text),
            onVoice: () => context.push('/chat/voice'),
          ),
        ],
      ),
    );
  }
}

/// Empty state: friendly prompt and suggestion chips.
class _EmptyChatState extends StatelessWidget {
  const _EmptyChatState({required this.hint, required this.onSuggestionTap});

  final String hint;
  final void Function(String text) onSuggestionTap;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: primaryGreen.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.health_and_safety_rounded, size: 64, color: primaryGreen.withOpacity(0.7)),
            ),
            const SizedBox(height: 24),
            Text(
              'Your health assistant',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: primaryGreen,
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Ask anything about preventive care, symptoms, or wellness. I\'ll respond in your language.',
              textAlign: TextAlign.center,
              style: TextStyle(color: textSecondary, fontSize: 14, height: 1.4),
            ),
            const SizedBox(height: 20),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              runSpacing: 8,
              children: [
                _SuggestionChip(label: 'Tips for a healthy diet', onTap: () => onSuggestionTap('Tips for a healthy diet')),
                _SuggestionChip(label: 'When to see a doctor?', onTap: () => onSuggestionTap('When should I see a doctor?')),
                _SuggestionChip(label: 'Importance of vaccination', onTap: () => onSuggestionTap('Why is vaccination important?')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  const _SuggestionChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: cardWhite,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: primaryGreen.withOpacity(0.3)),
            boxShadow: [BoxShadow(color: primaryGreen.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Text(label, style: TextStyle(color: primaryGreen, fontSize: 13, fontWeight: FontWeight.w500)),
        ),
      ),
    );
  }
}

/// Input bar: card-style container with text field, mic, and send.
class _ChatInputBar extends StatelessWidget {
  const _ChatInputBar({
    required this.controller,
    required this.hint,
    required this.onSend,
    required this.onVoice,
  });

  final TextEditingController controller;
  final String hint;
  final VoidCallback onSend;
  final VoidCallback onVoice;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 16),
      decoration: BoxDecoration(
        color: cardWhite,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, -2))],
      ),
      child: SafeArea(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: hint,
                  filled: true,
                  fillColor: backgroundWhite,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: const BorderSide(color: primaryGreen, width: 1.5),
                  ),
                ),
                onSubmitted: (_) => onSend(),
                maxLines: 4,
                minLines: 1,
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: primaryGreen.withOpacity(0.12),
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                onTap: onVoice,
                borderRadius: BorderRadius.circular(24),
                child: const Padding(
                  padding: EdgeInsets.all(12),
                  child: Icon(Icons.mic_rounded, color: primaryGreen, size: 26),
                ),
              ),
            ),
            const SizedBox(width: 6),
            Material(
              color: primaryGreen,
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                onTap: onSend,
                borderRadius: BorderRadius.circular(24),
                child: const Padding(
                  padding: EdgeInsets.all(12),
                  child: Icon(Icons.send_rounded, color: Colors.white, size: 22),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
