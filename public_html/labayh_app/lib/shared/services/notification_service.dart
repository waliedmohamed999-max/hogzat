import '../../core/network/api_client.dart';
import '../models/notification_item.dart';

class NotificationService {
  NotificationService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<NotificationItem>> list() async {
    final res = await _apiClient.client.get('/notifications');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => NotificationItem.fromJson(e)).toList();
  }
}
