import '../../core/network/api_client.dart';
import '../models/settings_menu_item.dart';
import '../models/legal_item.dart';
import '../models/help_item.dart';
import '../models/privacy_setting.dart';

class SettingsService {
  SettingsService(this._apiClient);

  final ApiClient _apiClient;

  Future<AccountSettingsPayload> accountMenu() async {
    final res = await _apiClient.client.get('/settings/account');
    return AccountSettingsPayload.fromJson(res.data['data'] ?? {});
  }

  Future<List<LegalItem>> legalItems() async {
    final res = await _apiClient.client.get('/settings/legal');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => LegalItem.fromJson(e)).toList();
  }

  Future<List<HelpItem>> helpItems() async {
    final res = await _apiClient.client.get('/settings/help');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => HelpItem.fromJson(e)).toList();
  }

  Future<PrivacySettingsPayload> privacySettings() async {
    final res = await _apiClient.client.get('/settings/privacy');
    return PrivacySettingsPayload.fromJson(res.data['data'] ?? {});
  }

  Future<bool> updatePrivacySetting(String key, bool enabled) async {
    final res = await _apiClient.client.patch('/settings/privacy/$key', data: {
      'enabled': enabled,
    });
    return res.data['status'] == 1;
  }

  Future<bool> requestPersonalData() async {
    final res = await _apiClient.client.post('/settings/privacy/request-data');
    return res.data['status'] == 1;
  }

  Future<bool> deleteAccount() async {
    final res = await _apiClient.client.delete('/account');
    return res.data['status'] == 1;
  }
}
