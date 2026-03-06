import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/dio_client.dart';
import '../api/users_api.dart';
import '../models/user.dart';
import 'auth_provider.dart';

final usersApiProvider = Provider<UsersApi>((ref) {
  return UsersApi(ref.read(dioProvider));
});

final currentUserProvider = FutureProvider<User>((ref) async {
  final token = await ref.watch(authProvider.future);
  if (token == null || token.isEmpty) throw UnauthorizedException();
  return ref.read(usersApiProvider).getMe();
});

class UnauthorizedException implements Exception {}
