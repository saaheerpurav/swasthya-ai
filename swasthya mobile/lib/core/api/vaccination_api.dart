import 'package:dio/dio.dart';
import '../models/vaccination.dart';

class VaccinationApi {
  VaccinationApi(this._dio);

  final Dio _dio;

  Future<VaccinationProfile?> getProfile() async {
    final res = await _dio.get('/vaccination/profile');
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to get profile',
      );
    }
    final profileJson = (data['data'] as Map<String, dynamic>)['profile'];
    if (profileJson == null) return null;
    return VaccinationProfile.fromJson({'profile': profileJson});
  }

  Future<VaccinationProfile> createOrUpdateProfile(Map<String, dynamic> body) async {
    final res = await _dio.post('/vaccination/profile', data: body);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to save profile',
      );
    }
    final profileJson = (data['data'] as Map<String, dynamic>)['profile'] ?? data['data'];
    return VaccinationProfile.fromJson(profileJson is Map<String, dynamic> ? {'profile': profileJson} : {'profile': data['data']});
  }

  Future<Map<String, dynamic>> addRecord(Map<String, dynamic> body) async {
    final res = await _dio.post('/vaccination/records', data: body);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to add record',
      );
    }
    return data['data'] as Map<String, dynamic>;
  }

  Future<void> deleteRecord(String vaccineId, {String? memberId}) async {
    final path = '/vaccination/records/$vaccineId';
    final uri = memberId != null ? '$path?memberId=$memberId' : path;
    final res = await _dio.delete(uri);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to delete',
      );
    }
  }
}
