import {useCallback, useEffect, useRef, useState} from 'react';
import {IoClose, IoAdd, IoPricetag, IoSearch} from 'react-icons/io5';
import {useTranslation} from 'react-i18next';
import Database from '@tauri-apps/plugin-sql';
import {invoke} from '@tauri-apps/api/core';

const COLOR_PRESETS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#6B7280', '#84CC16', '#06B6D4', '#F97316'
];

export default function TagManager({noteId, noteType = 'single', onTagsChange, existingTags = []}) {
    const {t} = useTranslation();
    const [tags, setTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
    const dropdownRef = useRef(null);

    const loadAllTags = useCallback(async () => {
        try {
            const db = await Database.load('sqlite:fenris_app_notes.db');
            const tagsFromRustDb = await invoke("select_all_tags_by_name");
            const tagsFromDb = await db.select(tagsFromRustDb);
            setAllTags(tagsFromDb);
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }, []);

    const loadNoteTags = useCallback(async () => {
        if (!noteId) return;

        try {
            const db = await Database.load('sqlite:fenris_app_notes.db');
            const query = `
                SELECT t.* FROM tags t
                JOIN note_tags nt ON t.id = nt.tag_id
                WHERE nt.note_id = ? AND nt.note_type = ?
            `;
            const noteTags = await db.select(query, [noteId, noteType]);
            setTags(noteTags);
        } catch (error) {

        }
    }, [noteId, noteType]);

    const createTag = useCallback(async (name, color) => {
        try {
            const db = await Database.load('sqlite:fenris_app_notes.db');
            const createTagFromRust = await invoke("create_tag", {name: name.trim(), color: color});
            const result = await db.execute(createTagFromRust);

            if (result.rowsAffected > 0) {
                await loadAllTags();
                const newTag = await db.select('SELECT * FROM tags WHERE name = ?', [name.trim()]);
                return newTag[0];
            } else {
                // Tag already exists, return existing tag
                const existingTag = await db.select('SELECT * FROM tags WHERE name = ?', [name.trim()]);
                return existingTag[0];
            }
        } catch (error) {
            console.error('Error creating tag:', error);
            return null;
        }
    }, [loadAllTags]);

    const addTagToNote = useCallback(async (tagId) => {
        if (!noteId) return;

        try {
            const db = await Database.load('sqlite:fenris_app_notes.db');
            await db.execute(
                'INSERT OR IGNORE INTO note_tags (note_id, tag_id, note_type) VALUES (?, ?, ?)',
                [noteId, tagId, noteType]
            );
            await loadNoteTags();
            if (onTagsChange) {
                onTagsChange();
            }
        } catch (error) {
            console.error('Error adding tag to note:', error);
        }
    }, [noteId, noteType, loadNoteTags, onTagsChange]);

    const removeTagFromNote = useCallback(async (tagId) => {
        if (!noteId) return;

        try {
            const db = await Database.load('sqlite:fenris_app_notes.db');
            await db.execute(
                'DELETE FROM note_tags WHERE note_id = ? AND tag_id = ? AND note_type = ?',
                [noteId, tagId, noteType]
            );
            await loadNoteTags();
            if (onTagsChange) {
                onTagsChange();
            }
        } catch (error) {
            console.error('Error removing tag from note:', error);
        }
    }, [noteId, noteType, loadNoteTags, onTagsChange]);

    const handleCreateAndAddTag = useCallback(async () => {
        if (!newTagName.trim()) return;

        const newTag = await createTag(newTagName, selectedColor);
        if (newTag) {
            await addTagToNote(newTag.id);
            setNewTagName('');
            setSelectedColor(COLOR_PRESETS[0]);
        }
    }, [newTagName, selectedColor, createTag, addTagToNote]);

    const filteredTags = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tags.some(t => t.id === tag.id)
    );

    useEffect(() => {
        loadAllTags();
        loadNoteTags();
    }, [loadAllTags, loadNoteTags]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-(--scrim) transition-all duration-200 hover:scale-105"
                        style={{backgroundColor: tag.color}}
                    >
                        <IoPricetag size={10}/>
                        {tag.name}
                        <button
                            onClick={() => removeTagFromNote(tag.id)}
                            className="hover:bg-(--background)/20 cursor-pointer rounded-full p-0.5 transition-colors"
                        >
                            <IoClose size={10}/>
                        </button>
                    </span>
                ))}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-(--surface-container-high) text-(--on-surface-container-high) border border-(--outline) hover:bg-(--surface-container-highest) transition-all duration-200"
                >
                    <IoAdd size={12}/>
                    {t('tags.addTag')}
                </button>
            </div>

            {/* Tag Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-(--surface-container) border border-(--outline) rounded-lg shadow-xl z-50 p-3">
                    {/* Search Input */}
                    <div className="relative mb-3">
                        <IoSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-(--on-surface-variant)" size={14}/>
                        <input
                            type="text"
                            placeholder={t('tags.searchTags')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-(--surface) border border-(--outline) rounded-md text-(--on-surface) text-sm focus:outline-none focus:border-(--primary)"
                        />
                    </div>

                    {/* Create New Tag */}
                    <div className="mb-3 p-2 bg-(--surface-container-high) rounded-md">
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder={t('tags.newTagName')}
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAddTag()}
                                className="flex-1 px-2 py-1 bg-(--surface) border border-(--outline) rounded text-(--on-surface) text-sm focus:outline-none focus:border-(--primary)"
                            />
                            <button
                                onClick={handleCreateAndAddTag}
                                disabled={!newTagName.trim()}
                                className="px-2 py-1 bg-(--primary) text-(--on-primary) rounded text-sm hover:bg-(--primary-dark) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IoAdd size={14}/>
                            </button>
                        </div>

                        {/* Color Picker */}
                        <div className="flex gap-1 flex-wrap">
                            {COLOR_PRESETS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-4 h-4 rounded-full border-2 transition-transform ${
                                        selectedColor === color ? 'border-(--on-surface) scale-110' : 'border-transparent'
                                    }`}
                                    style={{backgroundColor: color}}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Existing Tags List */}
                    <div className="max-h-32 overflow-y-auto">
                        {filteredTags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => addTagToNote(tag.id)}
                                className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-(--surface-container-high) rounded transition-colors"
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{backgroundColor: tag.color}}
                                />
                                <span className="text-sm text-(--on-surface)">{tag.name}</span>
                            </button>
                        ))}

                        {filteredTags.length === 0 && searchTerm && (
                            <div className="text-center py-2 text-(--on-surface-variant) text-sm">
                                {t('tags.noTagsFound')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}