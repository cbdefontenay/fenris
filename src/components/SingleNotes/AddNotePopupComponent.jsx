import {RiCloseLargeFill} from "react-icons/ri";
import {FaSpinner} from "react-icons/fa";
import Database from '@tauri-apps/plugin-sql';
import {useState, useEffect} from "react";
import {invoke} from "@tauri-apps/api/core";
import {MdOutlineEditNote} from "react-icons/md";
import {useTranslation} from 'react-i18next';

export default function AddNotePopupComponent({isPopupClosed}) {
    const {t} = useTranslation();
    const [noteState, setNoteState] = useState({
        noteName: "",
        isLoading: false,
        showError: false,
        errorMessage: ""
    });

    // Load initial state from Rust
    useEffect(() => {
        loadNoteState();
    }, []);

    async function loadNoteState() {
        try {
            const state = await invoke("get_note_state");
            setNoteState(prev => ({
                ...prev,
                noteName: state.note_name,
                showError: state.show_error,
                errorMessage: state.error_message
            }));
        } catch (error) {
            console.error("Failed to load note state:", error);
        }
    }

    async function updateNoteName(name) {
        try {
            const newState = await invoke("set_note_name", { noteName: name });
            setNoteState(prev => ({
                ...prev,
                noteName: newState.note_name,
                showError: newState.show_error,
                errorMessage: newState.error_message
            }));
        } catch (error) {
            console.error("Failed to update note name:", error);
        }
    }

    async function saveNote() {
        try {
            await invoke("validate_note_name");
        } catch (error) {
            setNoteState(prev => ({
                ...prev,
                showError: true,
                errorMessage: t('addNotePopup.errors.noteNameEmpty')
            }));
            return;
        }

        setNoteState(prev => ({ ...prev, isLoading: true }));

        try {
            const dateNow = await invoke("cli_date_without_hours");
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const createNewNoteFromRust = await invoke("create_single_note", {
                noteName: noteState.noteName.trim(),
                content: ""
            });
            await db.execute(createNewNoteFromRust);

            // Reset Rust state on success
            await invoke("reset_note_state");
            isPopupClosed();
        } catch (e) {
            setNoteState(prev => ({
                ...prev,
                showError: true,
                errorMessage: e.message.includes("UNIQUE")
                    ? t('addNotePopup.errors.noteNameExists')
                    : t('addNotePopup.errors.createFailed', {error: e.message})
            }));
        } finally {
            setNoteState(prev => ({ ...prev, isLoading: false }));
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !noteState.isLoading && noteState.noteName.trim()) {
            saveNote();
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        await updateNoteName(value);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !noteState.isLoading) {
            // Reset state when closing
            invoke("reset_note_state").catch(console.error);
            isPopupClosed();
        }
    };

    const handleKeyPressClose = (e) => {
        if (e.key === 'Escape') {
            invoke("reset_note_state").catch(console.error);
            isPopupClosed();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyPressClose}
        >
            <div
                className="bg-(--surface) rounded-2xl w-full max-w-md border border-(--outline-variant) shadow-2xl transform transition-all duration-200 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--outline-variant)">
                    <h2 className="text-xl font-semibold text-(--on-surface)">{t('addNotePopup.createNewNote')}</h2>
                    <button
                        className="cursor-pointer p-2 rounded-full hover:bg-(--surface-container-high) transition-colors duration-200"
                        onClick={() => {
                            invoke("reset_note_state").catch(console.error);
                            isPopupClosed();
                        }}
                        disabled={noteState.isLoading}
                    >
                        <RiCloseLargeFill className="text-(--on-surface-variant) text-xl"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Input Group */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-(--on-surface-variant) block">
                            {t('addNotePopup.noteName')}
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <MdOutlineEditNote className="text-(--primary) text-lg"/>
                            </div>
                            <input
                                value={noteState.noteName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder={t('addNotePopup.enterNoteName')}
                                className="w-full pl-10 pr-4 py-3 border border-(--outline) rounded-xl bg-(--surface-container-low) text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200"
                                disabled={noteState.isLoading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    {noteState.showError && (
                        <div className="p-3 bg-(--error) border border-(--error-container) rounded-lg">
                            <p className="text-(--on-error) text-sm flex items-center">
                                <span className="w-2 h-2 bg-(--error) rounded-full mr-2"></span>
                                {noteState.errorMessage}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-3 p-6 border-t border-(--outline-variant) bg-(--surface-container-low) rounded-b-2xl">
                    <button
                        onClick={() => {
                            invoke("reset_note_state").catch(console.error);
                            isPopupClosed();
                        }}
                        disabled={noteState.isLoading}
                        className="cursor-pointer px-6 py-2.5 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                        {t('addNotePopup.cancel')}
                    </button>
                    <button
                        onClick={saveNote}
                        disabled={noteState.isLoading || !noteState.noteName.trim()}
                        className="cursor-pointer px-6 py-2.5 bg-(--primary) text-(--on-primary) hover:bg-(--primary-dark) rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                        {noteState.isLoading ? (
                            <>
                                <FaSpinner className="animate-spin"/>
                                {t('addNotePopup.creating')}
                            </>
                        ) : (
                            t('addNotePopup.createNote')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}