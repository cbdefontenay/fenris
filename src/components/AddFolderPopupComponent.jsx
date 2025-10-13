import {RiCloseLargeFill} from "react-icons/ri";
import {FaFolder, FaSpinner} from "react-icons/fa";
import Database from '@tauri-apps/plugin-sql';
import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import { useTranslation } from 'react-i18next';

export default function AddFolderPopupComponent({isPopupClosed}) {
    const { t } = useTranslation();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [folderName, setFolderName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function saveFolder() {
        if (!folderName.trim()) {
            setShowError(true);
            setErrorMessage(t('addFolderPopup.errors.folderNameEmpty'));
            return;
        }

        setIsLoading(true);
        setShowError(false);

        try {
            const dateNow = await invoke("cli_date_without_hours");
            const db = await Database.load("sqlite:fenris_app_notes.db");

            await db.execute("INSERT INTO folders (name, date_created) VALUES ($1, $2)", [
                folderName.trim(), dateNow
            ]);

            isPopupClosed();
        } catch (e) {
            setShowError(true);
            setErrorMessage(e.message.includes("UNIQUE")
                ? t('addFolderPopup.errors.folderNameExists')
                : t('addFolderPopup.errors.createFailed', { error: e.message })
            );
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading && folderName.trim()) {
            saveFolder();
        }
    };

    const handleInputChange = (e) => {
        setFolderName(e.target.value);
        if (showError) setShowError(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            isPopupClosed();
        }
    };

    const handleKeyPressClose = (e) => {
        if (e.key === 'Escape') {
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
                        onClick={isPopupClosed}
                        disabled={isLoading}
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
                                value={folderName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder={t('addFolderPopup.enterFolderName')}
                                className="w-full pl-10 pr-4 py-3 border border-(--outline) rounded-xl bg-(--surface-container-low) text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    {showError && (
                        <div className="p-3 bg-(--error-container) border border-(--error) rounded-lg">
                            <p className="text-(--on-error-container) text-sm flex items-center">
                                <span className="w-2 h-2 bg-(--error) rounded-full mr-2"></span>
                                {errorMessage}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-3 p-6 border-t border-(--outline-variant) bg-(--surface-container-low) rounded-b-2xl">
                    <button
                        onClick={isPopupClosed}
                        disabled={isLoading}
                        className="cursor-pointer px-6 py-2.5 text-(--on-surface-variant) hover:bg-(--surface-container-high) rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                        {t('addFolderPopup.cancel')}
                    </button>
                    <button
                        onClick={saveFolder}
                        disabled={isLoading || !folderName.trim()}
                        className="cursor-pointer px-6 py-2.5 bg-(--primary) text-(--on-primary) hover:bg-(--primary-dark) rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                        {isLoading ? (
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