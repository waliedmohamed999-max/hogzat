import '../../core/network/api_client.dart';
import '../models/property.dart';

class FavoriteService {
  FavoriteService(this._apiClient);

  final ApiClient _apiClient;

  Future<bool> toggle(int propertyId) async {
    final res = await _apiClient.client.post('/favorites/$propertyId');
    return res.data['status'] == 1;
  }

  Future<List<PropertySummary>> list() async {
    final res = await _apiClient.client.get('/favorites');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => PropertySummary.fromJson(e)).toList();
  }
}
