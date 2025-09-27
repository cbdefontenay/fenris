import 'package:flutter/material.dart';

class SettingPage extends StatefulWidget {
  final Function(ThemeMode) onThemeChanged;
  final ThemeMode currentThemeMode;

  const SettingPage({
    super.key,
    required this.onThemeChanged,
    required this.currentThemeMode,
  });

  @override
  State<SettingPage> createState() => _SettingPageState();
}

class _SettingPageState extends State<SettingPage> {
  late ThemeMode _selectedMode;

  @override
  void initState() {
    super.initState();
    _selectedMode = widget.currentThemeMode;
  }

  String _getThemeModeLabel(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.system:
        return 'System Default';
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Theme", style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 20),
          DropdownMenu<ThemeMode>(
            initialSelection: _selectedMode,
            onSelected: (ThemeMode? newValue) {
              if (newValue != null) {
                setState(() {
                  _selectedMode = newValue;
                });
                widget.onThemeChanged(newValue);
              }
            },
            dropdownMenuEntries: ThemeMode.values.map((ThemeMode mode) {
              return DropdownMenuEntry<ThemeMode>(
                value: mode,
                label: _getThemeModeLabel(mode),
              );
            }).toList(),
            width: 250, // Optional: set a fixed width
            inputDecorationTheme: InputDecorationTheme(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
          ),
        ],
      ),
    );
  }
}