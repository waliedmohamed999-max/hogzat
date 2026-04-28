import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({
    super.key,
    required this.currentIndex,
  });

  final int currentIndex;

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/profile');
        break;
      case 1:
        context.go('/messages');
        break;
      case 2:
        context.go('/bookings');
        break;
      case 3:
        context.go('/favorites');
        break;
      case 4:
        context.go('/home');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (index) => _onTap(context, index),
      type: BottomNavigationBarType.fixed,
      selectedItemColor: const Color(0xFFE53935),
      unselectedItemColor: Colors.grey.shade600,
      showUnselectedLabels: true,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'الملف الشخصي'),
        BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), label: 'الرسائل'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'الرحلات'),
        BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'المفضلة'),
        BottomNavigationBarItem(icon: Icon(Icons.search), label: 'استكشف'),
      ],
    );
  }
}
