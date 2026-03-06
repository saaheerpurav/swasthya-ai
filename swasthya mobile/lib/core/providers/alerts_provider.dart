import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/dio_client.dart';
import '../api/alerts_api.dart';
import '../models/alert.dart';
import 'user_provider.dart';

final alertsApiProvider = Provider<AlertsApi>((ref) => AlertsApi(ref.read(dioProvider)));

final alertsProvider = FutureProvider<List<Alert>>((ref) async {
  final user = await ref.watch(currentUserProvider.future).catchError((_) => null);
  final region = user?.location?.regionCode ?? 'KA_BLR';
  return ref.read(alertsApiProvider).getAlerts(region);
});
