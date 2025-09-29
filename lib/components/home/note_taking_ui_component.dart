import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class NoteTakingUiComponent extends StatefulWidget {
  const NoteTakingUiComponent({super.key});

  @override
  State<NoteTakingUiComponent> createState() => _NoteTakingUiComponentState();
}

class _NoteTakingUiComponentState extends State<NoteTakingUiComponent> {
  final TextEditingController _controller = TextEditingController();

  final String _initialMarkdown = "";

  @override
  void initState() {
    super.initState();
    _controller.text = _initialMarkdown;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SingleChildScrollView(
          child: Container(
            width: 1100,
            height: 650,
            decoration: BoxDecoration(
              color: color.surface,
              border: Border.all(
                color: color.outlineVariant.withAlpha(150),
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(16.0),
              boxShadow: [
                BoxShadow(
                  color: color.shadow.withAlpha(1505),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                  spreadRadius: 1,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16.0),
              child: Row(
                children: [
                  // --- Markdown Editor ---
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: color.surfaceContainerLowest,
                        border: Border(
                          right: BorderSide(
                            color: color.outlineVariant.withAlpha(150),
                            width: 1.0,
                          ),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Editor Header
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: color.surfaceContainerLow.withAlpha(150),
                              border: Border(
                                bottom: BorderSide(
                                  color: color.outlineVariant.withAlpha(150),
                                  width: 1.0,
                                ),
                              ),
                            ),
                            child: Text(
                              'EDITOR',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: color.primary.withAlpha(150),
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),
                          // Text Field
                          Expanded(
                            child: TextField(
                              controller: _controller,
                              maxLines: null,
                              keyboardType: TextInputType.multiline,
                              textAlignVertical: TextAlignVertical.top,
                              expands: true,
                              style: TextStyle(
                                fontFamily:
                                    'JetBrains Mono',
                                fontSize: 13,
                                height: 1.6,
                                color: color.onSurface,
                                fontWeight: FontWeight.w400,
                              ),
                              cursorColor: color.primary,
                              cursorWidth: 2.0,
                              cursorRadius: const Radius.circular(1),
                              decoration: InputDecoration(
                                contentPadding: const EdgeInsets.all(20.0),
                                border: InputBorder.none,
                                hintText: "Start writing your Markdown...",
                                hintStyle: TextStyle(
                                  color: color.onSurface.withAlpha(150),
                                  fontFamily: 'JetBrains Mono',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              onChanged: (_) => setState(() {}),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // --- Markdown Preview ---
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: color.surfaceContainerHighest,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Preview Header
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: color.surfaceContainerLow.withAlpha(150),
                              border: Border(
                                bottom: BorderSide(
                                  color: color.outlineVariant.withAlpha(150),
                                  width: 1.0,
                                ),
                              ),
                            ),
                            child: Text(
                              'PREVIEW',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: color.primary.withAlpha(150),
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),
                          // Markdown Content
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Markdown(
                                data: _controller.text.isEmpty
                                    ? "*Start typing to see the preview...*"
                                    : _controller.text,
                                styleSheet: MarkdownStyleSheet(
                                  p: TextStyle(
                                    fontSize: 15,
                                    height: 1.7,
                                    color: color.onSurface,
                                    fontWeight: FontWeight.w400,
                                  ),
                                  a: TextStyle(
                                    color: color.primary,
                                    fontWeight: FontWeight.w500,
                                    decoration: TextDecoration.underline,
                                    decorationColor: color.primary.withAlpha(
                                      150,
                                    ),
                                  ),
                                  blockquoteDecoration: BoxDecoration(
                                    color: color.primary.withAlpha(1505),
                                    border: Border(
                                      left: BorderSide(
                                        color: color.primary.withAlpha(150),
                                        width: 4,
                                      ),
                                    ),
                                    borderRadius: const BorderRadius.only(
                                      topRight: Radius.circular(4),
                                      bottomRight: Radius.circular(4),
                                    ),
                                  ),
                                  blockquote: TextStyle(
                                    color: color.onSurface,
                                    fontStyle: FontStyle.italic,
                                    height: 1.6,
                                  ),
                                  code: TextStyle(
                                    backgroundColor: color.surfaceContainer
                                        .withAlpha(150),
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: 13,
                                    color: color.onSurface,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  codeblockDecoration: BoxDecoration(
                                    color: color.surfaceContainer.withAlpha(
                                      150,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: color.outlineVariant.withAlpha(
                                        150,
                                      ),
                                      width: 1,
                                    ),
                                  ),
                                  codeblockPadding: const EdgeInsets.all(16),
                                  listBullet: TextStyle(
                                    color: color.primary.withAlpha(150),
                                    fontSize: 18,
                                  ),
                                  listIndent: 24.0,
                                  checkbox: TextStyle(
                                    color: color.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  tableCellsDecoration: BoxDecoration(
                                    border: Border.all(
                                      color: color.outlineVariant.withAlpha(
                                        150,
                                      ),
                                    ),
                                  ),
                                  tableHead: TextStyle(
                                    color: color.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  tableBody: TextStyle(
                                    color: color.onSurface,
                                    height: 1.5,
                                  ),
                                ),
                                shrinkWrap: true,
                                physics: const BouncingScrollPhysics(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
