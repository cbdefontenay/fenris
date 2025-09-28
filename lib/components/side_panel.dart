import 'package:flutter/material.dart';

class SidePanel extends StatefulWidget {
  final Function(String route) onNavigate;

  const SidePanel({super.key, required this.onNavigate});

  @override
  State<SidePanel> createState() => _SidePanelState();
}

class _SidePanelState extends State<SidePanel> {
  bool isCollapsed = true;

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;
    double width = isCollapsed ? 70 : 250;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      width: width,
      color: color.primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, // Keep menu to left
        children: [
          // Hamburger menu always top-left
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: IconButton(
              icon: Icon(Icons.menu, color: color.onPrimary),
              onPressed: () {
                setState(() {
                  isCollapsed = !isCollapsed;
                });
              },
            ),
          ),

          const SizedBox(height: 20),

          // Navigation items
          buildNavItem(Icons.home, 'Home', 'home'),
          buildNavItem(Icons.settings, 'Settings', 'settings'),
          buildNavItem(Icons.info, 'About', 'about'),
        ],
      ),
    );
  }

  Widget buildNavItem(IconData icon, String label, String route) {
    final color = Theme.of(context).colorScheme;
    return InkWell(
      onTap: () => widget.onNavigate(route),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          children: [
            Icon(icon, color: color.onPrimary),
            if (!isCollapsed) ...[
              SizedBox(width: 10),
              Text(label, style: TextStyle(color: color.onPrimary)),
            ],
          ],
        ),
      ),
    );
  }
}
