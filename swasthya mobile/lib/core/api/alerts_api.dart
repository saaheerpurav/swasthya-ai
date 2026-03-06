import 'package:dio/dio.dart';
import '../models/alert.dart';

class AlertsApi {
  AlertsApi(this._dio);

  final Dio _dio;

  Future<List<Alert>> getAlerts(String regionCode, {String? language, String? type}) async {
    final query = <String, dynamic>{'regionCode': regionCode};
    if (language != null) query['language'] = language;
    if (type != null) query['type'] = type;
    final res = await _dio.get('/alerts', queryParameters: query);
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: (data['error'] as Map<String, dynamic>)?['message'] as String? ?? 'Failed to get alerts',
      );
    }
    final list = (data['data'] as Map<String, dynamic>)['alerts'] as List<dynamic>? ?? [];
    return list.map((e) => Alert.fromJson(e as Map<String, dynamic>)).toList();
  }
}
