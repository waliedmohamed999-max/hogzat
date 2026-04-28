import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F4C8A), Color(0xFF1E6BFF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Spacer(),
                Image.asset('logo.png).png', height: 64),
                const SizedBox(height: 12),
                const Text('Labayh', style: TextStyle(color: Colors.white, fontSize: 34)),
                const SizedBox(height: 12),
                const Text(
                  'احجز شاليهك بسهولة مع عروض مميزة وتجربة سلسة.',
                  style: TextStyle(color: Colors.white70),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: () => context.push('/auth/login'),
                  style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                  child: const Text('ابدأ الآن'),
                ),
                TextButton(
                  onPressed: () => context.go('/home'),
                  child: const Text('تصفح كزائر', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
