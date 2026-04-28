import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/referral_option.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/icon_mapper.dart';

final referralProgramProvider = FutureProvider<ReferralProgram>((ref) async {
  return ref.read(referralServiceProvider).program();
});

class ReferralScreen extends ConsumerWidget {
  const ReferralScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(referralProgramProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('الإحالات'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (program) {
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                Text(program.headline, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(program.subtitle, style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 18),
                ...program.options.map((option) => _ReferralOptionCard(option: option)),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      await Clipboard.setData(ClipboardData(text: program.shareUrl));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE51E54),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: Text(program.buttonLabel, style: const TextStyle(color: Colors.white)),
                  ),
                ),
                const SizedBox(height: 12),
                Text(program.termsText, style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 6),
                Text(program.termsLinkLabel, style: const TextStyle(decoration: TextDecoration.underline)),
              ],
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل الإحالات: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}

class _ReferralOptionCard extends StatelessWidget {
  const _ReferralOptionCard({required this.option});

  final ReferralOption option;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE5E2DE)),
      ),
      child: Row(
        children: [
          _ReferralIcon(iconUrl: option.iconUrl, fallbackIcon: mapIcon(option.icon)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(option.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Text(option.subtitle, style: const TextStyle(color: Colors.black54)),
              ],
            ),
          ),
          Text(option.rewardText, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _ReferralIcon extends StatelessWidget {
  const _ReferralIcon({required this.iconUrl, required this.fallbackIcon});

  final String? iconUrl;
  final IconData fallbackIcon;

  @override
  Widget build(BuildContext context) {
    if (iconUrl == null || iconUrl!.isEmpty) {
      return Icon(fallbackIcon, size: 36);
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(iconUrl!, width: 40, height: 40, fit: BoxFit.cover),
    );
  }
}
