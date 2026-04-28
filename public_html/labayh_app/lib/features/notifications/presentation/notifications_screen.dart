import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/notification_item.dart';
import '../../../shared/providers.dart';

final notificationsProvider = FutureProvider<List<NotificationItem>>((ref) async {
  return ref.read(notificationServiceProvider).list();
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الإشعارات')),
      body: asyncData.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('لا توجد إشعارات'));
          }
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                title: Text(item.title),
                subtitle: Text(item.body),
              );
            },
          );
        },
        error: (err, _) => Center(child: Text('تعذر تحميل الإشعارات: $err')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
