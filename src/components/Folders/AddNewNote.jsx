import { useState } from 'react';
import { createPortal } from 'react-dom';
import { invoke } from '@tauri-apps/api/core';
import Database from "@tauri-apps/plugin-sql";

export default function AddNewNote({
                                       menuRef,
                                       getMenuPosition,
                                       updateFolderNameHandler,
                                       handleDeleteFolder,
                                       isLoading,
                                       folderId,
                                       onNoteAdded,
                                       onMenuClose
                                   }) {
    const [isAddNotePopupOpen, setIsAddNotePopupOpen] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [isLoadingNote, setIsLoadingNote] = useState(false);

    const handleAddNote = () => {
        setIsAddNotePopupOpen(true);
    };

    const handleSaveNote = async () => {
        if (!newNoteTitle.trim()) return;
        setIsLoadingNote(true);
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const saveNoteCommand = await invoke("save_note_to_folder_sqlite", {
                title: newNoteTitle.trim(),
                content: '',
                folderId: folderId
            });

            await db.execute(saveNoteCommand);
            setIsAddNotePopupOpen(false);
            setNewNoteTitle('');
            if (onNoteAdded) onNoteAdded();
        } catch (error) {
            console.error('Error creating note:', error);
        } finally {
            setIsLoadingNote(false);
        }
    };

    const handleCancelNote = () => {
        setIsAddNotePopupOpen(false);
        setNewNoteTitle('');
    };

    const menuPosition = getMenuPosition();

    return (
        <>
            {/* Dropdown Menu */}
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    zIndex: 1000
                }}
                className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-xl py-1 min-w-32"
            >
                <button
                    className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm"
                    onClick={handleAddNote}
                >
                    Add note
                </button>
                <button
                    className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm"
                    onClick={updateFolderNameHandler}
                >
                    Change folder's name
                </button>
                <button
                    className="cursor-pointer w-full text-left px-3 py-2 text-(--error) hover:bg-(--error-container) text-sm"
                    onClick={handleDeleteFolder}
                    disabled={isLoading}
                >
                    {isLoading ? 'Deleting...' : 'Delete Folder'}
                </button>
            </div>

            {/* Global Popup via Portal */}
            {isAddNotePopupOpen &&
                createPortal(
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[5000] p-4">
                        <div className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-xl p-4 w-96">
                            <h2 className="text-lg font-semibold mb-4">Add New Note</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-(--on-surface-variant) mb-2">
                                    Note Title:
                                </label>
                                <input
                                    type="text"
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveNote();
                                        if (e.key === 'Escape') handleCancelNote();
                                    }}
                                    className="w-full p-3 border border-(--outline-variant) rounded-md bg-(--surface) text-(--on-surface) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
                                    placeholder="Enter note title..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={handleCancelNote}
                                    disabled={isLoadingNote}
                                    className="cursor-pointer px-4 py-2 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    disabled={isLoadingNote || !newNoteTitle.trim()}
                                    className="cursor-pointer px-4 py-2 bg-(--tertiary) text-(--on-tertiary) rounded-md hover:bg-(--secondary) transition-colors disabled:opacity-50"
                                >
                                    {isLoadingNote ? 'Creating...' : 'Create Note'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body // ← THIS is the magic line
                )}
        </>
    );
}
