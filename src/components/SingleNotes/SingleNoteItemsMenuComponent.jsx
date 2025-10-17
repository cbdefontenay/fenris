import {useState, useRef, useEffect} from 'react';
import {MdOutlineEditNote} from "react-icons/md";
import {FaEllipsisV} from "react-icons/fa";
import Database from "@tauri-apps/plugin-sql";
import {invoke} from "@tauri-apps/api/core";
import {useTranslation} from 'react-i18next';

export default function SingleNoteItemsMenuComponent({
                                                         note,
                                                         isAnyMenuOpen,
                                                         onMenuToggle,
                                                         onNoteUpdate,
                                                         onNoteSelect,
                                                         isSelected,
                                                         onNoteDelete
                                                     }) {
    const {t} = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUpdateNotePopupOpen, setIsUpdateNotePopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newSingleNoteName, setNewSingleNoteName] = useState(note.title || "Fenris");
    const [toast, setToast] = useState({show: false, message: '', type: ''});

    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const inputRef = useRef(null);

    const handleNoteClick = async () => {
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const getByIdCmd = await invoke("get_single_note_by_id_sqlite", {noteId: note.id});
            const rows = await db.select(getByIdCmd);
            const fresh = rows && rows[0] ? rows[0] : note;
            if (onNoteSelect) {
                onNoteSelect(fresh);
            }
        } catch (e) {
            if (onNoteSelect) {
                onNoteSelect(note);
            }
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({show: true, message, type});
        setTimeout(() => {
            setToast({show: false, message: '', type: ''});
        }, 3000);
    };

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        onMenuToggle(newState);
    };

    useEffect(() => {
        function handleClickOutsideNoteMenu(event) {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsMenuOpen(false);
                onMenuToggle(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutsideNoteMenu);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideNoteMenu);
        };
    }, [onMenuToggle]);

    useEffect(() => {
        if (isAnyMenuOpen && !isMenuOpen) {
            setIsMenuOpen(false);
        }
    }, [isAnyMenuOpen, isMenuOpen]);

    useEffect(() => {
        if (isUpdateNotePopupOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isUpdateNotePopupOpen]);

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsUpdateNotePopupOpen(true);
        setNewSingleNoteName(note.title);
        setIsMenuOpen(false);
    };

    const handleUpdateSingleNote = async () => {
        if (newSingleNoteName.trim() === '') {
            showToast(t('singleNotes.errors.noteNameEmpty'), 'error');
            return;
        }

        if (newSingleNoteName.trim() === note.title) {
            setIsUpdateNotePopupOpen(false);
            return;
        }

        setIsLoading(true);

        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");

            const updateResultCommand = await invoke("update_single_note", {
                newNoteName: newSingleNoteName.trim(),
                noteId: note.id
            });

            await db.execute(updateResultCommand);

            showToast(t('singleNotes.success.noteUpdated'));

            if (onNoteUpdate) {
                onNoteUpdate();
            }

            setIsUpdateNotePopupOpen(false);

        } catch (e) {
            showToast(t('singleNotes.errors.updateFailed', {error: e.message}), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        const confirmationDialog = await invoke("delete_single_note_dialog", {
            message: t('singleNotes.deleteConfirmation.message'),
            title: t('singleNotes.deleteConfirmation.title'),
            confirmation: t('singleNotes.deleteConfirmation.confirm'),
            cancellation: t('singleNotes.deleteConfirmation.cancel')
        });

        if (!confirmationDialog) {
            return;
        }

        setIsLoading(true);

        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");

            const resultCommand = await invoke("delete_single_note", {
                noteId: note.id
            });

            await db.execute(resultCommand);

            showToast(t('singleNotes.success.noteDeleted'));

            if (onNoteDelete) {
                onNoteDelete(note.id);
            }

            if (onNoteUpdate) {
                onNoteUpdate();
            }

        } catch (e) {
            showToast(t('singleNotes.errors.deleteFailed', { error: e.message }), 'error');
        } finally {
            setIsLoading(false);
            handleMenuToggle();
        }
    };

    const handleCancelUpdate = () => {
        setIsUpdateNotePopupOpen(false);
        setNewSingleNoteName(note.title);
    };

    const handleInputChange = (e) => {
        setNewSingleNoteName(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleUpdateSingleNote();
        }
        if (e.key === 'Escape') {
            handleCancelUpdate();
        }
    };

    const getMenuPosition = () => {
        if (!buttonRef.current) return {top: 0, left: 0};

        const rect = buttonRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX - 130
        };
    };

    return (
        <>
            {/* Update Note Name Popup */}
            {isUpdateNotePopupOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-xl p-4 w-96">
                        <h2 className="text-lg font-semibold mb-4">
                            {t('singleNotes.updateNoteTitle')}
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-(--on-surface-variant) mb-2">
                                {t('singleNotes.newNoteName')}:
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={newSingleNoteName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="w-full p-3 border border-(--outline-variant) rounded-md bg-(--surface) text-(--on-surface) focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-colors"
                                disabled={isLoading}
                                placeholder={t('singleNotes.enterNoteName')}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancelUpdate}
                                disabled={isLoading}
                                className="cursor-pointer px-4 py-2 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-md transition-colors disabled:opacity-50"
                            >
                                {t('singleNotes.cancel')}
                            </button>
                            <button
                                onClick={handleUpdateSingleNote}
                                disabled={isLoading || !newSingleNoteName.trim()}
                                className="cursor-pointer px-4 py-2 bg-(--tertiary) text-(--on-tertiary) rounded-md hover:bg-(--secondary) transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div
                                            className="animate-spin h-4 w-4 border-2 border-(--on-tertiary) border-t-transparent rounded-full"></div>
                                        <span>{t('singleNotes.saving')}</span>
                                    </>
                                ) : (
                                    t('singleNotes.save')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Toast */}
            {toast.show && (
                <div
                    className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 ${
                        toast.type === 'error'
                            ? 'bg-(--error-container) text-(--on-error-container) border-(--error)'
                            : 'bg-(--secondary-container) text-(--on-secondary-container) border-(--secondary)'
                    }`}>
                    {toast.message}
                </div>
            )}

            {/* Note Item */}
            <div
                className={`group flex items-center justify-between p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                    isSelected
                        ? 'bg-(--primary-container) text-(--on-primary-container)'
                        : 'hover:bg-(--surface-container-high)'
                }`}
                onClick={handleNoteClick}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MdOutlineEditNote className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-(--on-primary-container)' : 'text-(--secondary)'
                    }`}/>
                    <span className="text-sm font-medium truncate">
                        {note.title}
                    </span>
                    {note.tag && (
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                isSelected
                                    ? 'text-(--on-primary-container) bg-(--primary-fixed)'
                                    : 'text-(--primary) bg-(--primary-container)'
                            }`}>
                            #{note.tag}
                        </span>
                    )}
                </div>

                <div className="relative">
                    <button
                        ref={buttonRef}
                        onClick={handleMenuToggle}
                        className={`cursor-pointer p-1 rounded transition-colors ${
                            isSelected
                                ? 'hover:bg-(--primary-fixed) opacity-100'
                                : 'hover:bg-(--surface-container-highest) opacity-0 group-hover:opacity-100'
                        }`}
                        disabled={isLoading}
                    >
                        <FaEllipsisV className={`w-3 h-3 ${
                            isSelected ? 'text-(--on-primary-container)' : 'text-(--on-surface-variant)'
                        }`}/>
                    </button>

                    {/* Fixed positioned menu */}
                    {isMenuOpen && (
                        <div
                            ref={menuRef}
                            style={{
                                position: 'fixed',
                                top: `${getMenuPosition().top}px`,
                                left: `${getMenuPosition().left}px`,
                                zIndex: 1000
                            }}
                            className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-lg py-1 min-w-32"
                        >
                            <button
                                onClick={handleEditClick}
                                className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm"
                                disabled={isLoading}
                            >
                                {t('singleNotes.edit')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="cursor-pointer w-full text-left px-3 py-2 text-(--error) hover:bg-(--error-container) text-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? t('singleNotes.deleting') : t('singleNotes.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}