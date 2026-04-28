import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({super.key});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  final _bookingController = TextEditingController(text: '0');
  String _method = 'mada';
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الدفع')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('اختر طريقة الدفع'),
            const SizedBox(height: 12),
            TextField(
              controller: _bookingController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'رقم الحجز'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _method,
              items: const [
                DropdownMenuItem(value: 'mada', child: Text('Mada')),
                DropdownMenuItem(value: 'stc', child: Text('STC Pay')),
                DropdownMenuItem(value: 'apple', child: Text('Apple Pay')),
                DropdownMenuItem(value: 'visa', child: Text('Visa / MasterCard')),
              ],
              onChanged: (value) => setState(() => _method = value ?? 'mada'),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _loading
                  ? null
                  : () async {
                      setState(() => _loading = true);
                      final bookingId = int.tryParse(_bookingController.text) ?? 0;
                      final res = await ref.read(paymentServiceProvider).intent(bookingId, _method);
                      setState(() => _loading = false);
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(res['message']?.toString() ?? 'Payment response')),
                      );
                    },
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
              child: _loading ? const CircularProgressIndicator() : const Text('ادفع الآن'),
            ),
          ],
        ),
      ),
    );
  }
}
