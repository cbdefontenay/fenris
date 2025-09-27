import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;
    return Center(
      child: TextButton(
        onPressed: () {},
        style: TextButton.styleFrom(
          backgroundColor: color.secondary,
          foregroundColor: color.onSecondary
        ),
        child: const Text("data!"),
      ),
    );
  }
}