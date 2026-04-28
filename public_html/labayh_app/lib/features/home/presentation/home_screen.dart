import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/property.dart';
import '../../../shared/models/experience.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/app_bottom_nav.dart';
import '../../../shared/widgets/explore_card.dart';

final homePropertiesProvider = FutureProvider<List<PropertySummary>>((ref) async {
  return ref.read(propertyServiceProvider).fetchProperties();
});

final homeExperiencesProvider = FutureProvider<List<ExperienceSummary>>((ref) async {
  return ref.read(experienceServiceProvider).fetchExperiences();
});

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(homePropertiesProvider);
    final experienceData = ref.watch(homeExperiencesProvider);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Labayh'),
          actions: [
            IconButton(
              icon: const Icon(Icons.notifications_none),
              onPressed: () => context.push('/notifications'),
            ),
          ],
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
              child: GestureDetector(
                onTap: () => context.push('/search'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.search, color: Colors.black54),
                      SizedBox(width: 10),
                      Text('ابدأ البحث', style: TextStyle(color: Colors.black54)),
                    ],
                  ),
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 14,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: TabBar(
                labelColor: Colors.black,
                unselectedLabelColor: Colors.black54,
                indicator: const UnderlineTabIndicator(
                  borderSide: BorderSide(width: 2, color: Colors.black87),
                ),
                tabs: const [
                  _ExploreTab(icon: Icons.home_outlined, label: 'البيوت'),
                  _ExploreTab(icon: Icons.flight_takeoff_outlined, label: 'تجارب السفر', badge: 'جديد'),
                  _ExploreTab(icon: Icons.room_service_outlined, label: 'الخدمات', badge: 'جديد'),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: asyncData.when(
                data: (items) {
                  return TabBarView(
                    children: [
                      _HomesTab(items: items),
                      _ExperiencesTab(experiences: experienceData),
                      const _ServicesTab(),
                    ],
                  );
                },
                error: (err, _) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('تعذر الاتصال بالخادم'),
                      const SizedBox(height: 8),
                      Text(err.toString(), textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => ref.refresh(homePropertiesProvider),
                        child: const Text('إعادة المحاولة'),
                      ),
                    ],
                  ),
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
              ),
            ),
          ],
        ),
        bottomNavigationBar: const AppBottomNav(currentIndex: 4),
      ),
    );
  }
}

class _ExploreTab extends StatelessWidget {
  const _ExploreTab({
    required this.icon,
    required this.label,
    this.badge,
  });

  final IconData icon;
  final String label;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return Tab(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(icon, size: 22),
              if (badge != null)
                Positioned(
                  top: -10,
                  right: -12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF5A6B7E),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      badge!,
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}

class _HomesTab extends StatelessWidget {
  const _HomesTab({required this.items});

  final List<PropertySummary> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Center(child: Text('لا توجد بيانات حالياً'));
    }

    final firstBatch = items.take(6).toList();
    final secondBatch = items.skip(2).take(6).toList();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        _SectionHeader(
          title: 'بيوت رائعة في دبي',
          onTap: () => context.push('/search'),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 250,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: firstBatch.length,
            itemBuilder: (context, index) {
              final item = firstBatch[index];
              return ExploreCard(
                title: item.title,
                subtitle: item.city,
                priceLabel: 'مقابل 2 ليال ${item.priceFrom.toStringAsFixed(0)} SR',
                rating: item.rating,
                imageUrl: item.thumb,
                badge: 'مفضل لدى الضيوف',
                onTap: () => context.push('/property/${item.id}'),
              );
            },
          ),
        ),
        const SizedBox(height: 18),
        _SectionHeader(
          title: 'بيوت متاحة في الشهر القادم في جدة',
          onTap: () => context.push('/search'),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 250,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: secondBatch.length,
            itemBuilder: (context, index) {
              final item = secondBatch[index];
              return ExploreCard(
                title: item.title,
                subtitle: item.city,
                priceLabel: 'مقابل 2 ليال ${item.priceFrom.toStringAsFixed(0)} SR',
                rating: item.rating,
                imageUrl: item.thumb,
                badge: 'مفضل لدى الضيوف',
                onTap: () => context.push('/property/${item.id}'),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.local_offer_outlined, size: 16),
                SizedBox(width: 8),
                Text('تشمل الأسعار جميع الرسوم'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ExperiencesTab extends StatelessWidget {
  const _ExperiencesTab({required this.experiences});

  final AsyncValue<List<ExperienceSummary>> experiences;

  @override
  Widget build(BuildContext context) {
    return experiences.when(
      data: (items) {
        if (items.isEmpty) {
          return const Center(child: Text('No experiences available'));
        }
        final firstBatch = items.take(6).toList();
        final secondBatch = items.skip(2).take(6).toList();
        return ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          children: [
            const Text(
              'Travel Experiences',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            const Text('Experiences synced from the dashboard'),
            const SizedBox(height: 12),
            SizedBox(
              height: 260,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: firstBatch.length,
                itemBuilder: (context, index) {
                  final item = firstBatch[index];
                  return ExploreCard(
                    title: item.title,
                    subtitle: item.city,
                    priceLabel: 'From ${item.priceFrom.toStringAsFixed(0)} SR',
                    rating: item.rating,
                    badge: 'New',
                    imageUrl: item.thumb,
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            _SectionHeader(title: 'Trending Experiences'),
            const SizedBox(height: 10),
            SizedBox(
              height: 260,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: secondBatch.length,
                itemBuilder: (context, index) {
                  final item = secondBatch[index];
                  return ExploreCard(
                    title: item.title,
                    subtitle: item.city,
                    priceLabel: 'From ${item.priceFrom.toStringAsFixed(0)} SR',
                    rating: item.rating,
                    badge: 'Trending',
                    imageUrl: item.thumb,
                  );
                },
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Unable to reach server'),
            const SizedBox(height: 8),
            Text(err.toString(), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _ServicesTab extends StatelessWidget {
  const _ServicesTab();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('No services available'),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.onTap});

  final String title;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
        ),
        Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: onTap,
          ),
        ),
      ],
    );
  }
}

