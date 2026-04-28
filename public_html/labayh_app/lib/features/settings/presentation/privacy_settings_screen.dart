import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/models/privacy_setting.dart';
import '../../../shared/providers.dart';

final privacySettingsProvider =
    StateNotifierProvider<PrivacySettingsController, AsyncValue<PrivacySettingsPayload>>(
  (ref) => PrivacySettingsController(ref),
);

class PrivacySettingsController extends StateNotifier<AsyncValue<PrivacySettingsPayload>> {
  PrivacySettingsController(this._ref) : super(const AsyncValue.loading()) {
    _load();
  }

  final Ref _ref;

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final payload = await _ref.read(settingsServiceProvider).privacySettings();
      state = AsyncValue.data(payload);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }

  Future<void> toggleSetting(String key, bool enabled) async {
    final current = state.value;
    if (current == null) {
      return;
    }
    final updated = current.settings.map((item) {
      if (item.key == key) {
        return item.copyWith(enabled: enabled);
      }
      return item;
    }).toList();
    state = AsyncValue.data(
      PrivacySettingsPayload(
        title: current.title,
        subtitle: current.subtitle,
        settings: updated,
        actions: current.actions,
      ),
    );
    final success = await _ref.read(settingsServiceProvider).updatePrivacySetting(key, enabled);
    if (!success) {
      await _load();
    }
  }

  Future<void> requestData() async {
    await _ref.read(settingsServiceProvider).requestPersonalData();
  }

  Future<void> deleteAccount() async {
    await _ref.read(settingsServiceProvider).deleteAccount();
  }
}

class PrivacySettingsScreen extends ConsumerWidget {
  const PrivacySettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(privacySettingsProvider);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('الخصوصية'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: asyncData.when(
          data: (payload) {
            final grouped = <String, List<PrivacySetting>>{};
            for (final setting in payload.settings) {
              grouped.putIfAbsent(setting.section, () => []).add(setting);
            }
            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              children: [
                Text(payload.subtitle, style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 16),
                ...grouped.entries.map((entry) {
                  return _PrivacySection(title: entry.key, items: entry.value);
                }),
                const SizedBox(height: 24),
                const Text('خصوصية البيانات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                _ActionCard(
                  actions: payload.actions,
                  onTap: (key) async {
                    if (key == 'request_data') {
                      await ref.read(privacySettingsProvider.notifier).requestData();
                    } else if (key == 'delete_account') {
                      await ref.read(privacySettingsProvider.notifier).deleteAccount();
                    }
                  },
                ),
              ],
            );
          },
          error: (err, _) => Center(child: Text('تعذر تحميل إعدادات الخصوصية: $err')),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}

class _PrivacySection extends ConsumerWidget {
  const _PrivacySection({required this.title, required this.items});

  final String title;
  final List<PrivacySetting> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        ...items.map((item) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Switch(
                  value: item.enabled,
                  onChanged: (value) =>
                      ref.read(privacySettingsProvider.notifier).toggleSetting(item.key, value),
                  activeColor: Colors.black,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(item.description, style: const TextStyle(color: Colors.black54)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
        const Divider(height: 24),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.actions, required this.onTap});

  final List<PrivacyActionItem> actions;
  final void Function(String key) onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE5E2DE)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: actions.map((action) {
          return Column(
            children: [
              ListTile(
                title: Text(action.title),
                trailing: const Icon(Icons.chevron_left),
                onTap: () => onTap(action.key),
              ),
              if (action != actions.last) const Divider(height: 1),
            ],
          );
        }).toList(),
      ),
    );
  }
}
