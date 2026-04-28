import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/property.dart';
import '../../../shared/providers.dart';

final mapPropertyProvider = FutureProvider.family<PropertyDetails, int>((ref, id) async {
  return ref.read(propertyServiceProvider).fetchProperty(id);
});

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key, required this.id});

  final int id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(mapPropertyProvider(id));

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('الموقع'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (item) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('${item.city}، ${item.country}', style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                Expanded(
                  child: item.mapImageUrl.isEmpty
                      ? Container(color: Colors.grey.shade200)
                      : Image.network(item.mapImageUrl, fit: BoxFit.cover, width: double.infinity),
                ),
              ],
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل الخريطة: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
