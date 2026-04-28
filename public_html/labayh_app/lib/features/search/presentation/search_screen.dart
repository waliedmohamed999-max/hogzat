import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/property.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/explore_card.dart';

final searchProvider = FutureProvider<List<PropertySummary>>((ref) async {
  return ref.read(propertyServiceProvider).fetchProperties();
});

class SearchScreen extends ConsumerWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(searchProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('بحث')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'ابحث عن مدينة أو مكان',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          Expanded(
            child: asyncData.when(
              data: (items) {
                if (items.isEmpty) {
                  return const Center(child: Text('لا توجد نتائج'));
                }
                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ExploreCard(
                        title: item.title,
                        subtitle: item.city,
                        priceLabel: 'يبدأ من ${item.priceFrom.toStringAsFixed(0)} SR',
                        rating: item.rating,
                        imageUrl: item.thumb,
                        width: double.infinity,
                        onTap: () => context.push('/property/${item.id}'),
                      ),
                    );
                  },
                );
              },
              error: (err, _) => Center(child: Text('تعذر تحميل النتائج: $err')),
              loading: () => const Center(child: CircularProgressIndicator()),
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 4),
    );
  }
}
