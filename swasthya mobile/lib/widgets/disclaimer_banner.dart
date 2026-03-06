import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../l10n/strings.dart';

class DisclaimerBanner extends StatelessWidget {
  const DisclaimerBanner({super.key, this.text});

  final String? text;

  @override
  Widget build(BuildContext context) {
    // Language not available in widget; parent can pass translated text or we use default key.
    final displayText = text ?? 'Health education only — not a substitute for professional medical advice.';
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: textMuted.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, size: 18, color: textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              displayText,
              style: TextStyle(fontSize: 12, color: textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
