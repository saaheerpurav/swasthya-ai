import 'package:flutter/material.dart';
import '../config/theme.dart';

class MicButton extends StatelessWidget {
  const MicButton({
    super.key,
    required this.onPressed,
    this.isRecording = false,
    this.size = 64,
  });

  final VoidCallback onPressed;
  final bool isRecording;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        if (isRecording) _PulseRing(size: size * 1.3),
        Material(
          color: isRecording ? emergencyRed : primaryGreen,
          shape: const CircleBorder(),
          elevation: 4,
          child: InkWell(
            onTap: onPressed,
            customBorder: const CircleBorder(),
            child: SizedBox(
              width: size,
              height: size,
              child: Icon(
                Icons.mic,
                color: Colors.white,
                size: size * 0.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _PulseRing extends StatefulWidget {
  const _PulseRing({required this.size});

  final double size;

  @override
  State<_PulseRing> createState() => _PulseRingState();
}

class _PulseRingState extends State<_PulseRing> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: emergencyRed.withOpacity(1 - _controller.value),
              width: 3,
            ),
          ),
        );
      },
    );
  }
}
