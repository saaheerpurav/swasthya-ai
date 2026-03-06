import 'package:flutter/material.dart';
import '../config/theme.dart';

class EmergencyBanner extends StatelessWidget {
  const EmergencyBanner({super.key, required this.visible});

  final bool visible;

  @override
  Widget build(BuildContext context) {
    if (!visible) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: emergencyRed,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        '🚨 EMERGENCY: Call 108 immediately.',
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }
}
