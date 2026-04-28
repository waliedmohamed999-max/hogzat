import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SimplePlaceholderScreen extends StatelessWidget {
  const SimplePlaceholderScreen({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: Text(title),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(child: Text(title)),
      ),
    );
  }
}
