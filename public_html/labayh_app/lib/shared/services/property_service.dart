import '../../core/network/api_client.dart';
import '../models/property.dart';
import '../models/availability_day.dart';
import '../models/review.dart';

class PropertyService {
  PropertyService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<PropertySummary>> fetchProperties({
    String? city,
    String? from,
    String? to,
    int? guests,
    double? priceMin,
    double? priceMax,
    List<int>? amenities,
  }) async {
    final res = await _apiClient.client.get('/properties', queryParameters: {
      if (city != null) 'city': city,
      if (from != null) 'from': from,
      if (to != null) 'to': to,
      if (guests != null) 'guests': guests,
      if (priceMin != null) 'price_min': priceMin,
      if (priceMax != null) 'price_max': priceMax,
      if (amenities != null && amenities.isNotEmpty) 'amenities': amenities,
    });

    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => PropertySummary.fromJson(e)).toList();
  }

  Future<List<PropertySummary>> fetchProducts({
    String? type,
    String? city,
    String? from,
    String? to,
    int? guests,
    double? priceMin,
    double? priceMax,
    List<int>? amenities,
  }) async {
    final res = await _apiClient.client.get('/properties', queryParameters: {
      if (type != null) 'type': type,
      if (city != null) 'city': city,
      if (from != null) 'from': from,
      if (to != null) 'to': to,
      if (guests != null) 'guests': guests,
      if (priceMin != null) 'price_min': priceMin,
      if (priceMax != null) 'price_max': priceMax,
      if (amenities != null && amenities.isNotEmpty) 'amenities': amenities,
    });

    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => PropertySummary.fromJson(e)).toList();
  }

  Future<PropertyDetails> fetchProperty(int id) async {
    final res = await _apiClient.client.get('/properties/$id');
    return PropertyDetails.fromJson(res.data['data']);
  }

  Future<List<AvailabilityDay>> fetchAvailability(int id, String from, String to) async {
    final res = await _apiClient.client.get('/properties/$id/availability', queryParameters: {
      'from': from,
      'to': to,
    });
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => AvailabilityDay.fromJson(e)).toList();
  }

  Future<List<ReviewItem>> fetchReviews(int id) async {
    final res = await _apiClient.client.get('/properties/$id/reviews');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => ReviewItem.fromJson(e)).toList();
  }

  Future<List<PropertyAmenity>> fetchAmenities(int id) async {
    final res = await _apiClient.client.get('/properties/$id/amenities');
    final items = (res.data['data'] ?? []) as List<dynamic>;
    return items.map((e) => PropertyAmenity.fromJson(e)).toList();
  }
}
