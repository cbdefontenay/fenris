import { useState } from 'react';
import { createPortal } from 'react-dom';
import { invoke } from '@tauri-apps/api/core';
import Database from "@tauri-apps/plugin-sql";
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [isLoadingNote, setIsLoadingNote] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleAddNote = () => {
        setIsPopupOpen(true);
    };

    const handleSaveNote = async () => {
        if (!newNoteTitle.trim()) return;

        setIsLoadingNote(true);
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const saveNoteCommand = await invoke("save_note_to_folder_sqlite", {
                title: newNoteTitle.trim(),
                content: '',
                folderId: parseInt(folderId) // Ensure it's a number
            });

            await db.execute(saveNoteCommand);
            setIsPopupOpen(false);
            setNewNoteTitle('');
            if (onNoteAdded) onNoteAdded();
        } catch (error) {
            console.error('Error creating note:', error);
        } finally {
            setIsLoadingNote(false);
        }
    };

    const handleCancelNote = () => {
        setIsPopupOpen(false);
        setNewNoteTitle('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveNote();
        }
        if (e.key === 'Escape') {
            handleCancelNote();
        }
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
                    {t('folderMenu.addNote')}
                </button>
                <button
                    className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm"
                    onClick={updateFolderNameHandler}
                >
                    {t('folderMenu.changeFolderName')}
                </button>
                <button
                    className="cursor-pointer w-full text-left px-3 py-2 text-(--error) hover:bg-(--error-container) text-sm"
                    onClick={handleDeleteFolder}
                    disabled={isLoading}
                >
                    {isLoading ? t('folderMenu.deleting') : t('folderMenu.deleteFolder')}
                </button>
            </div>

            {/* Global Popup via Portal */}
            {isPopupOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[5000] p-4 popup-overlay"
                        onClick={handleCancelNote}
                    >
                        <div
                            className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-xl p-4 w-96 popup-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-semibold mb-4">{t('folderMenu.addNewNote')}</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-(--on-surface-variant) mb-2">
                                    {t('folderMenu.noteTitle')}:
                                </label>
                                <input
                                    type="text"
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full p-3 border border-(--outline-variant) rounded-md bg-(--surface) text-(--on-surface) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
                                    placeholder={t('folderMenu.enterNoteTitle')}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={handleCancelNote}
                                    disabled={isLoadingNote}
                                    className="cursor-pointer px-4 py-2 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-md transition-colors"
                                >
                                    {t('folderMenu.cancel')}
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    disabled={isLoadingNote || !newNoteTitle.trim()}
                                    className="cursor-pointer px-4 py-2 bg-(--tertiary) text-(--on-tertiary) rounded-md hover:bg-(--secondary) transition-colors disabled:opacity-50"
                                >
                                    {isLoadingNote ? t('folderMenu.creating') : t('folderMenu.createNote')}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}