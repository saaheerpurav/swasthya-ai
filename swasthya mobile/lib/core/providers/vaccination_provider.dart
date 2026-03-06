import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/dio_client.dart';
import '../api/vaccination_api.dart';
import '../models/vaccination.dart';
import 'auth_provider.dart';

final vaccinationApiProvider = Provider<VaccinationApi>((ref) {
  return VaccinationApi(ref.read(dioProvider));
});

final vaccinationProfileProvider = FutureProvider<VaccinationProfile?>((ref) async {
  await ref.watch(authProvider.future);
  return ref.read(vaccinationApiProvider).getProfile();
});
