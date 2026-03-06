import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../core/api/dio_client.dart';
import '../../core/api/auth_api.dart';
import '../../core/providers/auth_provider.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';

final _phoneRegex = RegExp(r'^[6-9]\d{9}$');

class PhoneInputScreen extends ConsumerStatefulWidget {
  const PhoneInputScreen({super.key});

  @override
  ConsumerState<PhoneInputScreen> createState() => _PhoneInputScreenState();
}

class _PhoneInputScreenState extends ConsumerState<PhoneInputScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

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

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);
    return Scaffold(
      appBar: AppBar(title: Text(t('profile', lang))),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            TextField(
              controller: _controller,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              decoration: InputDecoration(
                labelText: 'Mobile number',
                hintText: '9876543210',
                prefixText: '+91 ',
                errorText: _error,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _continue,
                child: _loading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t('continue_btn', lang)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
