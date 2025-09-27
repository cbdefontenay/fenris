import 'package:flutter/material.dart';
import 'package:structurizer/components/side_panel.dart';
import 'package:structurizer/pages/about_page.dart';
import 'package:structurizer/pages/home_page.dart';
import 'package:structurizer/pages/setting_page.dart';
import 'package:structurizer/src/rust/frb_generated.dart';
import 'package:structurizer/theme/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> main() async {
  await RustLib.init();
  runApp(const StructurizerApp());
}

class StructurizerApp extends StatefulWidget {
  const StructurizerApp({super.key});

  @override
  State<StructurizerApp> createState() => _StructurizerAppState();
}

class _StructurizerAppState extends State<StructurizerApp> {
  ThemeMode _themeMode = ThemeMode.system;

  @override
  void initState() {
    super.initState();
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final themeIndex = prefs.getInt('themeMode') ?? 0;
    setState(() {
      _themeMode = ThemeMode.values[themeIndex];
    });
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('themeMode', mode.index); // store as int
    setState(() {
      _themeMode = mode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: MaterialTheme.lightScheme(),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: MaterialTheme.darkScheme(),
        useMaterial3: true,
      ),
      themeMode: _themeMode,
      home: Wrapper(
        onThemeChanged: setThemeMode,
        currentThemeMode: _themeMode, // pass current theme mode
      ),
    );
  }
}

class Wrapper extends StatefulWidget {
  final Function(ThemeMode) onThemeChanged;
  final ThemeMode currentThemeMode;

  const Wrapper({
    super.key,
    required this.onThemeChanged,
    required this.currentThemeMode,
  });

  @override
  State<Wrapper> createState() => _WrapperState();
}

class _WrapperState extends State<Wrapper> {
  String currentPage = 'home';

  void navigate(String route) {
    setState(() {
      currentPage = route;
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget pageContent;

    switch (currentPage) {
      case 'settings':
        pageContent = SettingPage(
          onThemeChanged: widget.onThemeChanged,
          currentThemeMode: widget.currentThemeMode,
        );
        break;
      case 'about':
        pageContent = AboutPage();
        break;
      default:
        pageContent = HomePage();
    }

    return Scaffold(
      body: Row(
        children: [
          SidePanel(onNavigate: navigate),
          Expanded(
            child: Container(
              color: Theme.of(context).colorScheme.surface,
              child: pageContent,
            ),
          ),
        ],
      ),
    );
  }
}
