import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/theme.dart';
import '../core/models/alert.dart';

class AlertCard extends StatelessWidget {
  const AlertCard({super.key, required this.alert});

  final Alert alert;

  static Color _severityColor(String severity) {
    switch (severity) {
      case 'critical':
        return emergencyRed;
      case 'high':
        return warningOrange;
      case 'medium':
        return warningYellow;
      case 'low':
        return accentBlue;
      default:
        return textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final borderColor = _severityColor(alert.severity);
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: borderColor, width: 3),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(color: borderColor, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Text(
                  alert.type.toUpperCase(),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: borderColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              alert.title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              alert.message,
              style: TextStyle(color: textSecondary, fontSize: 14),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            if (alert.sourceUrl != null) ...[
              const SizedBox(height: 8),
              InkWell(
                onTap: () => launchUrl(Uri.parse(alert.sourceUrl!)),
                child: Text(
                  'Read more',
                  style: TextStyle(color: accentBlue, fontSize: 13),
                ),
              ),
            ],
            const SizedBox(height: 6),
            Text(
              'Expires: ${alert.expiresAt.day}/${alert.expiresAt.month}/${alert.expiresAt.year}',
              style: TextStyle(fontSize: 11, color: textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
