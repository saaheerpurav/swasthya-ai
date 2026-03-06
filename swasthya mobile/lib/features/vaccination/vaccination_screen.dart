import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/providers/vaccination_provider.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/vaccination_card.dart';
import '../../widgets/web_safe_network_image.dart';

const _kSetupHeaderImage = 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800&h=320&fit=crop';

class VaccinationScreen extends ConsumerStatefulWidget {
  const VaccinationScreen({super.key});

  @override
  ConsumerState<VaccinationScreen> createState() => _VaccinationScreenState();
}

class _VaccinationScreenState extends ConsumerState<VaccinationScreen> {
  final _dobController = TextEditingController();
  String? _gender;
  bool _submitting = false;

  @override
  void dispose() {
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _submitProfile() async {
    if (_dobController.text.trim().isEmpty || _gender == null) return;
    setState(() => _submitting = true);
    try {
      await ref.read(vaccinationApiProvider).createOrUpdateProfile({
        'dateOfBirth': _dobController.text.trim(),
        'gender': _gender!,
      });
      ref.invalidate(vaccinationProfileProvider);
      if (mounted) setState(() => _submitting = false);
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);
    final profileAsync = ref.watch(vaccinationProfileProvider);

    return Scaffold(
      backgroundColor: backgroundWhite,
      appBar: AppBar(
        title: Text(t('vaccination', lang)),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: profileAsync.when(
        data: (profile) {
          if (profile == null) {
            return _SetupProfileView(
              lang: lang ?? 'en',
              dobController: _dobController,
              gender: _gender,
              onGenderChanged: (v) => setState(() => _gender = v),
              submitting: _submitting,
              onSubmit: _submitProfile,
              continueLabel: t('continue_btn', lang),
            );
          }
          return _ProfileView(profile: profile, lang: lang ?? 'en', onRefresh: () async => ref.invalidate(vaccinationProfileProvider));
        },
        loading: () => const Center(child: CircularProgressIndicator(color: primaryGreen)),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline_rounded, size: 48, color: emergencyRed),
                const SizedBox(height: 16),
                Text(e.toString(), textAlign: TextAlign.center, style: const TextStyle(color: textSecondary)),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: profileAsync.valueOrNull != null
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/vaccination/add'),
              backgroundColor: primaryGreen,
              icon: const Icon(Icons.add_rounded),
              label: Text(t('add_record', lang ?? 'en')),
            )
          : null,
    );
  }
}

/// Setup state: header image + gradient, then form in a card.
class _SetupProfileView extends StatelessWidget {
  const _SetupProfileView({
    required this.lang,
    required this.dobController,
    required this.gender,
    required this.onGenderChanged,
    required this.submitting,
    required this.onSubmit,
    required this.continueLabel,
  });

  final String lang;
  final TextEditingController dobController;
  final String? gender;
  final ValueChanged<String?> onGenderChanged;
  final bool submitting;
  final VoidCallback onSubmit;
  final String continueLabel;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header with image + gradient
          SizedBox(
            height: 200,
            child: Stack(
              fit: StackFit.expand,
              children: [
                buildWebSafeNetworkImage(
                  imageUrl: _kSetupHeaderImage,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: primaryGreen.withOpacity(0.2), child: const Center(child: Icon(Icons.vaccines_rounded, size: 56, color: primaryGreen))),
                  errorWidget: (_, __, ___) => Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [primaryGreen, primaryGreenLight], begin: Alignment.topLeft, end: Alignment.bottomRight),
                    ),
                    child: const Center(child: Icon(Icons.vaccines_rounded, size: 56, color: Colors.white)),
                  ),
                  httpHeaders: const {'User-Agent': 'SwasthyaAI-HealthApp/1.0'},
                ),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, primaryGreen.withOpacity(0.85)],
                      stops: const [0.4, 1.0],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        t('set_up_vaccination', lang),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          shadows: [Shadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 1))],
                        ),
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Form card
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
            child: Material(
              color: cardWhite,
              borderRadius: BorderRadius.circular(20),
              elevation: 2,
              shadowColor: primaryGreen.withOpacity(0.2),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: dobController,
                      decoration: InputDecoration(
                        labelText: 'Date of birth (YYYY-MM-DD)',
                        hintText: 'e.g. 1990-05-15',
                        prefixIcon: const Icon(Icons.calendar_today_rounded, color: primaryGreen),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                        filled: true,
                        fillColor: backgroundWhite,
                      ),
                    ),
                    const SizedBox(height: 20),
                    DropdownButtonFormField<String>(
                      value: gender,
                      decoration: InputDecoration(
                        labelText: 'Gender',
                        prefixIcon: const Icon(Icons.person_rounded, color: primaryGreen),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                        filled: true,
                        fillColor: backgroundWhite,
                      ),
                      items: ['Male', 'Female', 'Other'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                      onChanged: onGenderChanged,
                    ),
                    const SizedBox(height: 28),
                    FilledButton(
                      onPressed: submitting ? null : onSubmit,
                      style: FilledButton.styleFrom(
                        backgroundColor: primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: submitting
                          ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(continueLabel, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Profile state: sections with icons, vaccination cards, history, family.
class _ProfileView extends StatelessWidget {
  const _ProfileView({required this.profile, required this.lang, required this.onRefresh});

  final dynamic profile;
  final String lang;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: primaryGreen,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          if (profile.upcomingVaccines.isNotEmpty) ...[
            _SectionHeader(icon: Icons.schedule_rounded, title: t('upcoming_vaccines', lang)),
            const SizedBox(height: 8),
            ...profile.upcomingVaccines.map((v) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: VaccinationCard(vaccine: v),
                )),
            const SizedBox(height: 20),
          ],
          _SectionHeader(
            icon: Icons.history_rounded,
            title: t('vaccination_history', lang),
            action: TextButton.icon(
              icon: const Icon(Icons.add_rounded, size: 20),
              label: Text(t('add_record', lang)),
              onPressed: () => context.push('/vaccination/add'),
            ),
          ),
          const SizedBox(height: 8),
          if (profile.vaccinations.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: Text(
                  'No records yet. Tap "Add Record" to add one.',
                  style: TextStyle(color: textMuted, fontSize: 14),
                ),
              ),
            )
          else
            ...profile.vaccinations.map((r) => _HistoryTile(
                  vaccineName: r.vaccineName,
                  dateAdministered: r.dateAdministered,
                  facilityId: r.facilityId,
                )),
          if (profile.familyMembers.isNotEmpty) ...[
            const SizedBox(height: 24),
            _SectionHeader(icon: Icons.family_restroom_rounded, title: t('family_members', lang)),
            const SizedBox(height: 8),
            ...profile.familyMembers.map((fm) => _FamilyMemberCard(
                  name: fm.name,
                  relationship: fm.relationship,
                  upcomingVaccines: fm.upcomingVaccines,
                )),
          ],
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.icon, required this.title, this.action});

  final IconData icon;
  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: primaryGreen.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 22, color: primaryGreen),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: (Theme.of(context).textTheme.titleMedium ?? const TextStyle()).copyWith(color: primaryGreen, fontWeight: FontWeight.w700),
            ),
          ),
          if (action != null) action!,
        ],
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.vaccineName, required this.dateAdministered, this.facilityId});

  final String vaccineName;
  final String dateAdministered;
  final String? facilityId;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: primaryGreen.withOpacity(0.15), child: const Icon(Icons.vaccines_rounded, color: primaryGreen, size: 22)),
        title: Text(vaccineName, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text('$dateAdministered${facilityId != null ? ' • $facilityId' : ''}', style: TextStyle(fontSize: 13, color: textSecondary)),
      ),
    );
  }
}

class _FamilyMemberCard extends StatelessWidget {
  const _FamilyMemberCard({required this.name, required this.relationship, required this.upcomingVaccines});

  final String name;
  final String relationship;
  final List<dynamic> upcomingVaccines;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ExpansionTile(
        leading: CircleAvatar(backgroundColor: primaryGreenLight.withOpacity(0.2), child: Icon(Icons.person_rounded, color: primaryGreen, size: 22)),
        title: Text('$name ($relationship)', style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text('${upcomingVaccines.length} upcoming', style: TextStyle(fontSize: 13, color: textSecondary)),
        children: upcomingVaccines.isEmpty
            ? [const ListTile(title: Text('No upcoming vaccines', style: TextStyle(color: textMuted, fontSize: 14)))]
            : upcomingVaccines.map((v) => ListTile(title: Text(v.vaccineName), subtitle: Text(v.dueDate))).toList(),
      ),
    );
  }
}
