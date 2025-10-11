import {useState, useEffect, useRef} from 'react';
import {FaRegFolder} from "react-icons/fa";
import {RxDotsVertical} from "react-icons/rx";
import {deleteFolder, updateFolderName} from "../data/CreateNotesDataShell.jsx";
import {invoke} from "@tauri-apps/api/core";

export default function FolderItemsMenuComponent({folder, isAnyMenuOpen, onMenuToggle, onFolderUpdate}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUpdateFolderNameMenuOpen, setIsUpdateFolderNameOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState(folder.name || '');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddNotePopupOpen, setIsAddNotePopupOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
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

    // Focus input when modal opens
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

    const updateFolderNameHandler = () => {
        setIsUpdateFolderNameOpen(true);
        setError('');
        setIsMenuOpen(false);
    }

    const handleSaveFolderName = async () => {
        if (newFolderName.trim() === '') {
            setError('Folder name cannot be empty');
            return;
        }

        if (newFolderName.trim() === folder.name) {
            setIsUpdateFolderNameOpen(false);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await updateFolderName(newFolderName.trim(), folder.id);

            if (result.success) {
                if (onFolderUpdate) {
                    onFolderUpdate();
                }
                setIsUpdateFolderNameOpen(false);
                setNewFolderName(folder.name);
            } else {
                setError(result.error || 'Failed to update folder name');
            }
        } catch (error) {
            setError('Error updating folder name: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteFolder = async () => {
        const confirmationDialog = await invoke("delete_folder_dialog", {
            message: `Are you sure you want to delete the folder `,
            title: "Delete Folder",
            confirmation: "Delete",
            cancellation: "Cancel",
            folderName: folder.name
        });

        if (!confirmationDialog) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            setIsMenuOpen(false);
            onMenuToggle(false);

            const result = await deleteFolder(folder.id);

            if (result && result.success) {
                // Refresh the folder list
                if (onFolderUpdate) {
                    onFolderUpdate();
                }
            } else {
                setError(result?.error || 'Failed to delete folder');
                setIsMenuOpen(true);
                onMenuToggle(true);
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
            setError('Error deleting folder: ' + error.message);
            setIsMenuOpen(true);
            onMenuToggle(true);
        } finally {
            setIsLoading(false);
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
            handleSaveFolderName().then(r => `Saved folder name: ${r}`);
        }
        if (e.key === 'Escape') {
            handleCancelUpdate();
        }
    }

    return (
        <>
            {isUpdateFolderNameMenuOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-xl p-4 w-96">
                        <h2 className="text-lg font-semibold mb-4">
                            Change Folder's Name
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-(--on-surface-variant) mb-2">
                                New Folder Name:
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={newFolderName}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className={`w-full p-3 border rounded-md bg-(--surface) text-(--on-surface) transition-colors ${
                                    error
                                        ? 'border-(--error) focus:border-(--error) focus:ring-1 focus:ring-(--error)'
                                        : 'border-(--outline-variant) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)'
                                }`}
                                disabled={isLoading}
                                placeholder="Enter folder name..."
                            />
                            {error && (
                                <div className="mt-2 flex items-center space-x-1">
                                    <span className="text-(--error) text-sm flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                        {error}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancelUpdate}
                                disabled={isLoading}
                                className="cursor-pointer px-4 py-2 text-(--on-surface-variant) hover:bg-(--surface-container-high) hover:text-(--error) rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveFolderName}
                                disabled={isLoading || !newFolderName.trim()}
                                className="cursor-pointer px-4 py-2 bg-(--tertiary) text-(--on-tertiary) rounded-md hover:bg-(--secondary) hover:text-(--on-secondary) transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-(--on-tertiary)" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="group flex items-center justify-between p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors duration-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FaRegFolder className="text-(--primary) flex-shrink-0"/>
                    <span className="text-(--on-surface) text-sm font-medium truncate">
                        {folder.name}
                    </span>
                </div>

                <div className="relative">
                    <button
                        ref={buttonRef}
                        onClick={handleMenuToggle}
                        className="cursor-pointer p-1 rounded hover:bg-(--surface-container-highest) transition-colors"
                        title="Folder options"
                    >
                        <RxDotsVertical className="w-3 h-3 text-(--on-surface-variant)"/>
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
                            className="bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-xl py-1 min-w-32"
                        >
                            <button
                                className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm"
                                onClick={() => {/* Add note logic */
                                }}
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
                    )}
                </div>
            </div>
        </>
    );
}