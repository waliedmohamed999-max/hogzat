import '../../core/network/api_client.dart';
import '../models/cohost.dart';

class CohostService {
  CohostService(this._apiClient);

  final ApiClient _apiClient;

  Future<CohostSearchResult> search({required String location, String? helpType}) async {
    final res = await _apiClient.client.get('/cohosts', queryParameters: {
      'location': location,
      if (helpType != null) 'help_type': helpType,
    });
    return CohostSearchResult.fromJson(res.data['data'] ?? {});
  }

  Future<bool> notifyAvailability({required String location, String? helpType}) async {
    final res = await _apiClient.client.post('/cohosts/notify', data: {
      'location': location,
      if (helpType != null) 'help_type': helpType,
    });
    return res.data['status'] == 1;
  }
}
