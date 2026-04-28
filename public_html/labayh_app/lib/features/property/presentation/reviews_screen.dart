import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/review.dart';
import '../../../shared/providers.dart';

final reviewsProvider = FutureProvider.family<List<ReviewItem>, int>((ref, id) async {
  return ref.read(propertyServiceProvider).fetchReviews(id);
});

class ReviewsScreen extends ConsumerWidget {
  const ReviewsScreen({super.key, required this.id});

  final int id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(reviewsProvider(id));

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('التقييمات'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('لا توجد تقييمات'));
            }
            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              itemBuilder: (context, index) {
                final review = items[index];
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundImage: review.authorAvatar.isEmpty ? null : NetworkImage(review.authorAvatar),
                          backgroundColor: Colors.black12,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(review.authorName, style: const TextStyle(fontWeight: FontWeight.w600)),
                              Text(review.dateLabel, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                            ],
                          ),
                        ),
                        Row(
                          children: List.generate(5, (index) {
                            return Icon(
                              index < review.rating.round() ? Icons.star : Icons.star_border,
                              size: 14,
                              color: Colors.black,
                            );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(review.body, style: const TextStyle(color: Colors.black87)),
                  ],
                );
              },
              separatorBuilder: (_, __) => const Divider(height: 24),
              itemCount: items.length,
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل التقييمات: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
