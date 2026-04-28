import '../../core/network/api_client.dart';

class PaymentService {
  PaymentService(this._apiClient);

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> intent(int bookingId, String method) async {
    final res = await _apiClient.client.post('/payments/intent', data: {
      'booking_id': bookingId,
      'method': method,
    });
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> checkout(int bookingId, String method) async {
    final res = await _apiClient.client.post('/payments/checkout', data: {
      'booking_id': bookingId,
      'method': method,
    });
    return Map<String, dynamic>.from(res.data);
  }
}
