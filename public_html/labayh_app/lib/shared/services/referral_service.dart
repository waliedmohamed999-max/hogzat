import '../../core/network/api_client.dart';
import '../models/referral_option.dart';

class ReferralService {
  ReferralService(this._apiClient);

  final ApiClient _apiClient;

  Future<ReferralProgram> program() async {
    final res = await _apiClient.client.get('/referrals/host');
    return ReferralProgram.fromJson(res.data['data'] ?? {});
  }
}
