import 'package:flutter/material.dart';

class FolderSidePanel extends StatefulWidget {
  const FolderSidePanel({super.key});

  @override
  State<FolderSidePanel> createState() => _FolderSidePanelState();
}

class _FolderSidePanelState extends State<FolderSidePanel> {
  final List<Folder> _folders = [];
  final TextEditingController _folderNameController = TextEditingController();
  final FocusNode _folderNameFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    // Add some sample folders
    _folders.addAll([
      Folder('Projects', Icons.folder, DateTime.now()),
      Folder('Documents', Icons.folder, DateTime.now()),
      Folder('Archive', Icons.folder, DateTime.now()),
    ]);
  }

  @override
  void dispose() {
    _folderNameController.dispose();
    _folderNameFocusNode.dispose();
    super.dispose();
  }

  void _createNewFolder() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surfaceContainerLowest,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Create New Folder',
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: SizedBox(
          width: 300,
          child: TextField(
            controller: _folderNameController,
            focusNode: _folderNameFocusNode,
            autofocus: true,
            decoration: InputDecoration(
              hintText: 'Enter folder name',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.primary,
                  width: 2,
                ),
              ),
            ),
            onSubmitted: (_) => _addFolder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: _addFolder,
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Theme.of(context).colorScheme.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Create'),
          ),
        ],
      ),
    ).then((_) {
      _folderNameController.clear();
    });
  }

  void _addFolder() {
    if (_folderNameController.text.trim().isNotEmpty) {
      setState(() {
        _folders.insert(0, Folder(
          _folderNameController.text.trim(),
          Icons.folder,
          DateTime.now(),
        ));
      });
      Navigator.of(context).pop();
    }
  }

  void _deleteFolder(int index) {
    setState(() {
      _folders.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;

    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: color.surfaceContainerLowest,
        border: Border(
          right: BorderSide(
            color: color.outlineVariant.withAlpha(100),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: color.shadow.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            height: 70,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: color.surfaceContainerLow,
              border: Border(
                bottom: BorderSide(
                  color: color.outlineVariant.withAlpha(100),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Folders',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: color.onSurface,
                    letterSpacing: -0.5,
                  ),
                ),
                // Add Folder Button
                Tooltip(
                  message: 'Create new folder',
                  child: IconButton(
                    onPressed: _createNewFolder,
                    style: IconButton.styleFrom(
                      backgroundColor: color.primary,
                      foregroundColor: color.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.create_new_folder_outlined, size: 20),
                  ),
                ),
              ],
            ),
          ),

          // Folders List
          Expanded(
            child: _folders.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.folder_open_outlined,
                          size: 64,
                          color: color.onSurfaceVariant.withOpacity(0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No folders yet',
                          style: TextStyle(
                            color: color.onSurfaceVariant,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Create your first folder',
                          style: TextStyle(
                            color: color.onSurfaceVariant.withOpacity(0.7),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: _folders.length,
                    itemBuilder: (context, index) {
                      final folder = _folders[index];
                      return _FolderItem(
                        folder: folder,
                        onDelete: () => _deleteFolder(index),
                        color: color,
                      );
                    },
                  ),
          ),

          // Footer
          Container(
            height: 50,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: color.surfaceContainerLow,
              border: Border(
                top: BorderSide(
                  color: color.outlineVariant.withAlpha(100),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.folder,
                  size: 16,
                  color: color.onSurfaceVariant,
                ),
                const SizedBox(width: 8),
                Text(
                  '${_folders.length} ${_folders.length == 1 ? 'folder' : 'folders'}',
                  style: TextStyle(
                    color: color.onSurfaceVariant,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class Folder {
  final String name;
  final IconData icon;
  final DateTime createdAt;

  Folder(this.name, this.icon, this.createdAt);
}

class _FolderItem extends StatefulWidget {
  final Folder folder;
  final VoidCallback onDelete;
  final ColorScheme color;

  const _FolderItem({
    required this.folder,
    required this.onDelete,
    required this.color,
  });

  @override
  State<_FolderItem> createState() => __FolderItemState();
}

class __FolderItemState extends State<_FolderItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: _isHovered
              ? widget.color.primary.withOpacity(0.08)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: _isHovered
              ? Border.all(
                  color: widget.color.primary.withOpacity(0.2),
                  width: 1,
                )
              : null,
        ),
        child: ListTile(
          leading: Icon(
            widget.folder.icon,
            size: 20,
            color: widget.color.primary,
          ),
          title: Text(
            widget.folder.name,
            style: TextStyle(
              color: widget.color.onSurface,
              fontWeight: FontWeight.w500,
              fontSize: 14,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: _isHovered
              ? Tooltip(
                  message: 'Delete folder',
                  child: IconButton(
                    onPressed: widget.onDelete,
                    icon: Icon(
                      Icons.delete_outline,
                      size: 18,
                      color: widget.color.error,
                    ),
                    style: IconButton.styleFrom(
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(32, 32),
                    ),
                  ),
                )
              : const SizedBox(width: 32),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12),
          visualDensity: VisualDensity.compact,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          onTap: () {
            // Handle folder tap
            print('Folder tapped: ${widget.folder.name}');
          },
        ),
      ),
    );
  }
}