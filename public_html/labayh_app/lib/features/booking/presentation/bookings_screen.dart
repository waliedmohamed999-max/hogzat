import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/booking.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/app_bottom_nav.dart';

final bookingsProvider = FutureProvider<List<BookingItem>>((ref) async {
  return ref.read(bookingServiceProvider).myBookings();
});

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(bookingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الرحلات')),
      body: asyncData.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('لا توجد حجوزات'));
          }
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                title: Text(item.status),
                subtitle: Text('${item.startDate} - ${item.endDate}'),
                trailing: Text(item.total.toStringAsFixed(2)),
              );
            },
          );
        },
        error: (err, _) => Center(child: Text('تعذر تحميل الحجوزات: $err')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 2),
    );
  }
}
