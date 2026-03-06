import 'package:dio/dio.dart';
import '../models/session.dart';

class AuthApi {
  AuthApi(this._dio);

  final Dio _dio;

  Future<void> sendOtp(String phoneNumber) async {
    final res = await _dio.post('/auth/otp/send', data: {'phoneNumber': phoneNumber});
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>?)?['message'] as String? ?? 'Failed to send OTP',
      );
    }
  }

  Future<Session> verifyOtp(String phoneNumber, String otp) async {
    final res = await _dio.post('/auth/otp/verify', data: {'phoneNumber': phoneNumber, 'otp': otp});
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>?)?['message'] as String? ?? 'Invalid OTP',
      );
    }
    return Session.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Session> createSession({String? identifier}) async {
    final body = <String, dynamic>{
      'channel': 'mobile',
    };
    if (identifier != null && identifier.isNotEmpty) {
      body['identifier'] = identifier;
    }
    final res = await _dio.post('/auth/session', data: body);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Auth failed',
      );
    }
    return Session.fromJson((data['data'] as Map<String, dynamic>));
  }

  Future<void> deleteSession() async {
    await _dio.delete('/auth/session');
  }
}
