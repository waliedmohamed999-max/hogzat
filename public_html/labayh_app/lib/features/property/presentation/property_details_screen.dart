import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/property.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/icon_mapper.dart';

final propertyDetailsProvider = FutureProvider.family<PropertyDetails, int>((ref, id) async {
  return ref.read(propertyServiceProvider).fetchProperty(id);
});

class PropertyDetailsScreen extends ConsumerWidget {
  const PropertyDetailsScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final propertyId = int.tryParse(id) ?? 0;
    final asyncData = ref.watch(propertyDetailsProvider(propertyId));

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: asyncData.when(
          data: (item) {
            return Stack(
              children: [
                CustomScrollView(
                  slivers: [
                    SliverToBoxAdapter(child: _ImageHeader(images: item.images)),
                    SliverToBoxAdapter(child: _DetailsBody(item: item)),
                    const SliverToBoxAdapter(child: SizedBox(height: 120)),
                  ],
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: _BookingBar(item: item),
                ),
              ],
            );
          },
          error: (err, _) => Center(child: Text('??? ???: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}

class _ImageHeader extends StatefulWidget {
  const _ImageHeader({required this.images});

  final List<String> images;

  @override
  State<_ImageHeader> createState() => _ImageHeaderState();
}

class _ImageHeaderState extends State<_ImageHeader> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final images = widget.images;
    return SizedBox(
      height: 320,
      child: Stack(
        children: [
          PageView.builder(
            itemCount: images.isEmpty ? 1 : images.length,
            onPageChanged: (value) => setState(() => _index = value),
            itemBuilder: (context, index) {
              final imageUrl = images.isEmpty ? '' : images[index];
              if (imageUrl.isEmpty) {
                return Container(color: Colors.grey.shade300);
              }
              return Image.network(imageUrl, fit: BoxFit.cover);
            },
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Row(
                children: [
                  _CircleIcon(
                    icon: Icons.favorite_border,
                    onTap: () {},
                  ),
                  const SizedBox(width: 12),
                  _CircleIcon(
                    icon: Icons.share_outlined,
                    onTap: () {},
                  ),
                  const Spacer(),
                  _CircleIcon(
                    icon: Icons.arrow_forward,
                    onTap: () => context.pop(),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            left: 16,
            bottom: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${_index + 1} / ${images.isEmpty ? 1 : images.length}',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailsBody extends StatelessWidget {
  const _DetailsBody({required this.item});

  final PropertyDetails item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(item.title, style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(item.subtitle, style: theme.textTheme.bodyMedium?.copyWith(color: Colors.black54)),
          const SizedBox(height: 6),
          Text(item.propertyTypeLabel, style: theme.textTheme.bodyMedium?.copyWith(color: Colors.black87)),
          const SizedBox(height: 6),
          Text(
            '${item.guests} ???? ? ${item.bedrooms} ??? ??? ? ${item.beds} ????? ? ${item.baths} ??????',
            style: theme.textTheme.bodySmall?.copyWith(color: Colors.black54),
          ),
          const SizedBox(height: 18),
          _SummaryRow(item: item),
          const SizedBox(height: 18),
          _HostPreview(item: item),
          const SizedBox(height: 18),
          Text(item.description, style: theme.textTheme.bodyMedium),
          const Divider(height: 36),
          _SectionTitle(title: '???? ?????'),
          const SizedBox(height: 12),
          _SleepingArrangements(items: item.sleepingArrangements),
          const Divider(height: 36),
          _SectionTitle(title: '?? ????? ??? ??????'),
          const SizedBox(height: 12),
          _AmenitiesList(items: item.amenities),
          const SizedBox(height: 14),
          _OutlineButton(
            label: '??? ??????? ??? ${item.amenities.length}',
            onTap: () => context.push('/property/${item.id}/amenities'),
          ),
          const Divider(height: 36),
          _SectionTitle(title: '?????? ???? ????? ???'),
          const SizedBox(height: 10),
          Text('${item.city}? ${item.country}', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 12),
          _MapPreview(
            imageUrl: item.mapImageUrl,
            onExpand: () => context.push('/property/${item.id}/map'),
          ),
          const Divider(height: 36),
          _SectionTitle(title: '????? ??? ???????'),
          const SizedBox(height: 12),
          _AccordionSection(
            title: item.cancellationPolicy.title,
            body: item.cancellationPolicy.summary,
            details: item.cancellationPolicy.details,
            icon: Icons.event_busy,
          ),
          _AccordionSection(
            title: '?????? ?????',
            list: item.houseRules,
            icon: Icons.key_outlined,
          ),
          _AccordionSection(
            title: '??????? ???????',
            list: item.safetyItems,
            icon: Icons.shield_outlined,
          ),
          const Divider(height: 36),
          _SectionTitle(title: '?????????'),
          const SizedBox(height: 12),
          _ReviewHighlight(item: item.reviewHighlight),
          const SizedBox(height: 12),
          _OutlineButton(
            label: '????? ?? ????????? ?????? ????? ${item.reviewCount} ???????',
            onTap: () => context.push('/property/${item.id}/reviews'),
          ),
          const Divider(height: 36),
          _SectionTitle(title: '????? ??? ?????'),
          const SizedBox(height: 12),
          _HostCard(host: item.host),
          const SizedBox(height: 18),
          _ReportRow(onTap: () {}),
          const SizedBox(height: 26),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.item});

  final PropertyDetails item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE9E6E2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                Text(item.reviewCount.toString(), style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                const Text('???????', style: TextStyle(fontSize: 12, color: Colors.black54)),
              ],
            ),
          ),
          _VerticalDivider(),
          Expanded(
            child: Column(
              children: [
                const Icon(Icons.emoji_events_outlined, size: 20),
                const SizedBox(height: 4),
                Text(item.guestFavoriteLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          _VerticalDivider(),
          Expanded(
            child: Column(
              children: [
                Text(item.rating.toStringAsFixed(2), style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return Icon(
                      index < item.rating.round() ? Icons.star : Icons.star_border,
                      size: 12,
                    );
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 32,
      color: const Color(0xFFE5E2DE),
    );
  }
}

class _HostPreview extends StatelessWidget {
  const _HostPreview({required this.item});

  final PropertyDetails item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F6F4),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundImage: item.host.avatarUrl.isEmpty ? null : NetworkImage(item.host.avatarUrl),
                backgroundColor: Colors.black12,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.host.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(item.host.badgeLabel, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                  ],
                ),
              ),
              if (item.host.isSuperhost)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(item.host.badgeLabel, style: const TextStyle(fontSize: 12)),
                ),
            ],
          ),
          const SizedBox(height: 12),
          _HostRow(icon: Icons.percent, text: '???? ?????????: ${item.host.responseRate}%'),
          const SizedBox(height: 6),
          _HostRow(icon: Icons.timer_outlined, text: item.host.responseTimeLabel),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => context.push('/messages?host_id=${item.host.id}'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(item.host.messageButtonLabel, style: const TextStyle(color: Colors.black)),
            ),
          ),
        ],
      ),
    );
  }
}

class _SleepingArrangements extends StatelessWidget {
  const _SleepingArrangements({required this.items});

  final List<SleepingArrangement> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }
    return SizedBox(
      height: 190,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final item = items[index];
          return Container(
            width: 220,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE9E6E2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: item.imageUrl.isEmpty
                        ? Container(color: Colors.grey.shade200)
                        : Image.network(item.imageUrl, fit: BoxFit.cover, width: double.infinity),
                  ),
                ),
                const SizedBox(height: 10),
                Text(item.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(item.bedsLabel, style: const TextStyle(color: Colors.black54, fontSize: 12)),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _AmenitiesList extends StatelessWidget {
  const _AmenitiesList({required this.items});

  final List<PropertyAmenity> items;

  @override
  Widget build(BuildContext context) {
    final limited = items.take(5).toList();
    return Column(
      children: limited.map((amenity) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              Icon(mapIcon(amenity.icon), size: 22),
              const SizedBox(width: 12),
              Expanded(child: Text(amenity.name)),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _MapPreview extends StatelessWidget {
  const _MapPreview({required this.imageUrl, required this.onExpand});

  final String imageUrl;
  final VoidCallback onExpand;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: imageUrl.isEmpty
                ? Container(color: Colors.grey.shade200)
                : Image.network(imageUrl, fit: BoxFit.cover),
          ),
        ),
        Positioned(
          left: 12,
          top: 12,
          child: _CircleIcon(icon: Icons.fullscreen, onTap: onExpand),
        ),
      ],
    );
  }
}

class _AccordionSection extends StatelessWidget {
  const _AccordionSection({
    required this.title,
    required this.icon,
    this.body,
    this.details,
    this.list,
  });

  final String title;
  final IconData icon;
  final String? body;
  final String? details;
  final List<PropertyRuleItem>? list;

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      childrenPadding: const EdgeInsets.only(bottom: 12),
      title: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
      children: [
        if (body != null && body!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(right: 30, left: 12, bottom: 8),
            child: Text(body!, style: const TextStyle(color: Colors.black54)),
          ),
        if (details != null && details!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(right: 30, left: 12, bottom: 8),
            child: Text(details!, style: const TextStyle(color: Colors.black54)),
          ),
        if (list != null)
          Padding(
            padding: const EdgeInsets.only(right: 30, left: 12),
            child: Column(
              children: list!.map((item) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Icon(mapIcon(item.icon), size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                            if (item.value.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(item.value, style: const TextStyle(color: Colors.black54)),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }
}

class _ReviewHighlight extends StatelessWidget {
  const _ReviewHighlight({required this.item});

  final PropertyReviewHighlight item;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(item.rating.toStringAsFixed(2),
                style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w700)),
            const SizedBox(width: 8),
            const Icon(Icons.emoji_events_outlined, size: 30),
            const Spacer(),
            Text(item.badgeLabel, style: const TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundImage: item.authorAvatar.isEmpty ? null : NetworkImage(item.authorAvatar),
              backgroundColor: Colors.black12,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.authorName, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text(item.dateLabel, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                ],
              ),
            ),
            Row(
              children: List.generate(5, (index) {
                return Icon(
                  index < item.rating.round() ? Icons.star : Icons.star_border,
                  size: 14,
                  color: Colors.black,
                );
              }),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(item.body, style: const TextStyle(color: Colors.black87)),
      ],
    );
  }
}

class _HostCard extends StatelessWidget {
  const _HostCard({required this.host});

  final PropertyHost host;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundImage: host.avatarUrl.isEmpty ? null : NetworkImage(host.avatarUrl),
                backgroundColor: Colors.black12,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(host.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(host.badgeLabel, style: const TextStyle(color: Colors.black54)),
                  ],
                ),
              ),
              Column(
                children: [
                  Text(host.reviewsCount.toString(), style: const TextStyle(fontWeight: FontWeight.w700)),
                  const Text('?????????', style: TextStyle(fontSize: 12, color: Colors.black54)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _HostStat(label: '??????? ???????', value: host.rating.toStringAsFixed(2)),
              ),
              Expanded(
                child: _HostStat(label: '??? ?? ?????????', value: host.hostingYears.toString()),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _HostRow(icon: Icons.location_on_outlined, text: host.locationLabel),
          const SizedBox(height: 10),
          _HostRow(icon: Icons.work_outline, text: host.jobTitle),
          const SizedBox(height: 16),
          Text(host.aboutTitle, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(host.aboutBody, style: const TextStyle(color: Colors.black54)),
          const SizedBox(height: 12),
          _HostRow(icon: Icons.percent, text: '???? ?????????: ${host.responseRate}%'),
          const SizedBox(height: 6),
          _HostRow(icon: Icons.timer_outlined, text: host.responseTimeLabel),
        ],
      ),
    );
  }
}

class _HostStat extends StatelessWidget {
  const _HostStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.black54)),
      ],
    );
  }
}

class _HostRow extends StatelessWidget {
  const _HostRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    if (text.isEmpty) {
      return const SizedBox.shrink();
    }
    return Row(
      children: [
        Icon(icon, size: 20),
        const SizedBox(width: 8),
        Expanded(child: Text(text)),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700));
  }
}

class _OutlineButton extends StatelessWidget {
  const _OutlineButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(label, style: const TextStyle(color: Colors.black)),
      ),
    );
  }
}

class _ReportRow extends StatelessWidget {
  const _ReportRow({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.flag_outlined),
      title: const Text('??????? ?? ??? ???????', style: TextStyle(decoration: TextDecoration.underline)),
      onTap: onTap,
    );
  }
}

class _BookingBar extends StatelessWidget {
  const _BookingBar({required this.item});

  final PropertyDetails item;

  @override
  Widget build(BuildContext context) {
    final price = '${item.pricing.currency}${item.pricing.total.toStringAsFixed(0)}';
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(price, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(item.pricing.dateRangeLabel, style: const TextStyle(color: Colors.black54)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.check, size: 16),
                      const SizedBox(width: 6),
                      Text(item.pricing.freeCancellationLabel, style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {
                context.push('/booking/new?property_id=${item.id}');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE51E54),
                padding: const EdgeInsets.symmetric(horizontal: 34, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('???', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

class _CircleIcon extends StatelessWidget {
  const _CircleIcon({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.black),
      ),
    );
  }
}
