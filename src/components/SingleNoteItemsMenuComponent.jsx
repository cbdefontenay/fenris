import {useState} from 'react';
import {MdOutlineEditNote} from "react-icons/md";
import {FaEllipsisV} from "react-icons/fa";

export default function SingleNoteItemsMenuComponent({note, isAnyMenuOpen, onMenuToggle, onNoteUpdate}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        onMenuToggle(newState);
    };

    const handleEdit = () => {
        console.log('Edit note:', note.id);
        handleMenuToggle();
    };

    const handleDelete = () => {
        console.log('Delete note:', note.id);
        handleMenuToggle();
    };

    return (
        <div
            className="group flex items-center justify-between p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors duration-200">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <MdOutlineEditNote className="w-4 h-4 text-(--secondary) flex-shrink-0"/>
                <span className="text-(--on-surface) text-sm font-medium truncate">
                    {note.title}
                </span>
                {note.tag && (
                    <span
                        className="text-xs text-(--primary) bg-(--primary-container) px-2 py-0.5 rounded-full flex-shrink-0">
                        #{note.tag}
                    </span>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={handleMenuToggle}
                    className="cursor-pointer p-1 rounded hover:bg-(--surface-container-highest) transition-colors opacity-0 group-hover:opacity-100">
                    <FaEllipsisV className="w-3 h-3 text-(--on-surface-variant)"/>
                </button>
                {isMenuOpen && (
                    <div
                        className="absolute right-0 top-6 z-10 bg-(--surface-container) border border-(--outline-variant) rounded-lg shadow-lg py-1 min-w-32">
                        <button
                            onClick={handleEdit}
                            className="cursor-pointer w-full text-left px-3 py-2 text-(--on-surface) hover:bg-(--surface-container-high) text-sm">
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="cursor-pointer w-full text-left px-3 py-2 text-(--error) hover:bg-(--error-container) text-sm">
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}