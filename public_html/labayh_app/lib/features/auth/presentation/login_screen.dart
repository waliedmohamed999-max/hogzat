import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _mobileController = TextEditingController();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل الدخول')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _mobileController,
              decoration: const InputDecoration(labelText: 'رقم الجوال'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loading
                  ? null
                  : () async {
                      setState(() => _loading = true);
                      final ok = await ref.read(authServiceProvider).requestOtp(_mobileController.text);
                      setState(() => _loading = false);
                      if (ok && context.mounted) {
                        context.push('/auth/otp');
                      }
                    },
              child: _loading ? const CircularProgressIndicator() : const Text('إرسال كود التحقق'),
            ),
          ],
        ),
      ),
    );
  }
}
