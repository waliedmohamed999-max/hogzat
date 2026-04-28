import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/legal_item.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/icon_mapper.dart';

final legalItemsProvider = FutureProvider<List<LegalItem>>((ref) async {
  return ref.read(settingsServiceProvider).legalItems();
});

class LegalScreen extends ConsumerWidget {
  const LegalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(legalItemsProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('قانوني'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (items) {
            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              itemBuilder: (context, index) {
                final item = items[index];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(item.title),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(mapIcon(item.icon)),
                      const SizedBox(width: 10),
                      const Icon(Icons.chevron_left),
                    ],
                  ),
                  onTap: () {},
                );
              },
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemCount: items.length,
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل المعلومات القانونية: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
