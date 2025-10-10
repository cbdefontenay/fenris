import {useEffect, useState} from 'react';
import AddFolderPopupComponent from "./AddFolderPopupComponent.jsx";
import {FaFolder, FaRegFolder, FaChevronDown, FaChevronRight} from "react-icons/fa";
import Database from "@tauri-apps/plugin-sql";
import {IoMdRefresh} from "react-icons/io";
import FolderItemsMenuComponent from "./FolderItemsMenuComponent.jsx";
import AddNotePopupComponent from "./AddNotePopupComponent.jsx";
import {MdOutlineEditNote} from "react-icons/md";
import SingleNoteItemsMenuComponent from "./SingleNoteItemsMenuComponent.jsx"; // You'll need to create this

export default function SidePanel() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [folders, setFolders] = useState([]);
    const [singleNotes, setSingleNotes] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const [isFolderWindowOpen, setIsFolderWindowOpen] = useState(false);
    const [isNoteWindowOpen, setIsNoteWindowOpen] = useState(false);
    const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);

    // Accordion states
    const [isSingleNotesOpen, setIsSingleNotesOpen] = useState(false);
    const [isFoldersOpen, setIsFoldersOpen] = useState(false);

    const handleAddFolder = () => {
        setIsFolderWindowOpen(true);
    };

    const handleAddNote = () => {
        setIsNoteWindowOpen(true);
    };

    const getAllFolders = async () => {
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const dbFolders = await db.select("SELECT * FROM folders ORDER BY date_created DESC");
            setFolders(dbFolders);
        } catch (e) {
            setShowError(true);
            setErrorMessage(`An error occurred. Impossible to load folders: ${e.message}`);
        }
    }

    const getAllSingleNotes = async () => {
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const dbNotes = await db.select("SELECT * FROM single_notes ORDER BY date_created DESC");
            setSingleNotes(dbNotes);
        } catch (e) {
            setShowError(true);
            setErrorMessage(`An error occurred. Impossible to load notes: ${e.message}`);
        }
    }

    const getRecentItems = async () => {
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            // Get recent items from both folders and single_notes, limited to 5
            const recentFolders = await db.select(`
                SELECT id, name, date_modified, 'folder' as type
                FROM folders
                ORDER BY date_modified DESC LIMIT 3
            `);
            const recentNotes = await db.select(`
                SELECT id, title as name, date_modified, 'note' as type
                FROM single_notes
                ORDER BY date_modified DESC LIMIT 3
            `);

            // Combine and sort by date_modified
            const allRecent = [...recentFolders, ...recentNotes]
                .sort((a, b) => new Date(b.date_modified) - new Date(a.date_modified))
                .slice(0, 5);

            setRecentItems(allRecent);
        } catch (e) {
            console.error("Error loading recent items:", e);
        }
    }

    const refreshAll = () => {
        getAllFolders();
        getAllSingleNotes();
        getRecentItems();
    }

    const handleMenuToggle = (isOpen) => {
        setIsAnyMenuOpen(isOpen);
    };

    // Format date to relative time (like "2 hours ago")
    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        }
    };

    const getItemIcon = (type) => {
        return type === 'folder' ? <FaFolder className="w-3 h-3 text-(--primary)"/> :
            <MdOutlineEditNote className="w-3 h-3 text-(--secondary)"/>;
    };

    useEffect(() => {
        refreshAll();
    }, []);

    // Refresh data when popups close
    useEffect(() => {
        if (!isFolderWindowOpen && !isNoteWindowOpen) {
            refreshAll();
        }
    }, [isFolderWindowOpen, isNoteWindowOpen]);

    return (
        <>
            {isFolderWindowOpen && (
                <AddFolderPopupComponent
                    isPopupClosed={() => setIsFolderWindowOpen(false)}
                />
            )}
            {isNoteWindowOpen && (
                <AddNotePopupComponent
                    isPopupClosed={() => setIsNoteWindowOpen(false)}
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
                    <div className="flex flex-row items-center gap-2">
                        <button
                            onClick={handleAddNote}
                            className="cursor-pointer p-2 rounded-lg bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors duration-200"
                            title="Add new note"
                        >
                            <MdOutlineEditNote className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={handleAddFolder}
                            className="cursor-pointer p-2 rounded-lg bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors duration-200"
                            title="Add new folder"
                        >
                            <FaFolder className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={refreshAll}
                            className="cursor-pointer p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors duration-200"
                            title="Refresh"
                        >
                            <IoMdRefresh className="w-4 h-4 text-(--on-surface-variant)"/>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Single Notes Section - Accordion */}
                    <div className="border-b border-(--outline-variant)">
                        <button
                            onClick={() => setIsSingleNotesOpen(!isSingleNotesOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-(--surface-container-high) transition-colors duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <MdOutlineEditNote className="w-4 h-4 text-(--secondary)"/>
                                <span className="text-sm font-medium text-(--on-surface)">Single Notes</span>
                                <span
                                    className="text-xs bg-(--secondary-container) text-(--on-secondary-container) px-2 py-1 rounded-full">
                                    {singleNotes.length}
                                </span>
                            </div>
                            {isSingleNotesOpen ? (
                                <FaChevronDown className="w-3 h-3 text-(--on-surface-variant)"/>
                            ) : (
                                <FaChevronRight className="w-3 h-3 text-(--on-surface-variant)"/>
                            )}
                        </button>

                        {isSingleNotesOpen && (
                            <div className="px-4 pb-4">
                                <div className="space-y-1">
                                    {singleNotes.map((note) => (
                                        <SingleNoteItemsMenuComponent
                                            key={note.id}
                                            note={note}
                                            isAnyMenuOpen={isAnyMenuOpen}
                                            onMenuToggle={handleMenuToggle}
                                            onNoteUpdate={getAllSingleNotes}
                                        />
                                    ))}
                                </div>

                                {/* Show empty state if no single notes */}
                                {singleNotes.length === 0 && !showError && (
                                    <div className="text-center py-6">
                                        <MdOutlineEditNote
                                            className="w-8 h-8 mx-auto text-(--on-surface-variant) mb-2 opacity-50"/>
                                        <p className="text-(--on-surface-variant) text-sm">No single notes yet</p>
                                        <p className="text-(--on-surface-variant) text-xs mt-1">Create your first
                                            note</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Folders Section - Accordion */}
                    <div className="border-b border-(--outline-variant)">
                        <button
                            onClick={() => setIsFoldersOpen(!isFoldersOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-(--surface-container-high) transition-colors duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <FaFolder className="w-4 h-4 text-(--primary)"/>
                                <span className="text-sm font-medium text-(--on-surface)">Folders</span>
                                <span
                                    className="text-xs bg-(--primary-container) text-(--on-primary-container) px-2 py-1 rounded-full">
                                    {folders.length}
                                </span>
                            </div>
                            {isFoldersOpen ? (
                                <FaChevronDown className="w-3 h-3 text-(--on-surface-variant)"/>
                            ) : (
                                <FaChevronRight className="w-3 h-3 text-(--on-surface-variant)"/>
                            )}
                        </button>

                        {isFoldersOpen && (
                            <div className="px-4 pb-4">
                                <div className="space-y-1">
                                    {folders.map((folder) => (
                                        <FolderItemsMenuComponent
                                            key={folder.id}
                                            folder={folder}
                                            isAnyMenuOpen={isAnyMenuOpen}
                                            onMenuToggle={handleMenuToggle}
                                            onFolderUpdate={getAllFolders}
                                        />
                                    ))}
                                </div>

                                {/* Show empty state if no folders */}
                                {folders.length === 0 && !showError && (
                                    <div className="text-center py-6">
                                        <FaRegFolder
                                            className="w-8 h-8 mx-auto text-(--on-surface-variant) mb-2 opacity-50"/>
                                        <p className="text-(--on-surface-variant) text-sm">No folders yet</p>
                                        <p className="text-(--on-surface-variant) text-xs mt-1">Create your first
                                            folder</p>
                                    </div>
                                )}

                                {/* Error Display */}
                                {showError && (
                                    <div className="mt-3 p-3 bg-(--error-container) border border-(--error) rounded-lg">
                                        <p className="text-(--on-error-container) text-sm flex items-center">
                                            <span className="w-2 h-2 bg-(--error) rounded-full mr-2"></span>
                                            {errorMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Items Section - Always at bottom, not scrollable */}
                <div className="border-t border-(--outline-variant) bg-(--surface-container-low)">
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-(--on-surface-variant) uppercase tracking-wide mb-3">
                            Recently Updated
                        </h3>
                        <div className="space-y-2">
                            {recentItems.map((item, index) => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer group"
                                >
                                    {getItemIcon(item.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-(--on-surface) text-sm font-medium truncate">
                                            {item.name}
                                        </div>
                                        <div className="text-(--on-surface-variant) text-xs">
                                            {formatRelativeTime(item.date_modified)}
                                        </div>
                                    </div>
                                    <div
                                        className="text-xs text-(--on-surface-variant) px-2 py-1 rounded bg-(--surface-container-high) capitalize">
                                        {item.type}
                                    </div>
                                </div>
                            ))}

                            {recentItems.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-(--on-surface-variant) text-sm">No recent activity</p>
                                </div>
                            )}
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