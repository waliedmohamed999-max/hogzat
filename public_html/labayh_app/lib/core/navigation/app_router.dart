import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/otp_screen.dart';
import '../../features/auth/presentation/onboarding_screen.dart';
import '../../features/booking/presentation/booking_confirm_screen.dart';
import '../../features/booking/presentation/booking_quote_screen.dart';
import '../../features/booking/presentation/booking_flow_screen.dart';
import '../../features/booking/presentation/bookings_screen.dart';
import '../../features/favorites/presentation/favorites_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/messages/presentation/messages_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/payment/presentation/payment_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/property/presentation/property_details_screen.dart';
import '../../features/property/presentation/amenities_screen.dart';
import '../../features/property/presentation/reviews_screen.dart';
import '../../features/property/presentation/map_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/host/presentation/host_dashboard_screen.dart';
import '../../features/settings/presentation/account_settings_screen.dart';
import '../../features/settings/presentation/legal_screen.dart';
import '../../features/settings/presentation/privacy_settings_screen.dart';
import '../../features/settings/presentation/help_screen.dart';
import '../../features/settings/presentation/referral_screen.dart';
import '../../features/settings/presentation/cohost_screen.dart';
import '../../features/settings/presentation/simple_placeholder_screen.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/onboarding',
    routes: [
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/auth/otp', builder: (_, __) => const OtpScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
      GoRoute(
        path: '/property/:id',
        builder: (_, state) => PropertyDetailsScreen(id: state.pathParameters['id'] ?? ''),
      ),
      GoRoute(
        path: '/property/:id/amenities',
        builder: (_, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return AmenitiesScreen(id: id);
        },
      ),
      GoRoute(
        path: '/property/:id/reviews',
        builder: (_, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return ReviewsScreen(id: id);
        },
      ),
      GoRoute(
        path: '/property/:id/map',
        builder: (_, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return MapScreen(id: id);
        },
      ),
      GoRoute(
        path: '/booking/quote',
        builder: (_, state) {
          final query = state.uri.queryParameters;
          final propertyId = int.tryParse(query['property_id'] ?? '') ?? 0;
          final guests = int.tryParse(query['guests'] ?? '') ?? 1;
          return BookingQuoteScreen(
            propertyId: propertyId,
            from: query['from'] ?? '',
            to: query['to'] ?? '',
            guests: guests,
          );
        },
      ),
      GoRoute(
        path: '/booking/new',
        builder: (_, state) {
          final query = state.uri.queryParameters;
          final propertyId = int.tryParse(query['property_id'] ?? '') ?? 0;
          return BookingFlowScreen(propertyId: propertyId);
        },
      ),
      GoRoute(
        path: '/booking/confirm',
        builder: (_, state) {
          final query = state.uri.queryParameters;
          final propertyId = int.tryParse(query['property_id'] ?? '') ?? 0;
          final guests = int.tryParse(query['guests'] ?? '') ?? 1;
          return BookingConfirmScreen(
            propertyId: propertyId,
            from: query['from'] ?? '',
            to: query['to'] ?? '',
            guests: guests,
          );
        },
      ),
      GoRoute(path: '/payment', builder: (_, __) => const PaymentScreen()),
      GoRoute(path: '/bookings', builder: (_, __) => const BookingsScreen()),
      GoRoute(path: '/favorites', builder: (_, __) => const FavoritesScreen()),
      GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/host/dashboard', builder: (_, __) => const HostDashboardScreen()),
      GoRoute(path: '/account/settings', builder: (_, __) => const AccountSettingsScreen()),
      GoRoute(path: '/account/privacy', builder: (_, __) => const PrivacySettingsScreen()),
      GoRoute(path: '/account/legal', builder: (_, __) => const LegalScreen()),
      GoRoute(path: '/account/help', builder: (_, __) => const HelpScreen()),
      GoRoute(path: '/account/referral', builder: (_, __) => const ReferralScreen()),
      GoRoute(
        path: '/account/cohost',
        builder: (_, state) {
          final location = state.uri.queryParameters['location'] ?? '';
          return CohostScreen(initialLocation: location);
        },
      ),
      GoRoute(path: '/account/profile', builder: (_, __) => const SimplePlaceholderScreen(title: 'المعلومات الشخصية')),
      GoRoute(path: '/account/security', builder: (_, __) => const SimplePlaceholderScreen(title: 'تسجيل الدخول والأمان')),
      GoRoute(path: '/account/taxes', builder: (_, __) => const SimplePlaceholderScreen(title: 'الضرائب')),
      GoRoute(path: '/account/translation', builder: (_, __) => const SimplePlaceholderScreen(title: 'الترجمة')),
      GoRoute(path: '/account/work-travel', builder: (_, __) => const SimplePlaceholderScreen(title: 'السفر من أجل العمل')),
      GoRoute(path: '/account/accessibility', builder: (_, __) => const SimplePlaceholderScreen(title: 'سهولة الوصول')),
    ],
  );
}
