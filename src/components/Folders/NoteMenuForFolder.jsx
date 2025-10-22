import {useEffect, useRef, useState} from "react";
import Database from "@tauri-apps/plugin-sql";

export default function NotesMenuForFolder({
                                               isNoteMenuOpen,
                                               setIsNoteMenuOpen,
                                               noteId,
                                               folderId,
                                               onNoteUpdated,
                                               onNoteDeleted,
                                               onNoteEdit,
                                               buttonRef
                                           }) {
    const menuRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const getMenuPosition = () => {
        if (!buttonRef) return {top: 0, left: 0};

        const rect = buttonRef.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX - 130
        };
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const db = await Database.load("sqlite:fenris_app_notes.db");

            const deleteQuery = "DELETE FROM note WHERE id = ?";
            await db.execute(deleteQuery, [noteId]);

            if (onNoteDeleted) {
                onNoteDeleted(noteId);
            }

            setIsNoteMenuOpen(false);
        } catch (error) {
            console.error("Error deleting note:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = async () => {
        // Trigger edit mode in parent component
        if (onNoteEdit) {
            onNoteEdit(noteId);
        }
        setIsNoteMenuOpen(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef && !buttonRef.contains(event.target)) {
                setIsNoteMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setIsNoteMenuOpen, buttonRef]);

    return (
        <>
            {
                isNoteMenuOpen && (
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
                            disabled={isLoading}
                            className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm disabled:opacity-50"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="cursor-pointer w-full text-left px-3 py-2 text-(--error) hover:bg-(--error-container) text-sm disabled:opacity-50"
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )
            }
        </>
    );
}