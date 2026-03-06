import 'package:dio/dio.dart';
import '../models/user.dart';

class UsersApi {
  UsersApi(this._dio);

  final Dio _dio;

  Future<User> getMe() async {
    final res = await _dio.get('/users/me');
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to get user',
      );
    }
    final userJson = (data['data'] as Map<String, dynamic>)['user'] as Map<String, dynamic>;
    return User.fromJson(userJson);
  }

  Future<User> updateMe(Map<String, dynamic> body) async {
    final res = await _dio.put('/users/me', data: body);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Update failed',
      );
    }
    final userJson = (data['data'] as Map<String, dynamic>)['user'] as Map<String, dynamic>? ?? (data['data'] as Map<String, dynamic>);
    return User.fromJson(userJson);
  }

  Future<void> deleteMe() async {
    final res = await _dio.delete('/users/me');
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Delete failed',
      );
    }
  }
}
