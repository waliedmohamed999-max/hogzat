import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _mobileController = TextEditingController();
  final _codeController = TextEditingController();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تأكيد الدخول')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _mobileController,
              decoration: const InputDecoration(labelText: 'رقم الجوال'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _codeController,
              decoration: const InputDecoration(labelText: 'الكود'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loading
                  ? null
                  : () async {
                      setState(() => _loading = true);
                      final ok = await ref.read(authServiceProvider).verifyOtp(
                            _mobileController.text,
                            _codeController.text,
                          );
                      setState(() => _loading = false);
                      if (ok && context.mounted) {
                        context.go('/home');
                      }
                    },
              child: _loading ? const CircularProgressIndicator() : const Text('تأكيد'),
            ),
          ],
        ),
      ),
    );
  }
}
