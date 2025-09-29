import 'package:flutter/material.dart';
import 'package:structurizer/components/home/folder_side_panel.dart';
import 'package:structurizer/components/home/note_taking_ui_component.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Left Side Panel
          const FolderSidePanel(),
          
          // Right Content Area
          Expanded(
            child: Center(
              child: NoteTakingUiComponent(),
            ),
          ),
        ],
      ),
    );
  }
}