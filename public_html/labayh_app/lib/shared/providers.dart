import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/api_client.dart';
import 'services/auth_service.dart';
import 'services/property_service.dart';
import 'services/booking_service.dart';
import 'services/payment_service.dart';
import 'services/favorite_service.dart';
import 'services/notification_service.dart';
import 'services/settings_service.dart';
import 'services/referral_service.dart';
import 'services/cohost_service.dart';
import 'services/experience_service.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiClientProvider));
});

final propertyServiceProvider = Provider<PropertyService>((ref) {
  return PropertyService(ref.read(apiClientProvider));
});

final experienceServiceProvider = Provider<ExperienceService>((ref) {
  return ExperienceService(ref.read(apiClientProvider));
});

final bookingServiceProvider = Provider<BookingService>((ref) {
  return BookingService(ref.read(apiClientProvider));
});

final paymentServiceProvider = Provider<PaymentService>((ref) {
  return PaymentService(ref.read(apiClientProvider));
});

final favoriteServiceProvider = Provider<FavoriteService>((ref) {
  return FavoriteService(ref.read(apiClientProvider));
});

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService(ref.read(apiClientProvider));
});

final settingsServiceProvider = Provider<SettingsService>((ref) {
  return SettingsService(ref.read(apiClientProvider));
});

final referralServiceProvider = Provider<ReferralService>((ref) {
  return ReferralService(ref.read(apiClientProvider));
});

final cohostServiceProvider = Provider<CohostService>((ref) {
  return CohostService(ref.read(apiClientProvider));
});
