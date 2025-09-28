import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:structurizer/src/rust/api/markdown.dart';

class NoteTakingUiComponent extends StatefulWidget {
  const NoteTakingUiComponent({super.key});

  @override
  State<NoteTakingUiComponent> createState() => _NoteTakingUiComponentState();
}

class _NoteTakingUiComponentState extends State<NoteTakingUiComponent> {
  final TextEditingController _controller = TextEditingController();

  final String _initialMarkdown =
      "## Hello World! 🚀\n\n**Start typing Markdown here...**\n\n- [ ] Task 1\n- [x] Task 2";

  String _htmlPreview = "";

  @override
  void initState() {
    super.initState();

    _controller.text = _initialMarkdown;
    _htmlPreview = convertMarkdownToHtml(markdown: _initialMarkdown);
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final currentText = _controller.text;

    // Synchronously call Rust for conversion
    final html = convertMarkdownToHtml(markdown: currentText);

    // Update the state with the new HTML, triggering a rebuild of the Html widget
    setState(() {
      _htmlPreview = html;
    });
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;

    return Container(
      width: 600,
      height: 400,
      decoration: BoxDecoration(
        border: Border.all(color: color.outlineVariant),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              maxLines: null,
              keyboardType: TextInputType.multiline,
              textAlignVertical: TextAlignVertical.top,
              expands: true,
              style: const TextStyle(fontFamily: 'monospace'),
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.all(16.0),
                border: const OutlineInputBorder(borderSide: BorderSide.none),
                hintText: "Write something in Markdown...",
                hintStyle: TextStyle(color: color.onSurface.withAlpha(150)),
              ),
            ),
          ),

          VerticalDivider(width: 1, thickness: 1, color: color.outlineVariant),

          // --- Live Preview (Right Side) ---
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Html(
                  data:
                      _htmlPreview, // This is the state variable updated by Rust
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
