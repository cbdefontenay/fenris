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

    // Add state for folder operations
    const [newFolderName, setNewFolderName] = useState(folder.name);
    const [error, setError] = useState('');
    const [isOperationLoading, setIsOperationLoading] = useState(false);

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
        setNewFolderName(folder.name);
        setError('');
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
        if (newFolderName.trim() === '') {
            setError(t('folderManagement.errors.folderNameEmpty'));
            return;
        }

        if (newFolderName.trim() === folder.name) {
            setIsUpdateFolderNameOpen(false);
            return;
        }

        setIsOperationLoading(true);
        setError('');

        try {
            const result = await updateFolderName(newFolderName.trim(), folder.id);

            if (result.success) {
                if (onFolderUpdate) {
                    onFolderUpdate();
                }
                setIsUpdateFolderNameOpen(false);
            } else {
                setError(result.error || t('folderManagement.errors.updateFailed'));
            }
        } catch (error) {
            setError(t('folderManagement.errors.updateFailedWithError', {error: error.message}));
        } finally {
            setIsOperationLoading(false);
        }
    }

    const handleDeleteFolder = async () => {
        // Use the correct dialog function
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

        setIsOperationLoading(true);
        setError('');

        try {
            setIsMenuOpen(false);
            onMenuToggle(false);

            const result = await deleteFolder(folder.id);

            if (result && result.success) {
                if (onFolderUpdate) {
                    onFolderUpdate();
                }
            } else {
                setError(result?.error || t('folderManagement.errors.deleteFailed'));
                setIsMenuOpen(true);
                onMenuToggle(true);
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
            setError(t('folderManagement.errors.deleteFailedWithError', {error: error.message}));
            setIsMenuOpen(true);
            onMenuToggle(true);
        } finally {
            setIsOperationLoading(false);
        }
    }

    const handleCancelUpdate = () => {
        setIsUpdateFolderNameOpen(false);
        setNewFolderName(folder.name);
        setError('');
    }

    const handleInputChange = (e) => {
        setNewFolderName(e.target.value);
        if (error) {
            setError('');
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
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 popup-overlay">
                            <div className="bg-(--surface) text-(--on-surface) rounded-lg shadow-xl p-6 w-96 max-w-full popup-content">
                                <h2 className="text-lg font-semibold mb-4">{t('folderManagement.changeFolderName')}</h2>

                                {error && (
                                    <div className="mb-4 p-3 bg-(--error-container) text-(--on-error-container) rounded-md text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-(--on-surface-variant) mb-2">
                                        {t('folderManagement.newFolderName')}:
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newFolderName}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        disabled={isOperationLoading}
                                        className="w-full p-3 border border-(--outline) rounded-md bg-(--surface-container) text-(--on-surface-container) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) disabled:opacity-50"
                                        placeholder={t('folderManagement.enterFolderName')}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={handleCancelUpdate}
                                        disabled={isOperationLoading}
                                        className="cursor-pointer px-4 py-2 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {t('folderManagement.cancel')}
                                    </button>
                                    <button
                                        onClick={handleSaveFolderName}
                                        disabled={isOperationLoading}
                                        className="cursor-pointer px-4 py-2 bg-(--primary) text-(--on-primary) rounded-md hover:bg-(--primary-dark) transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isOperationLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-(--on-primary) border-t-transparent rounded-full animate-spin"></div>
                                                {t('folderManagement.saving')}
                                            </>
                                        ) : (
                                            t('folderManagement.save')
                                        )}
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
                <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors duration-200">
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
                        <span className="text-xs text-(--on-surface-variant) bg-(--surface-container-highest) px-2 py-1 rounded-full">
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
                                isLoading={isOperationLoading}
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