import 'package:flutter/material.dart';
import 'package:structurizer/components/home/note_taking_ui_component.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [NoteTakingUiComponent()],
        ),
      ),
    );
  }
}
