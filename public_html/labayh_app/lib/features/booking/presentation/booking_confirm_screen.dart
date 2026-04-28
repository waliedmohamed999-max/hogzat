import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers.dart';

class BookingConfirmScreen extends ConsumerStatefulWidget {
  const BookingConfirmScreen({
    super.key,
    required this.propertyId,
    required this.from,
    required this.to,
    required this.guests,
  });

  final int propertyId;
  final String from;
  final String to;
  final int guests;

  @override
  ConsumerState<BookingConfirmScreen> createState() => _BookingConfirmScreenState();
}

class _BookingConfirmScreenState extends ConsumerState<BookingConfirmScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('????? ?????')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _firstNameController, decoration: const InputDecoration(labelText: '????? ?????')),
            TextField(controller: _lastNameController, decoration: const InputDecoration(labelText: '????? ??????')),
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: '?????? ??????????')),
            TextField(controller: _phoneController, decoration: const InputDecoration(labelText: '??? ??????')),
            const Spacer(),
            ElevatedButton(
              onPressed: _submitting ? null : _submit,
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
              child: _submitting ? const CircularProgressIndicator() : const Text('????? ?????'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    final bookingId = await ref.read(bookingServiceProvider).createBooking(
          propertyId: widget.propertyId,
          from: widget.from,
          to: widget.to,
          guests: widget.guests,
          firstName: _firstNameController.text,
          lastName: _lastNameController.text,
          email: _emailController.text,
          phone: _phoneController.text,
        );
    setState(() => _submitting = false);
    if (!mounted) {
      return;
    }
    final message = bookingId == null ? '???? ????? ?????' : '?? ????? ????? ??? $bookingId';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}
