import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/cohost.dart';
import '../../../shared/providers.dart';

final cohostSearchProvider = FutureProvider.family<CohostSearchResult, String>((ref, location) async {
  return ref.read(cohostServiceProvider).search(location: location);
});

class CohostScreen extends ConsumerStatefulWidget {
  const CohostScreen({super.key, required this.initialLocation});

  final String initialLocation;

  @override
  ConsumerState<CohostScreen> createState() => _CohostScreenState();
}

class _CohostScreenState extends ConsumerState<CohostScreen> {
  late final TextEditingController _controller;
  late String _location;

  @override
  void initState() {
    super.initState();
    _location = widget.initialLocation;
    _controller = TextEditingController(text: _location);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncData = ref.watch(cohostSearchProvider(_location));

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            child: Column(
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.tune),
                      onPressed: () {},
                    ),
                    Expanded(
                      child: _SearchField(
                        controller: _controller,
                        onSubmitted: (value) => setState(() => _location = value),
                      ),
                    ),
                    const SizedBox(width: 12),
                    _CircleButton(
                      icon: Icons.arrow_forward,
                      onTap: () => context.pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Expanded(
                  child: asyncData.when(
                    data: (payload) {
                      if (payload.results.isNotEmpty) {
                        return ListView.builder(
                          itemCount: payload.results.length,
                          itemBuilder: (context, index) {
                            final item = payload.results[index];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundImage: item.avatarUrl.isEmpty ? null : NetworkImage(item.avatarUrl),
                              ),
                              title: Text(item.name),
                              subtitle: Text(item.city),
                              trailing: Text(item.rating.toStringAsFixed(1)),
                            );
                          },
                        );
                      }
                      return _EmptyState(payload: payload, location: _location);
                    },
                    error: (err, _) => Center(child: Text('تعذر تحميل المضيفين المشاركين: $err')),
                    loading: () => const Center(child: CircularProgressIndicator()),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({required this.controller, required this.onSubmitted});

  final TextEditingController controller;
  final ValueChanged<String> onSubmitted;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      textInputAction: TextInputAction.search,
      onSubmitted: onSubmitted,
      decoration: InputDecoration(
        hintText: 'ابحث عن موقع',
        prefixIcon: const Icon(Icons.search),
        filled: true,
        fillColor: const Color(0xFFF2F2F2),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }
}

class _EmptyState extends ConsumerWidget {
  const _EmptyState({required this.payload, required this.location});

  final CohostSearchResult payload;
  final String location;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.black87,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(payload.subtitle, style: const TextStyle(color: Colors.white)),
        ),
        const SizedBox(height: 30),
        const Icon(Icons.location_on, size: 90, color: Colors.black12),
        const SizedBox(height: 12),
        Text(payload.emptyTitle, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text(payload.emptyBody, textAlign: TextAlign.center, style: const TextStyle(color: Colors.black54)),
        const SizedBox(height: 18),
        ElevatedButton(
          onPressed: () async {
            await ref.read(cohostServiceProvider).notifyAvailability(location: location);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: Text(payload.notifyButtonLabel, style: const TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}

class _CircleButton extends StatelessWidget {
  const _CircleButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          shape: BoxShape.circle,
        ),
        child: Icon(icon),
      ),
    );
  }
}
