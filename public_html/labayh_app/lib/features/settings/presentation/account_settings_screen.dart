import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/settings_menu_item.dart';
import '../../../shared/providers.dart';
import '../../../shared/widgets/icon_mapper.dart';

final accountSettingsProvider = FutureProvider<AccountSettingsPayload>((ref) async {
  return ref.read(settingsServiceProvider).accountMenu();
});

class AccountSettingsScreen extends ConsumerWidget {
  const AccountSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(accountSettingsProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('إعدادات الحساب'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (payload) {
            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              itemCount: payload.items.length + 1,
              itemBuilder: (context, index) {
                if (index == payload.items.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 28),
                    child: Text(
                      payload.footerLabel,
                      style: const TextStyle(color: Colors.black54),
                      textAlign: TextAlign.center,
                    ),
                  );
                }
                final item = payload.items[index];
                return _SettingsRow(
                  title: item.title,
                  icon: mapIcon(item.icon),
                  badge: item.badge,
                  onTap: () => _handleRoute(context, item.routeKey),
                );
              },
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل الإعدادات: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }

  void _handleRoute(BuildContext context, String routeKey) {
    switch (routeKey) {
      case 'personal_info':
        context.push('/account/profile');
        break;
      case 'security':
        context.push('/account/security');
        break;
      case 'privacy':
        context.push('/account/privacy');
        break;
      case 'notifications':
        context.push('/notifications');
        break;
      case 'payments':
        context.push('/payment');
        break;
      case 'taxes':
        context.push('/account/taxes');
        break;
      case 'translation':
        context.push('/account/translation');
        break;
      case 'work_travel':
        context.push('/account/work-travel');
        break;
      case 'accessibility':
        context.push('/account/accessibility');
        break;
      default:
        break;
    }
  }
}

class _SettingsRow extends StatelessWidget {
  const _SettingsRow({
    required this.title,
    required this.icon,
    required this.onTap,
    this.badge,
  });

  final String title;
  final IconData icon;
  final String? badge;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon),
          const SizedBox(width: 10),
          const Icon(Icons.chevron_left),
        ],
      ),
      leading: badge == null
          ? null
          : Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(badge!, style: const TextStyle(color: Colors.white, fontSize: 10)),
            ),
      onTap: onTap,
    );
  }
}
