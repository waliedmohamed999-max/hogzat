import '../../core/network/api_client.dart';
import '../models/booking_quote.dart';
import '../models/booking.dart';

class BookingService {
  BookingService(this._apiClient);

  final ApiClient _apiClient;

  Future<BookingQuote> quote({
    required int propertyId,
    required String from,
    required String to,
    required int guests,
    String? coupon,
  }) async {
    final res = await _apiClient.client.post('/bookings/quote', data: {
      'product_id': propertyId,
      'checkin': from,
      'checkout': to,
      'guests_count': guests,
      if (coupon != null) 'coupon': coupon,
    });
    return BookingQuote.fromJson(res.data['data']);
  }

  Future<int?> createBooking({
    required int propertyId,
    required String from,
    required String to,
    required int guests,
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
  }) async {
    final res = await _apiClient.client.post('/bookings', data: {
      'product_id': propertyId,
      'checkin': from,
      'checkout': to,
      'guests_count': guests,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'phone': phone,
    });
    if (res.data['status'] == 1) {
      return res.data['data']['booking_id'] as int;
    }
    return null;
  }

  Future<List<BookingItem>> myBookings() async {
    final res = await _apiClient.client.get('/bookings/my');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => BookingItem.fromJson(e)).toList();
  }

  Future<bool> cancelBooking(int id) async {
    final res = await _apiClient.client.post('/bookings/$id/cancel');
    return res.data['status'] == 1;
  }
}
