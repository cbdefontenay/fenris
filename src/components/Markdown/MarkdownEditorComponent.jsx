import { useState, useEffect } from 'react';

export default function MarkdownEditorComponent({ selectedNote }) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (selectedNote) {
            setTitle(selectedNote.title || '');
            setContent(selectedNote.content || '');
        } else {
            setTitle('');
            setContent('');
        }
    }, [selectedNote]);

    if (!selectedNote) {
        return (
            <div className="flex items-center justify-center h-full text-(--on-surface-variant)">
                <div className="text-center">
                    <div className="text-6xl mb-4 opacity-50">📝</div>
                    <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
                    <p>Select a note from the sidebar to start editing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Note Title */}
            <div className="mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none text-(--on-surface) placeholder-(--on-surface-variant)"
                    placeholder="Note Title"
                />
            </div>

            {/* Markdown Editor */}
            <div className="flex-1 border border-(--outline-variant) rounded-lg overflow-hidden">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-full p-4 bg-(--surface) text-(--on-surface) resize-none outline-none"
                    placeholder="Start writing your markdown here..."
                />
            </div>

            {/* You can add markdown preview functionality later */}
            <div className="mt-4 text-sm text-(--on-surface-variant)">
                Editing: <span className="font-medium">{title}</span>
            </div>
        </div>
    );
}