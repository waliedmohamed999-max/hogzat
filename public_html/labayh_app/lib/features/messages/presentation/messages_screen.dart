import 'package:flutter/material.dart';

import '../../../shared/widgets/app_bottom_nav.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F4),
      appBar: AppBar(title: const Text('الرسائل')),
      body: const Center(
        child: Text('لا توجد رسائل بعد'),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }
}
