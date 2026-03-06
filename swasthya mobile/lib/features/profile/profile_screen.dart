import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/user_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/language_picker_sheet.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _deleting = false;

  Future<void> _deleteAccount() async {
    final lang = ref.read(preferredLanguageProvider);
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t('delete_my_data', lang)),
        content: Text(t('confirm_delete', lang)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(t('cancel', lang))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text(t('confirm', lang), style: const TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _deleting = true);
    try {
      await ref.read(usersApiProvider).deleteMe();
      await ref.read(authProvider.notifier).clearToken();
      if (mounted) context.go('/onboarding/welcome');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);
    final userAsync = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t('profile', lang))),
      body: userAsync.when(
        data: (user) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Account', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ListTile(title: const Text('User ID'), subtitle: Text(user.userId.length > 12 ? '${user.userId.substring(0, 12)}...' : user.userId)),
            ListTile(
              title: Text(user.phoneNumber ?? t('anonymous', lang)),
              trailing: user.phoneNumber == null ? TextButton(onPressed: () {}, child: Text(t('link_phone', lang))) : null,
            ),
            ListTile(
              title: Text(t('select_language', lang)),
              subtitle: Text(user.preferredLanguage),
              onTap: () => showModalBottomSheet(
                context: context,
                builder: (_) => LanguagePickerSheet(
                  currentLanguage: user.preferredLanguage,
                  onSelected: (l) async {
                    await ref.read(usersApiProvider).updateMe({'preferredLanguage': l});
                    ref.invalidate(currentUserProvider);
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Location', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ListTile(
              title: Text(t('region', lang)),
              subtitle: Text(user.location?.regionCode ?? '-'),
              onTap: () {},
            ),
            const SizedBox(height: 16),
            const Text('Privacy', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            SwitchListTile(
              title: Text(t('share_location', lang)),
              value: user.privacySettings.shareLocation,
              onChanged: (v) async {
                await ref.read(usersApiProvider).updateMe({'privacySettings': {'shareLocation': v, 'allowAlerts': user.privacySettings.allowAlerts}});
                ref.invalidate(currentUserProvider);
              },
            ),
            SwitchListTile(
              title: Text(t('allow_alerts', lang)),
              value: user.privacySettings.allowAlerts,
              onChanged: (v) async {
                await ref.read(usersApiProvider).updateMe({'privacySettings': {'shareLocation': user.privacySettings.shareLocation, 'allowAlerts': v}});
                ref.invalidate(currentUserProvider);
              },
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: _deleting ? null : _deleteAccount,
              style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
              child: _deleting ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t('delete_my_data', lang)),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
      ),
    );
  }
}
