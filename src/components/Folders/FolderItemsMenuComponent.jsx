import {useEffect, useRef, useState} from 'react';
import {FaChevronDown, FaChevronRight, FaRegFolder} from "react-icons/fa";
import {RxDotsVertical} from "react-icons/rx";
import {deleteFolder, updateFolderName} from "../../data/CreateNotesDataShell.jsx";
import {invoke} from "@tauri-apps/api/core";
import AddNewNote from "./AddNewNote.jsx";
import Database from "@tauri-apps/plugin-sql";
import {MdOutlineEditNote} from "react-icons/md";
import {createPortal} from "react-dom";
import {useTranslation} from 'react-i18next';

export default function FolderItemsMenuComponent({folder, isAnyMenuOpen, onMenuToggle, onFolderUpdate, onNoteSelect}) {
    const {t} = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUpdateFolderNameMenuOpen, setIsUpdateFolderNameOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const getNotesCommand = await invoke("get_notes_by_folder_sqlite", {folderId: folder.id});
            const dbNotes = await db.select(getNotesCommand);
            setNotes(dbNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            loadNotes();
        }
    }, [isExpanded, folder.id]);

    useEffect(() => {
        function handleClickOutside(event) {
            const isPopupClick = event.target.closest('.popup-overlay') ||
                event.target.closest('.popup-content');

            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                !isPopupClick) {
                setIsMenuOpen(false);
                onMenuToggle(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onMenuToggle]);

    useEffect(() => {
        if (isAnyMenuOpen && !isMenuOpen) {
            setIsMenuOpen(false);
        }
    }, [isAnyMenuOpen, isMenuOpen]);

    useEffect(() => {
        if (isUpdateFolderNameMenuOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isUpdateFolderNameMenuOpen]);

    const getMenuPosition = () => {
        if (!buttonRef.current) return {top: 0, left: 0};
        const rect = buttonRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX - 192
        };
    };

    const handleMenuToggle = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        onMenuToggle(newState);
    };

    const handleFolderClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note.id);
        if (onNoteSelect) {
            onNoteSelect(note);
        }
    };

    const updateFolderNameHandler = () => {
        setIsUpdateFolderNameOpen(true);
        setIsMenuOpen(false);
    }

    const handleNoteAdded = () => {
        loadNotes();
        if (!isExpanded) {
            setIsExpanded(true);
        }
    }

    const handleSaveFolderName = async () => {
        if (folderItemsState.newFolderName.trim() === '') {
            await updateField("error", t('folderManagement.errors.folderNameEmpty'));
            return;
        }

        if (folderItemsState.newFolderName.trim() === folder.name) {
            setIsUpdateFolderNameOpen(false);
            return;
        }

        await updateField("is_loading", true);
        await updateField("error", '');

        try {
            const result = await updateFolderName(folderItemsState.newFolderName.trim(), folder.id);

            if (result.success) {
                if (onFolderUpdate) {
                    onFolderUpdate();
                }
                setIsUpdateFolderNameOpen(false);
                await updateField("new_folder_name", folder.name);
            } else {
                await updateField("error", result.error || t('folderManagement.errors.updateFailed'));
            }
        } catch (error) {
            await updateField("error", t('folderManagement.errors.updateFailedWithError', {error: error.message}));
        } finally {
            await updateField("is_loading", false);
        }
    }

    const handleDeleteFolder = async () => {
        const confirmationDialog = await invoke("delete_folder_dialog", {
            message: t('folderManagement.deleteConfirmation.message'),
            title: t('folderManagement.deleteConfirmation.title'),
            confirmation: t('folderManagement.deleteConfirmation.confirm'),
            cancellation: t('folderManagement.deleteConfirmation.cancel'),
            folderName: folder.name
        });

        if (!confirmationDialog) {
            return;
        }

        await updateField("is_loading", true);
        await updateField("error", '');

        try {
            setIsMenuOpen(false);
            onMenuToggle(false);

            const result = await deleteFolder(folder.id);

            if (result && result.success) {
                if (onFolderUpdate) {
                    onFolderUpdate();
                }
            } else {
                await updateField("error", result?.error || t('folderManagement.errors.deleteFailed'));
                setIsMenuOpen(true);
                onMenuToggle(true);
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
            await updateField("error", t('folderManagement.errors.deleteFailedWithError', {error: error.message}));
            setIsMenuOpen(true);
            onMenuToggle(true);
        } finally {
            await updateField("is_loading", false);
        }
    }

    const handleCancelUpdate = () => {
        setIsUpdateFolderNameOpen(false);
        updateField("new_folder_name", folder.name);
        updateField("error", '');
    }

    const handleInputChange = async (e) => {
        await updateField("new_folder_name", e.target.value);
        if (folderItemsState.error) {
            await updateField("error", '');
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveFolderName();
        }
        if (e.key === 'Escape') {
            handleCancelUpdate();
        }
    }

    return (
        <>
            {isUpdateFolderNameMenuOpen &&
                createPortal(
                    (
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white text-black rounded-lg shadow-xl p-4 w-96">
                                <h2 className="text-lg font-semibold mb-4">{t('folderManagement.changeFolderName')}</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-(--on-surface-variant) mb-2">
                                        {t('folderManagement.newFolderName')}:
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        defaultValue={folder.name}
                                        className="w-full p-3 border border-(--outline-variant) rounded-md bg-(--surface) text-(--on-surface) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
                                        placeholder={t('folderManagement.enterFolderName')}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsUpdateFolderNameOpen(false)}
                                        className="cursor-pointer px-4 py-2 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-md transition-colors"
                                    >
                                        {t('folderManagement.cancel')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Handle folder name update here
                                            setIsUpdateFolderNameOpen(false);
                                        }}
                                        className="cursor-pointer px-4 py-2 bg-(--tertiary) text-(--on-tertiary) rounded-md hover:bg-(--secondary) transition-colors"
                                    >
                                        {t('folderManagement.save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ),
                    document.body
                )
            }

            <div className="mb-1">
                {/* Folder Header */}
                <div
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors duration-200">
                    <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={handleFolderClick}
                    >
                        {isExpanded ? <FaChevronDown className="text-(--primary)" size={12}/> :
                            <FaChevronRight className="text-(--primary)" size={12}/>}
                        <FaRegFolder className="text-(--primary) flex-shrink-0"/>
                        <span className="text-(--on-surface) text-sm font-medium truncate">
                            {folder.name}
                        </span>
                        <span
                            className="text-xs text-(--on-surface-variant) bg-(--surface-container-highest) px-2 py-1 rounded-full">
                            {notes.length}
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onClick={handleMenuToggle}
                            className="cursor-pointer p-1 rounded hover:bg-(--surface-container-highest) transition-colors"
                            title={t('folderManagement.folderOptions')}
                        >
                            <RxDotsVertical className="w-3 h-3 text-(--on-surface-variant)"/>
                        </button>

                        {isMenuOpen && (
                            <AddNewNote
                                menuRef={menuRef}
                                getMenuPosition={getMenuPosition}
                                updateFolderNameHandler={updateFolderNameHandler}
                                handleDeleteFolder={handleDeleteFolder}
                                isLoading={isLoading}
                                folderId={folder.id}
                                onNoteAdded={handleNoteAdded}
                                onMenuClose={() => {
                                    setIsMenuOpen(false);
                                    onMenuToggle(false);
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Notes List */}
                {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => handleNoteClick(note)}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                    selectedNote === note.id
                                        ? 'bg-(--primary-container) text-(--on-primary-container)'
                                        : 'hover:bg-(--surface-container-high)'
                                }`}
                            >
                                <MdOutlineEditNote className="text-(--tertiary)" size={16}/>
                                <span className="text-sm truncate">{note.title || t('folderManagement.untitled')}</span>
                            </div>
                        ))}
                        {notes.length === 0 && (
                            <div className="text-center py-3 text-(--on-surface-variant) text-sm italic">
                                {t('folderManagement.noNotesInFolder')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}