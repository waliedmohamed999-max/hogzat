import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_bottom_nav.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F4),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.notifications_none),
                ),
                const Spacer(),
                const Text(
                  'الملف الشخصي',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: const [
                  CircleAvatar(
                    radius: 38,
                    backgroundColor: Colors.black87,
                    child: Text('W', style: TextStyle(color: Colors.white, fontSize: 26)),
                  ),
                  SizedBox(height: 12),
                  Text('Waleed', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                  SizedBox(height: 4),
                  Text('ضيف', style: TextStyle(color: Colors.black54)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: const [
                Expanded(child: _SmallCard(title: 'المعارف', badge: 'جديد')),
                SizedBox(width: 12),
                Expanded(child: _SmallCard(title: 'الرحلات السابقة', badge: 'جديد')),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: const [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('انضم كمضيف', style: TextStyle(fontWeight: FontWeight.w600)),
                        SizedBox(height: 6),
                        Text('من السهل بدء الاستضافة وربح دخل إضافي.',
                            style: TextStyle(color: Colors.black54)),
                      ],
                    ),
                  ),
                  Icon(Icons.emoji_people_outlined, size: 40),
                ],
              ),
            ),
            const SizedBox(height: 18),
            _SettingsTile(title: 'إعدادات الحساب', icon: Icons.settings, onTap: () => context.push('/account/settings')),
            _SettingsTile(title: 'اطلب المساعدة', icon: Icons.help_outline, onTap: () => context.push('/account/help')),
            _SettingsTile(title: 'عرض الملف الشخصي', icon: Icons.person_outline, onTap: () => context.push('/account/profile')),
            _SettingsTile(title: 'الخصوصية', icon: Icons.privacy_tip_outlined, onTap: () => context.push('/account/privacy')),
            const Divider(height: 24),
            _SettingsTile(title: 'إحالة مضيف', icon: Icons.group_add_outlined, onTap: () => context.push('/account/referral')),
            _SettingsTile(title: 'العثور على مضيف مشارك', icon: Icons.support_agent_outlined, onTap: () => context.push('/account/cohost')),
            _SettingsTile(title: 'قانوني', icon: Icons.description_outlined, onTap: () => context.push('/account/legal')),
            _SettingsTile(title: 'تسجيل الخروج', icon: Icons.logout, onTap: () => context.push('/auth/login')),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
    );
  }
}

class _SmallCard extends StatelessWidget {
  const _SmallCard({required this.title, required this.badge});

  final String title;
  final String badge;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF5A6B7E),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(badge, style: const TextStyle(color: Colors.white, fontSize: 10)),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({required this.title, required this.icon, this.onTap});

  final String title;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_left),
        ],
      ),
      onTap: onTap,
    );
  }
}
