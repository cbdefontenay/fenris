import {FaChevronDown, FaChevronRight, FaFolder, FaRegFolder, FaRegFolderOpen} from "react-icons/fa";
import FolderItemsMenuComponent from "./FolderItemsMenuComponent.jsx";
import {MdOutlineEditNote} from "react-icons/md";
import SingleNoteItemsMenuComponent from "./SingleNoteItemsMenuComponent.jsx";
import {IoMdRefresh} from "react-icons/io";
import AddNotePopupComponent from "./AddNotePopupComponent.jsx";
import AddFolderPopupComponent from "./AddFolderPopupComponent.jsx";
import {useEffect, useState} from "react";
import Database from "@tauri-apps/plugin-sql";
import {invoke} from "@tauri-apps/api/core";

export default function SidePanel({ onNoteSelect }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [folders, setFolders] = useState([]);
    const [singleNotes, setSingleNotes] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const [isFolderWindowOpen, setIsFolderWindowOpen] = useState(false);
    const [isNoteWindowOpen, setIsNoteWindowOpen] = useState(false);
    const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
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
            const getAllFolderCommandFromRust = await invoke("get_all_folders")
            const dbFolders = await db.select(getAllFolderCommandFromRust);
            setFolders(dbFolders);
        } catch (e) {
            setShowError(true);
            setErrorMessage(`An error occurred. Impossible to load folders: ${e.message}`);
        }
    }

    const getAllSingleNotes = async () => {
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            const getAllFSingleNoteCommandFromRust = await invoke("get_all_single_note")
            const dbNotes = await db.select(getAllFSingleNoteCommandFromRust);
            setSingleNotes(dbNotes);
        } catch (e) {
            setShowError(true);
            setErrorMessage(`An error occurred. Impossible to load notes: ${e.message}`);
        }
    }

    const getRecentItems = async () => {
        try {
            const db = await Database.load("sqlite:fenris_app_notes.db");
            // Get recent items from both folders and single_notes, limited to 3
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

    useEffect(() => {
        refreshAll();
    }, []);

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
                <div className="flex justify-around p-4 border-b border-(--outline-variant) w-full">
                    <div className="flex flex-row gap-10">
                        <button
                            onClick={handleAddNote}
                            className="cursor-pointer p-2 rounded-lg bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors duration-200"
                            title="Add new note"
                        >
                            <MdOutlineEditNote className="" size={20}/>
                        </button>
                        <button
                            onClick={handleAddFolder}
                            className="cursor-pointer p-2 rounded-lg bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors duration-200"
                            title="Add new folder"
                        >
                            <FaRegFolderOpen className="" size={20}/>
                        </button>
                        <button
                            onClick={refreshAll}
                            className="cursor-pointer p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors duration-200"
                            title="Refresh"
                        >
                            <IoMdRefresh className="text-(--on-surface-variant)" size={20}/>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Single Notes Section - Accordion */}
                    <div className="border-b border-(--outline-variant)">
                        <button
                            onClick={() => setIsSingleNotesOpen(!isSingleNotesOpen)}
                            className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-(--surface-container-high) transition-colors duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <MdOutlineEditNote className="text-(--tertiary)" size={24}/>
                                <span className="text-sm font-medium text-(--on-surface)">Single Notes</span>
                                <span
                                    className="text-xs bg-(--tertiary-fixed) text-(--on-tertiary-fixed) px-2 py-1 rounded-full">
                                    {singleNotes.length}
                                </span>
                            </div>
                            {isSingleNotesOpen ? (
                                <FaChevronDown className="text-(--tertiary)"/>
                            ) : (
                                <FaChevronRight className="text-(--tertiary)"/>
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
                                            onNoteSelect={onNoteSelect} // Add this line
                                        />
                                    ))}
                                </div>

                                {/* Show empty state if no single notes */}
                                {singleNotes.length === 0 && !showError && (
                                    <div className="text-center py-6">
                                        <MdOutlineEditNote
                                            className="mx-auto text-(--tertiary) mb-2 opacity-50" size={35}/>
                                        <p className="text-(--tertiary) text-sm">No single notes yet</p>
                                        <p className="text-(--tertiary) italic text-xs mt-1">Create your first
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
                            className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-(--surface-container-highest) transition-colors duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <FaFolder className="text-(--primary)" size={20}/>
                                <span className="text-sm font-medium text-(--on-surface)">Folders</span>
                                <span
                                    className="text-xs bg-(--primary-container) text-(--on-primary-container) px-2 py-1 rounded-full">
                                    {folders.length}
                                </span>
                            </div>
                            {isFoldersOpen ? (
                                <FaChevronDown className="text-(--primary)"/>
                            ) : (
                                <FaChevronRight className="text-(--primary)"/>
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
                                            onNoteSelect={onNoteSelect}
                                        />
                                    ))}
                                </div>

                                {/* Show empty state if no folders */}
                                {folders.length === 0 && !showError && (
                                    <div className="text-center py-6">
                                        <FaRegFolder
                                            size={35}
                                            className="mx-auto text-(--primary) mb-2 opacity-50"/>
                                        <p className="text-(--primary) text-sm">No folders yet</p>
                                        <p className="text-(--primary) italic text-xs mt-1">Create your first
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
            </div>
        </>
    );
}