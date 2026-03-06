import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../core/api/dio_client.dart';
import '../../core/providers/vaccination_provider.dart';
import '../../core/constants/vaccines.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';

class AddVaccinationScreen extends ConsumerStatefulWidget {
  const AddVaccinationScreen({super.key});

  @override
  ConsumerState<AddVaccinationScreen> createState() => _AddVaccinationScreenState();
}

class _AddVaccinationScreenState extends ConsumerState<AddVaccinationScreen> {
  final _vaccineController = TextEditingController();
  DateTime? _dateAdministered;
  String? _memberId;
  final _facilityController = TextEditingController();
  final _batchController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _vaccineController.dispose();
    _facilityController.dispose();
    _batchController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_vaccineController.text.trim().isEmpty || _dateAdministered == null) return;
    setState(() => _loading = true);
    try {
      await ref.read(vaccinationApiProvider).addRecord({
        'vaccineName': _vaccineController.text.trim(),
        'dateAdministered': _dateAdministered!.toIso8601String().split('T').first,
        'facilityId': _facilityController.text.trim().isEmpty ? null : _facilityController.text.trim(),
        'batchNumber': _batchController.text.trim().isEmpty ? null : _batchController.text.trim(),
        'memberId': _memberId,
      });
      ref.invalidate(vaccinationProfileProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(t('record_added', ref.read(preferredLanguageProvider))),
          backgroundColor: primaryGreen,
          behavior: SnackBarBehavior.floating,
        ));
        context.pop();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);

    return Scaffold(
      backgroundColor: backgroundWhite,
      appBar: AppBar(
        title: Text(t('add_record', lang)),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Material(
          color: cardWhite,
          borderRadius: BorderRadius.circular(20),
          elevation: 2,
          shadowColor: primaryGreen.withOpacity(0.15),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Autocomplete<String>(
                  optionsBuilder: (text) => COMMON_VACCINES.where((v) => v.toLowerCase().contains(text.text.toLowerCase())),
                  onSelected: (v) => _vaccineController.text = v,
                  fieldViewBuilder: (context, controller, focusNode, onSubmitted) => TextField(
                    controller: controller..text = _vaccineController.text,
                    focusNode: focusNode,
                    onChanged: (v) => _vaccineController.text = v,
                    decoration: InputDecoration(
                      labelText: 'Vaccine name',
                      prefixIcon: const Icon(Icons.vaccines_rounded, color: primaryGreen),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                      filled: true,
                      fillColor: backgroundWhite,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now(),
                      firstDate: DateTime(1900),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) setState(() => _dateAdministered = date);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: 'Date administered',
                      prefixIcon: const Icon(Icons.calendar_today_rounded, color: primaryGreen),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                      filled: true,
                      fillColor: backgroundWhite,
                    ),
                    child: Text(
                      _dateAdministered == null ? 'Tap to select date' : _dateAdministered!.toIso8601String().split('T').first,
                      style: TextStyle(color: _dateAdministered == null ? textMuted : textPrimary),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _memberId,
                  decoration: InputDecoration(
                    labelText: 'For (Self or family member)',
                    prefixIcon: const Icon(Icons.person_rounded, color: primaryGreen),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                    filled: true,
                    fillColor: backgroundWhite,
                  ),
                  items: [
                    const DropdownMenuItem(value: null, child: Text('Self')),
                  ],
                  onChanged: (v) => setState(() => _memberId = v),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _facilityController,
                  decoration: InputDecoration(
                    labelText: 'Facility name (optional)',
                    prefixIcon: const Icon(Icons.local_hospital_rounded, color: primaryGreen),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                    filled: true,
                    fillColor: backgroundWhite,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _batchController,
                  decoration: InputDecoration(
                    labelText: 'Batch number (optional)',
                    prefixIcon: const Icon(Icons.tag_rounded, color: primaryGreen),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: primaryGreen, width: 2)),
                    filled: true,
                    fillColor: backgroundWhite,
                  ),
                ),
                const SizedBox(height: 28),
                FilledButton(
                  onPressed: _loading ? null : _submit,
                  style: FilledButton.styleFrom(
                    backgroundColor: primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(t('confirm', lang), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
