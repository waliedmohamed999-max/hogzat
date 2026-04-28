import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/property.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/icon_mapper.dart';

final amenitiesProvider = FutureProvider.family<List<PropertyAmenity>, int>((ref, id) async {
  return ref.read(propertyServiceProvider).fetchAmenities(id);
});

class AmenitiesScreen extends ConsumerWidget {
  const AmenitiesScreen({super.key, required this.id});

  final int id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(amenitiesProvider(id));

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('الميزات'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('لا توجد ميزات'));
            }
            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              itemBuilder: (context, index) {
                final amenity = items[index];
                return Row(
                  children: [
                    Icon(mapIcon(amenity.icon), size: 22),
                    const SizedBox(width: 12),
                    Expanded(child: Text(amenity.name)),
                  ],
                );
              },
              separatorBuilder: (_, __) => const Divider(height: 20),
              itemCount: items.length,
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل الميزات: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
