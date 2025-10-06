import {useEffect, useState} from 'react';
import AddFolderPopupComponent from "./AddFolderPopupComponent.jsx";
import {FaFolder, FaRegFolder} from "react-icons/fa";
import Database from "@tauri-apps/plugin-sql";

export default function SidePanel() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [folders, setFolders] = useState([]); // Changed from folder to folders for clarity
    const [isFolderWindowOpen, setIsFolderWindowOpen] = useState(false);

    const handleAddFolder = () => {
        setIsFolderWindowOpen(true);
    };

    const getAllFolders = async () => {
        try {
            const db = await Database.load("sqlite:fenris_notes.db");
            const dbFolders = await db.select("SELECT * FROM folders");
            setFolders(dbFolders);
        } catch (e) {
            setShowError(true);
            setErrorMessage(`An error occurred. Impossible to load folders: ${e.message}`);
        }
    }

    useEffect(() => {
        getAllFolders();
    }, []);

    // Refresh folders when popup closes
    useEffect(() => {
        if (!isFolderWindowOpen) {
            getAllFolders();
        }
    }, [isFolderWindowOpen]);

    return (
        <>
            {isFolderWindowOpen && (
                <AddFolderPopupComponent
                    isPopupClosed={() => setIsFolderWindowOpen(false)}
                />
            )}

            {/* Side Panel */}
            <div className={`
                fixed lg:relative z-40
                w-64 h-screen bg-(--surface-container) text-(--on-surface) border-r border-(--outline-variant)
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                page-margin lg:ml-20
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-(--outline-variant)">
                    <h2 className="text-lg font-semibold text-(--on-surface)">Workspace</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddFolder}
                            className="cursor-pointer p-2 rounded-lg bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors duration-200"
                            title="Add new folder"
                        >
                            <FaFolder className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Folders Section */}
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-(--on-surface-variant) uppercase tracking-wide mb-3">
                            Folders
                        </h3>

                        {/* Folder items */}
                        <div className="space-y-2">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id} // Use folder.id as key
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer"
                                >
                                    <FaRegFolder className="text-(--primary) flex-shrink-0" />
                                    <span className="text-(--on-surface) truncate">{folder.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Show empty state if no folders */}
                        {folders.length === 0 && !showError && (
                            <div className="text-center py-8">
                                <FaRegFolder className="w-12 h-12 mx-auto text-(--on-surface-variant) mb-3 opacity-50" />
                                <p className="text-(--on-surface-variant) text-sm">No folders yet</p>
                                <p className="text-(--on-surface-variant) text-xs mt-1">Click the folder button to create one</p>
                            </div>
                        )}

                        {/* Error Display */}
                        {showError && (
                            <div className="mt-4 p-3 bg-(--error-container) border border-(--error) rounded-lg">
                                <p className="text-(--on-error-container) text-sm flex items-center">
                                    <span className="w-2 h-2 bg-(--error) rounded-full mr-2"></span>
                                    {errorMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="p-4 border-t border-(--outline-variant)">
                        <h3 className="text-sm font-medium text-(--on-surface-variant) uppercase tracking-wide mb-3">
                            Recent Notes
                        </h3>

                        {/* Placeholder note items */}
                        <div className="space-y-2">
                            <div className="p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <div className="text-(--on-surface) font-medium text-sm">Meeting Notes</div>
                                <div className="text-(--on-surface-variant) text-xs">Updated 2 hours ago</div>
                            </div>

                            <div className="p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <div className="text-(--on-surface) font-medium text-sm">Project Ideas</div>
                                <div className="text-(--on-surface-variant) text-xs">Updated yesterday</div>
                            </div>

                            <div className="p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <div className="text-(--on-surface) font-medium text-sm">Shopping List</div>
                                <div className="text-(--on-surface-variant) text-xs">Updated 3 days ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-(--outline-variant) bg-(--surface-container-low)">
                    <div className="text-xs text-(--on-surface-variant) text-center">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}