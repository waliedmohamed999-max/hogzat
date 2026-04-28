import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'Labayh';
  static const String apiBaseUrlWeb = String.fromEnvironment(
    'API_BASE_URL_WEB',
    defaultValue: 'http://localhost:8000/api',
  );
  // Android emulator uses 10.0.2.2 to reach host machine.
  static const String apiBaseUrlMobile = String.fromEnvironment(
    'API_BASE_URL_MOBILE',
    defaultValue: 'http://192.168.8.150:8000/api',
  );

  static String get apiBaseUrl => kIsWeb ? apiBaseUrlWeb : apiBaseUrlMobile;
}
