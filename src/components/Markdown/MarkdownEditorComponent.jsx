import {useCallback, useEffect, useRef, useState} from "react";
import {FiCode, FiLayout, FiMaximize2, FiMinimize2, FiSettings} from "react-icons/fi";
import {MdOutlinePreview, MdOutlineSave, MdSave} from "react-icons/md";
import {invoke} from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import {useTranslation} from "react-i18next";
import {
    getStoredTheme,
    listOfThemes,
    setCharCountForMarkdown,
    setIsMarkdownFullScreen,
    setStoredTheme,
    setWordCountForMarkdown
} from "../../data/StateManagementFunctions/MarkdownHelpers.jsx";
import EmptyNotePageComponent from "./EmptyNotePageComponent.jsx";
import DocumentStats from "./DocumentStats.jsx";
import MarkdownPreview from "./MarkdownPreview.jsx";
import PanelHeader from "./PanelHeader.jsx";
import {Textarea} from "./TextArea.jsx";
import TagManager from "../Tags/TagManager.jsx";

const useTextareaBehavior = () => {
    const textareaRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;

            e.target.value = value.substring(0, start) + '  ' + value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
    }, []);

    return {textareaRef, handleKeyDown};
};


export default function MarkdownEditorComponent({selectedNote}) {
    const {t} = useTranslation();
    const [markdown, setMarkdown] = useState("");
    const [title, setTitle] = useState("");
    const [viewMode, setViewMode] = useState("split");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState("saved");
    const [lastSaveTime, setLastSaveTime] = useState(null);
    const [theme, setTheme] = useState('atomDark');
    const [tags, setTags] = useState([]);
    const {textareaRef, handleKeyDown} = useTextareaBehavior();
    const previousMarkdownRef = useRef("");
    const isInitialLoadRef = useRef(true);
    const selectedNoteRef = useRef(selectedNote);
    const saveTimeoutRef = useRef(null);

    const VIEW_MODES = {
        split: {icon: <FiLayout size={12}/>, tooltip: 'markdownEditor.viewMode.splitTooltip'},
        editor: {icon: <FiCode size={12}/>, tooltip: 'markdownEditor.viewMode.editorTooltip'},
        preview: {icon: <MdOutlinePreview size={12}/>, tooltip: 'markdownEditor.viewMode.previewTooltip'}
    };

    const SAVE_STATUS = {
        saved: {icon: <MdOutlineSave className="text-green-500" size={16}/>},
        saving: {
            icon: <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
        },
        unsaved: {icon: <MdSave className="text-orange-500" size={16}/>}
    };

    const isSingleNote = useCallback((note) => !note || note.hasOwnProperty('folder_id') === false, []);

    const handleTagsChange = useCallback(async () => {
        if (!selectedNote) return;

        try {
            const db = await Database.load('sqlite:fenris_app_notes.db');
            const noteType = isSingleNote(selectedNote) ? 'single' : 'folder';
            const query = `
                SELECT t.*
                FROM tags t
                         JOIN note_tags nt ON t.id = nt.tag_id
                WHERE nt.note_id = ?
                  AND nt.note_type = ?
            `;
            const noteTags = await db.select(query, [selectedNote.id, noteType]);
            setTags(noteTags);
        } catch (error) {
        }
    }, [selectedNote, isSingleNote]);

    useEffect(() => {
        handleTagsChange();
    }, [selectedNote, handleTagsChange]);

    const calculateCounts = useCallback((text) => ({
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length
    }), []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setStoredTheme(newTheme);
    };

    const toggleViewMode = async (mode) => {
        setViewMode(mode);
        try {
            await invoke("toggle_view_mode", {mode});
        } catch (error) {
            console.error('Error toggling view mode:', error);
        }
    };

    const cycleViewMode = async () => {
        const modes = ["split", "editor", "preview"];
        const nextMode = modes[(modes.indexOf(viewMode) + 1) % modes.length];
        await toggleViewMode(nextMode);
    };

    const saveNote = async (content, note) => {
        const singleNote = isSingleNote(note);
        const sql = await invoke(singleNote ? "auto_save_single_note" : "auto_save_folder_note", {
            noteId: note.id,
            content: content,
        });
        const db = await Database.load("sqlite:fenris_app_notes.db");
        await db.execute(sql);
    };

    const handleManualSave = useCallback(async () => {
        if (!selectedNote || markdown === previousMarkdownRef.current) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        setSaveStatus("saving");
        try {
            await saveNote(markdown, selectedNote);
            setSaveStatus("saved");
            setLastSaveTime(new Date());
            previousMarkdownRef.current = markdown;
        } catch (error) {
            setSaveStatus("unsaved");
        }
    }, [selectedNote, markdown, isSingleNote]);

    useEffect(() => {
        selectedNoteRef.current = selectedNote;
    }, [selectedNote]);

    useEffect(() => {
        const initializeViewMode = async () => {
            try {
                const [isEditorOpen, isPreviewOpen] = await invoke("get_view_mode");
                if (isEditorOpen && isPreviewOpen) setViewMode("split");
                else if (isEditorOpen && !isPreviewOpen) setViewMode("editor");
                else if (!isEditorOpen && isPreviewOpen) setViewMode("preview");
            } catch (error) {
                console.log("Using default view mode: split");
            }
        };
        initializeViewMode();
    }, []);

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await getStoredTheme();
            setTheme(storedTheme);
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (selectedNote) {
            setTitle(selectedNote.title || "");
            setMarkdown(selectedNote.content || "");
            previousMarkdownRef.current = selectedNote.content || "";
            setSaveStatus("saved");
            setLastSaveTime(new Date());
            isInitialLoadRef.current = true;
        } else {
            setTitle("");
            setMarkdown("");
            previousMarkdownRef.current = "";
            setSaveStatus("saved");
        }
    }, [selectedNote]);

    useEffect(() => {
        const {words, chars} = calculateCounts(markdown);
        setWordCountForMarkdown(words, setWordCount);
        setCharCountForMarkdown(chars, setCharCount);
    }, [markdown, calculateCounts]);

    useEffect(() => {
        if (isInitialLoadRef.current || !selectedNote || markdown === previousMarkdownRef.current) {
            isInitialLoadRef.current = false;
            return;
        }

        setSaveStatus("unsaved");

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            setSaveStatus("saving");
            try {
                await saveNote(markdown, selectedNote);
                setSaveStatus("saved");
                setLastSaveTime(new Date());
                previousMarkdownRef.current = markdown;
            } catch (error) {
                setSaveStatus("unsaved");
            }
            saveTimeoutRef.current = null;
        }, 10000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [markdown, selectedNote, isSingleNote]);

    useEffect(() => {
        const handleKeyDown = async (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleManualSave().then(r => `${r}`);
            }
            if (e.key === 'Escape') {
                await setIsMarkdownFullScreen(isFullscreen, setIsFullscreen());
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleManualSave]);

    const handleFullScreenMode = async () => {
        await setIsMarkdownFullScreen(!isFullscreen, setIsFullscreen(!isFullscreen));
    }

    const getPanelClasses = () => {
        const base = "relative transition-all duration-500 flex flex-col min-w-0";
        return {
            editor: `${base} ${viewMode === "split" ? "w-1/2" : viewMode === "editor" ? "w-full" : "w-0"}`,
            preview: `${base} ${viewMode === "split" ? "w-1/2" : viewMode === "preview" ? "w-full" : "w-0"}`
        };
    };

    const getSaveStatusText = () => {
        const texts = {
            saved: lastSaveTime
                ? t('markdownEditor.saveStatus.lastSaved', {time: lastSaveTime.toLocaleTimeString()})
                : t('markdownEditor.saveStatus.saved'),
            saving: t('markdownEditor.saveStatus.saving'),
            unsaved: t('markdownEditor.saveStatus.unsaved')
        };
        return texts[saveStatus] || "";
    };

    const panelClasses = getPanelClasses();
    const showEditor = viewMode === "split" || viewMode === "editor";
    const showPreview = viewMode === "split" || viewMode === "preview";

    if (!selectedNote) return <EmptyNotePageComponent/>;

    return (
        <div
            className={`h-full w-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-(--background)/30 backdrop-blur-sm' : 'p-4'} overflow-x-hidden`}
            tabIndex={0}>

            {/* Header - Hidden in fullscreen */}
            {!isFullscreen && (
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className="text-xl font-bold text-(--on-surface) bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text">
                            {title}
                        </h1>
                        {/* Tags Display in Header */}
                        <div className="flex flex-wrap gap-1">
                            {/* Tag Manager */}
                            {!isFullscreen && (
                                <div className="items-center justify-center">
                                    <TagManager
                                        noteId={selectedNote?.id}
                                        noteType={isSingleNote(selectedNote) ? 'single' : 'folder'}
                                        onTagsChange={handleTagsChange}
                                        existingTags={tags}
                                    />
                                </div>
                            )}
                        </div>
                        <span
                            className="text-xs bg-(--surface-container) px-2 py-1 rounded-full border border-(--outline) text-(--on-surface-container)">
                            {isSingleNote(selectedNote) ? t('markdownEditor.header.singleNote') : t('markdownEditor.header.folderNote')}

                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Save Status */}
                        <div className="flex items-center gap-2 text-sm text-(--on-surface-variant)">
                            <button
                                onClick={handleManualSave}
                                disabled={saveStatus === "saved"}
                                className="cursor-pointer p-2 rounded-lg hover:bg-(--surface-container-high) transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tooltip"
                                title={t('markdownEditor.saveStatus.saveButton')}
                            >
                                {SAVE_STATUS[saveStatus]?.icon}
                            </button>
                            <span className="text-xs">{getSaveStatusText()}</span>
                        </div>

                        {/* View Mode Toggle */}
                        <button
                            onClick={cycleViewMode}
                            className="cursor-pointer p-2 bg-(--surface-container) border border-(--outline) rounded-lg hover:bg-(--surface-container-high) transition-all duration-200 text-(--on-surface-container) tooltip"
                            title={t(VIEW_MODES[viewMode]?.tooltip)}
                        >
                            {VIEW_MODES[viewMode]?.icon}
                        </button>

                        {/* Settings Button */}
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                            title={t('markdownEditor.settings.title')}
                        >
                            <FiSettings className="text-(--on-surface)" size={16}/>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={handleFullScreenMode}
                            className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                            title={isFullscreen ? t('markdownEditor.fullscreen.exit') : t('markdownEditor.fullscreen.enter')}
                        >
                            {isFullscreen ? <FiMinimize2 size={16}/> : <FiMaximize2 size={16}/>}
                        </button>

                        {/* Settings Dropdown */}
                        {isSettingsOpen && (
                            <div
                                className="absolute top-14 right-2 bg-(--surface-container) border border-(--outline) rounded-xl shadow-2xl p-4 z-10 min-w-48">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-sm font-medium text-(--on-surface)">{t('markdownEditor.settings.viewMode')}</span>
                                        <div className="flex items-center gap-1 text-xs">
                                            {["split", "editor", "preview"].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => toggleViewMode(mode)}
                                                    className={`p-1 rounded transition-all duration-200 ml-2 cursor-pointer ${
                                                        viewMode === mode
                                                            ? "bg-(--primary) text-(--on-primary)"
                                                            : "bg-(--surface-container-high) text-(--on-surface-container-high) hover:bg-(--surface-container-highest)"
                                                    }`}
                                                >
                                                    {t(`markdownEditor.viewMode.${mode}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="text-sm font-medium block mb-2 text-(--on-surface)">{t('markdownEditor.settings.theme')}</label>
                                        <select
                                            value={theme}
                                            onChange={(e) => handleThemeChange(e.target.value)}
                                            className="z-50 cursor-pointer w-full border border-(--outline) rounded-lg px-3 py-2 bg-(--surface) text-(--on-surface) focus:outline-none transition-all"
                                        >
                                            {listOfThemes.map((themeOption) => (
                                                <option className="cursor-pointer" key={themeOption.name}
                                                        value={themeOption.name}>
                                                    {themeOption.display}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2 border-t border-(--outline)">
                                        <div className="text-xs text-(--on-surface-variant)">
                                            <p>{t('markdownEditor.saveStatus.autoSave')}</p>
                                            <p>{t('markdownEditor.saveStatus.debounce')}</p>
                                            <p>
                                                {t('markdownEditor.settings.noteType')}: {isSingleNote(selectedNote)
                                                ? t('markdownEditor.header.singleNote')
                                                : t('markdownEditor.header.folderNote')
                                            }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Minimal Header for Fullscreen - Only essential controls */}
            {isFullscreen && (
                <div className="flex items-center justify-end mb-4 px-2">
                    <div className="flex items-center gap-3">
                        {/* Settings Button */}
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                            title={t('markdownEditor.settings.title')}
                        >
                            <FiSettings className="text-(--on-surface)" size={16}/>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={handleFullScreenMode}
                            className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                            title={t('markdownEditor.fullscreen.exit')}
                        >
                            <FiMinimize2 size={16}/>
                        </button>

                        {/* Settings Dropdown */}
                        {isSettingsOpen && (
                            <div
                                className="absolute top-14 right-2 bg-(--surface-container) border border-(--outline) rounded-xl shadow-2xl p-4 z-10 min-w-48">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-sm font-medium text-(--on-surface)">{t('markdownEditor.settings.viewMode')}</span>
                                        <div className="flex items-center gap-1 text-xs">
                                            {["split", "editor", "preview"].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => toggleViewMode(mode)}
                                                    className={`p-1 rounded transition-all duration-200 ml-2 cursor-pointer ${
                                                        viewMode === mode
                                                            ? "bg-(--primary) text-(--on-primary)"
                                                            : "bg-(--surface-container-high) text-(--on-surface-container-high) hover:bg-(--surface-container-highest)"
                                                    }`}
                                                >
                                                    {t(`markdownEditor.viewMode.${mode}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="text-sm font-medium block mb-2 text-(--on-surface)">{t('markdownEditor.settings.theme')}</label>
                                        <select
                                            value={theme}
                                            onChange={(e) => handleThemeChange(e.target.value)}
                                            className="z-50 cursor-pointer w-full border border-(--outline) rounded-lg px-3 py-2 bg-(--surface) text-(--on-surface) focus:outline-none transition-all"
                                        >
                                            {listOfThemes.map((themeOption) => (
                                                <option className="cursor-pointer" key={themeOption.name}
                                                        value={themeOption.name}>
                                                    {themeOption.display}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Editor + Preview Area */}
            <div className={`flex flex-row gap-4 h-full w-full items-stretch flex-1 min-h-0 overflow-hidden ${isFullscreen ? 'mt-0' : ''}`}>
                {/* Editor Panel */}
                {showEditor && (
                    <div className={panelClasses.editor}>
                        {!isFullscreen && (
                            <PanelHeader
                                title={t('markdownEditor.panels.editor')}
                                status={t('markdownEditor.panels.editing')}
                                color="green"
                            />
                        )}
                        <div
                            className="flex-1 relative rounded-lg border border-(--outline) bg-(--surface-container) overflow-hidden">
                            <Textarea
                                value={markdown}
                                onChange={setMarkdown}
                                placeholder={t('markdownEditor.panels.editorPlaceholder')}
                            />
                        </div>
                    </div>
                )}

                {/* Preview Panel */}
                {showPreview && (
                    <div className={panelClasses.preview}>
                        {!isFullscreen && (
                            <PanelHeader
                                title={t('markdownEditor.panels.preview')}
                                status={t('markdownEditor.panels.live')}
                                color="blue"
                            />
                        )}
                        <div
                            className="flex-1 rounded-lg border border-(--outline) bg-(--surface-container-low) overflow-hidden">
                            <div
                                className="h-full overflow-auto p-4 scrollbar-thin scrollbar-thumb-(--outline) scrollbar-track-transparent bg-(--surface-container-low)">
                                <MarkdownPreview markdown={markdown} theme={theme}/>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isFullscreen && (
                <div className="flex-shrink-0 mt-3 px-2">
                    <div className="flex items-center justify-between text-sm text-(--on-surface-variant)">
                        <div className="flex items-center gap-4">
                            <span
                                className="font-medium bg-(--surface-container) px-3 py-1 rounded-full border border-(--outline) text-(--on-surface-container) text-xs">
                                {title}
                            </span>
                            <DocumentStats charCount={charCount} wordCount={wordCount}/>
                            <span className="text-xs opacity-75">
                                {t('markdownEditor.viewMode.toggle')}: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                            </span>
                        </div>
                        <div className="text-xs opacity-75">
                            {saveStatus === "saved" && lastSaveTime && t('markdownEditor.saveStatus.lastSaved', {time: lastSaveTime.toLocaleTimeString()})}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}