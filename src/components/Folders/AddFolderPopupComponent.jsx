import {RiCloseLargeFill} from "react-icons/ri";
import {FaFolder, FaSpinner} from "react-icons/fa";
import Database from '@tauri-apps/plugin-sql';
import {useState, useEffect} from "react";
import {invoke} from "@tauri-apps/api/core";
import {useTranslation} from 'react-i18next';

export default function AddFolderPopupComponent({isPopupClosed}) {
    const {t} = useTranslation();
    const [folderState, setFolderState] = useState({
        folderName: "",
        isLoading: false,
        showError: false,
        errorMessage: ""
    });

    useEffect(() => {
        loadFolderState();
    }, []);

    async function loadFolderState() {
        try {
            const state = await invoke("get_folder_state");
            setFolderState(prev => ({
                ...prev,
                folderName: state.folder_name || "",
                showError: state.show_error || false,
                errorMessage: state.error_message || ""
            }));
        } catch (error) {
            console.error("Failed to load folder state:", error);
            setFolderState(prev => ({
                ...prev,
                folderName: "",
                showError: false,
                errorMessage: ""
            }));
        }
    }

    async function updateFolderName(name) {
        try {
            const newState = await invoke("set_folder_name", {folderName: name});
            setFolderState(prev => ({
                ...prev,
                folderName: newState.folder_name || "",
                showError: newState.show_error || false,
                errorMessage: newState.error_message || ""
            }));
        } catch (error) {
            console.error("Failed to update folder name:", error);
        }
    }

    async function saveFolder() {
        try {
            await invoke("validate_folder_name");
        } catch (error) {
            setFolderState(prev => ({
                ...prev,
                showError: true,
                errorMessage: t('addFolderPopup.errors.folderNameEmpty')
            }));
            return;
        }

        setFolderState(prev => ({...prev, isLoading: true}));

        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const saveFolderFromRust = await invoke("save_folder_sqlite", {
                folderName: folderState.folderName.trim(),
            });

            await db.execute(saveFolderFromRust);

            await invoke("reset_folder_state");
            isPopupClosed();
        } catch (e) {
            const errorMessage = e.toString().includes('UNIQUE') ||
            e.toString().includes('unique') ||
            e.toString().includes('duplicate')
                ? t('addFolderPopup.errors.folderNameExists')
                : t('addFolderPopup.errors.createFailed', {error: e.toString()});

            setFolderState(prev => ({
                ...prev,
                showError: true,
                errorMessage
            }));
        } finally {
            setFolderState(prev => ({...prev, isLoading: false}));
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !folderState.isLoading && folderState.folderName.trim()) {
            saveFolder();
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        await updateFolderName(value);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !folderState.isLoading) {
            // Reset state when closing
            invoke("reset_folder_state").catch(console.error);
            isPopupClosed();
        }
    };

    const handleKeyPressClose = (e) => {
        if (e.key === 'Escape') {
            invoke("reset_folder_state").catch(console.error);
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
                    <h2 className="text-xl font-semibold text-(--on-surface)">{t('addFolderPopup.createNewFolder')}</h2>
                    <button
                        className="cursor-pointer p-2 rounded-full hover:bg-(--surface-container-high) transition-colors duration-200"
                        onClick={() => {
                            invoke("reset_folder_state").catch(console.error);
                            isPopupClosed();
                        }}
                        disabled={folderState.isLoading}
                    >
                        <RiCloseLargeFill className="text-(--on-surface-variant) text-xl"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Input Group */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-(--on-surface-variant) block">
                            {t('addFolderPopup.folderName')}
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <FaFolder className="text-(--primary) text-lg"/>
                            </div>
                            <input
                                value={folderState.folderName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder={t('addFolderPopup.enterFolderName')}
                                className="w-full pl-10 pr-4 py-3 border border-(--outline) rounded-xl bg-(--surface-container-low) text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200"
                                disabled={folderState.isLoading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    {folderState.showError && (
                        <div className="p-3 bg-(--error-container) border border-(--error) rounded-lg">
                            <p className="text-(--on-error-container) text-sm flex items-center">
                                <span className="w-2 h-2 bg-(--error) rounded-full mr-2"></span>
                                {folderState.errorMessage}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-3 p-6 border-t border-(--outline-variant) bg-(--surface-container-low) rounded-b-2xl">
                    <button
                        onClick={() => {
                            invoke("reset_folder_state").catch(console.error);
                            isPopupClosed();
                        }}
                        disabled={folderState.isLoading}
                        className="cursor-pointer px-6 py-2.5 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                        {t('addFolderPopup.cancel')}
                    </button>
                    <button
                        onClick={saveFolder}
                        disabled={folderState.isLoading || !folderState.folderName.trim()}
                        className="cursor-pointer px-6 py-2.5 bg-(--primary) text-(--on-primary) hover:bg-(--primary-dark) rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                        {folderState.isLoading ? (
                            <>
                                <FaSpinner className="animate-spin"/>
                                {t('addFolderPopup.creating')}
                            </>
                        ) : (
                            t('addFolderPopup.createFolder')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}