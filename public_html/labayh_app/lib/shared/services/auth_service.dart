import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../models/auth_user.dart';
import '../../core/storage/token_storage.dart';

class AuthService {
  AuthService(this._apiClient);

  final ApiClient _apiClient;

  Future<AuthUser?> login(String email, String password) async {
    final res = await _apiClient.client.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    if (res.data['status'] == 1) {
      final token = res.data['token_code'] as String;
      await TokenStorage.setToken(token);
      return AuthUser(id: 0, name: '', mobile: '');
    }
    return null;
  }

  Future<bool> register(String name, String email, String mobile, String password) async {
    final res = await _apiClient.client.post('/auth/register', data: {
      'name': name,
      'email': email,
      'mobile': mobile,
      'password': password,
    });
    return res.data['status'] == 1;
  }

  Future<bool> requestOtp(String mobile) async {
    final res = await _apiClient.client.post('/auth/otp/request', data: {
      'phone': mobile,
    });
    return res.data['status'] == 1;
  }

  Future<bool> verifyOtp(String mobile, String code) async {
    final res = await _apiClient.client.post('/auth/otp/verify', data: {
      'phone': mobile,
      'code': code,
    });
    if (res.data['status'] == 1) {
      final token = res.data['token_code'] as String;
      await TokenStorage.setToken(token);
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    try {
      await _apiClient.client.post('/auth/logout');
    } on DioException {
      // ignore errors
    }
    await TokenStorage.clearToken();
  }
}
