import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';

export default function FolderNotesComponent({ folder }) {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadFolderNotes = async () => {
        try {
            setIsLoading(true);
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const getNotesCommand = await invoke("get_notes_by_folder_sqlite", {
                folderId: folder.id
            });
            const folderNotes = await db.select(getNotesCommand);
            setNotes(folderNotes);
        } catch (e) {
            setError(`Failed to load notes: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (folder) {
            loadFolderNotes();
        }
    }, [folder]);

    if (isLoading) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-(--primary) mx-auto"></div>
                <p className="text-(--on-surface-variant) text-sm mt-2">Loading notes...</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-(--on-surface)">
                    Notes in "{folder.name}"
                </h3>
                <span className="text-xs bg-(--primary-container) text-(--on-primary-container) px-2 py-1 rounded-full">
                    {notes.length} notes
                </span>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-(--error-container) border border-(--error) rounded-lg">
                    <p className="text-(--on-error-container) text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-2">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="p-3 border border-(--outline-variant) rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer"
                    >
                        <h4 className="font-medium text-(--on-surface) truncate">
                            {note.title}
                        </h4>
                        <p className="text-(--on-surface-variant) text-sm mt-1 line-clamp-2">
                            {note.content || 'No content'}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-(--on-surface-variant) text-xs">
                                {new Date(note.date_modified).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                                <button className="text-(--primary) hover:text-(--primary-container) text-xs">
                                    Edit
                                </button>
                                <button className="text-(--error) hover:text-(--error-container) text-xs">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && !error && (
                <div className="text-center py-8">
                    <div className="text-(--primary) opacity-50 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-(--on-surface-variant)">No notes in this folder yet</p>
                    <p className="text-(--on-surface-variant) text-sm mt-1">
                        Click "Add note" in the folder menu to create your first note
                    </p>
                </div>
            )}
        </div>
    );
}