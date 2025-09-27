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
    double width = isCollapsed ? 70 : 250;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: width,
      color: Colors.blueGrey[900],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, // Keep menu to left
        children: [
          // Hamburger menu always top-left
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
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
    return InkWell(
      onTap: () => widget.onNavigate(route),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          children: [
            Icon(icon, color: Colors.white),
            if (!isCollapsed) ...[
              const SizedBox(width: 10),
              Text(label, style: const TextStyle(color: Colors.white)),
            ],
          ],
        ),
      ),
    );
  }
}
