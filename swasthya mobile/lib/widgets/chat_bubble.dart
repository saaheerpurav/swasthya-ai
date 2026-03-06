import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../core/models/chat_message.dart';
import 'disclaimer_banner.dart';
import 'emergency_banner.dart';

class ChatBubble extends StatelessWidget {
  const ChatBubble({
    super.key,
    required this.message,
    this.onSpeakPressed,
  });

  final ChatMessage message;
  final VoidCallback? onSpeakPressed;

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == 'user';
    final isAssistant = message.role == 'assistant';
    final isLoading = message.role == 'loading';
    final isError = message.role == 'error';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.85),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Column(
            crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (isAssistant) _avatar(),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isUser ? primaryGreen : cardWhite,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(18),
                          topRight: const Radius.circular(18),
                          bottomLeft: Radius.circular(isUser ? 18 : 6),
                          bottomRight: Radius.circular(isUser ? 6 : 18),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: (isUser ? primaryGreen : Colors.black).withOpacity(isUser ? 0.25 : 0.08),
                            blurRadius: isUser ? 8 : 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: isLoading
                          ? const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  _Dot(),
                                  SizedBox(width: 6),
                                  _Dot(),
                                  SizedBox(width: 6),
                                  _Dot(),
                                ],
                              ),
                            )
                          : Text(
                              message.content,
                              style: TextStyle(
                                color: isUser ? Colors.white : textPrimary,
                                fontSize: 15,
                              ),
                            ),
                    ),
                  ),
                  if (isUser) const SizedBox(width: 8),
                ],
              ),
              if (isAssistant && !isLoading && !isError) ...[
                const DisclaimerBanner(),
                if (message.isEmergency) const EmergencyBanner(visible: true),
                if (onSpeakPressed != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Material(
                      color: primaryGreen.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      child: InkWell(
                        onTap: onSpeakPressed,
                        borderRadius: BorderRadius.circular(20),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.volume_up_rounded, size: 18, color: primaryGreen),
                              const SizedBox(width: 6),
                              Text('Speak', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: primaryGreen)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
              if (isError)
                Text(
                  message.content,
                  style: TextStyle(color: emergencyRed, fontSize: 13),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _avatar() {
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: primaryGreen.withOpacity(0.1),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: primaryGreen.withOpacity(0.15),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const CircleAvatar(
        radius: 18,
        backgroundColor: primaryGreenLight,
        child: Icon(Icons.health_and_safety_rounded, color: Colors.white, size: 22),
      ),
    );
  }
}

class _Dot extends StatefulWidget {
  const _Dot();

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Container(
        width: 8,
        height: 8,
        decoration: const BoxDecoration(
          color: textMuted,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
