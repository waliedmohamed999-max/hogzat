import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/booking_quote.dart';
import '../../../shared/providers.dart';

class BookingQuoteParams {
  const BookingQuoteParams({
    required this.propertyId,
    required this.from,
    required this.to,
    required this.guests,
  });

  final int propertyId;
  final String from;
  final String to;
  final int guests;
}

final bookingQuoteProvider = FutureProvider.family<BookingQuote, BookingQuoteParams>((ref, params) async {
  return ref.read(bookingServiceProvider).quote(
        propertyId: params.propertyId,
        from: params.from,
        to: params.to,
        guests: params.guests,
      );
});

class BookingQuoteScreen extends ConsumerWidget {
  const BookingQuoteScreen({
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
  Widget build(BuildContext context, WidgetRef ref) {
    if (propertyId == 0 || from.isEmpty || to.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('بيانات الحجز غير مكتملة')),
      );
    }
    final params = BookingQuoteParams(
      propertyId: propertyId,
      from: from,
      to: to,
      guests: guests,
    );
    final asyncData = ref.watch(bookingQuoteProvider(params));

    return Scaffold(
      appBar: AppBar(title: const Text('التسعير')),
      body: asyncData.when(
        data: (quote) {
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('عدد الليالي: ${quote.nights}', style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                _LineItem(label: 'المجموع الفرعي', value: quote.subtotal),
                _LineItem(label: 'الرسوم', value: quote.fees),
                _LineItem(label: 'الضرائب', value: quote.tax),
                if (quote.discount > 0) _LineItem(label: 'الخصم', value: -quote.discount),
                const Divider(height: 24),
                _LineItem(label: 'الإجمالي', value: quote.total, isTotal: true),
                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    final route =
                        '/booking/confirm?property_id=$propertyId&from=$from&to=$to&guests=$guests';
                    context.push(route);
                  },
                  style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                  child: const Text('تأكيد الحجز'),
                ),
              ],
            ),
          );
        },
        error: (err, _) => Center(child: Text('Error: $err')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _LineItem extends StatelessWidget {
  const _LineItem({required this.label, required this.value, this.isTotal = false});

  final String label;
  final double value;
  final bool isTotal;

  @override
  Widget build(BuildContext context) {
    final color = isTotal ? Colors.black : Colors.black87;
    final weight = isTotal ? FontWeight.w700 : FontWeight.w500;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(label, style: TextStyle(color: color, fontWeight: weight))),
          Text(value.toStringAsFixed(2), style: TextStyle(color: color, fontWeight: weight)),
        ],
      ),
    );
  }
}
