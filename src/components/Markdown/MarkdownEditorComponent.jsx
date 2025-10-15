import {useCallback, useEffect, useRef, useState} from "react";
import {FiCode, FiLayout, FiMaximize2, FiMinimize2, FiSettings} from "react-icons/fi";
import {invoke} from "@tauri-apps/api/core";
import {THEMES} from "../../data/StateManagementFunctions/MarkdownHelpers.jsx";
import EmptyNotePageComponent from "./EmptyNotePageComponent.jsx";
import DocumentStats from "./DocumentStats.jsx";
import MarkdownPreview from "./MarkdownPreview.jsx";
import {MdOutlinePreview, MdOutlineSave, MdSave} from "react-icons/md";
import Database from "@tauri-apps/plugin-sql";

export default function MarkdownEditorComponent({selectedNote}) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [viewMode, setViewMode] = useState("split");
    const [markdown, setMarkdown] = useState("");
    const [theme, setTheme] = useState("atomDark");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState(null);
    const [saveStatus, setSaveStatus] = useState("saved");
    const previousMarkdownRef = useRef("");
    const isInitialLoadRef = useRef(true);
    const selectedNoteRef = useRef(selectedNote);
    const saveTimeoutRef = useRef(null);

    const isSingleNote = useCallback((note) => {
        if (!note) return false;
        return note.hasOwnProperty('folder_id') === false;
    }, []);

    useEffect(() => {
        selectedNoteRef.current = selectedNote;
    }, [selectedNote]);

    useEffect(() => {
        const initializeViewMode = async () => {
            try {
                const [isEditorOpen, isPreviewOpen] = await invoke("get_view_mode");
                if (isEditorOpen && isPreviewOpen) {
                    setViewMode("split");
                } else if (isEditorOpen && !isPreviewOpen) {
                    setViewMode("editor");
                } else if (!isEditorOpen && isPreviewOpen) {
                    setViewMode("preview");
                }
            } catch (error) {
                console.log("Using default view mode: split");
            }
        };
        initializeViewMode();
    }, []);

    useEffect(() => {
        if (selectedNote) {
            setTitle(selectedNote.title || "");
            setContent(selectedNote.content || "");
            setMarkdown(selectedNote.content || "");
            previousMarkdownRef.current = selectedNote.content || "";
            setSaveStatus("saved");
            setLastSaveTime(new Date());
            isInitialLoadRef.current = true;
        } else {
            setTitle("");
            setContent("");
            setMarkdown("");
            previousMarkdownRef.current = "";
            setSaveStatus("saved");
        }
    }, [selectedNote]);

    useEffect(() => {
        const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
        const chars = markdown.length;
        setWordCount(words);
        setCharCount(chars);
    }, [markdown]);

    // Auto-save functionality with debounce (1s)
    useEffect(() => {
        // Don't auto-save on initial load or if no note is selected
        if (isInitialLoadRef.current || !selectedNote) {
            isInitialLoadRef.current = false;
            return;
        }

        // Don't save if content hasn't changed
        if (markdown === previousMarkdownRef.current) {
            return;
        }

        // Update save status to "unsaved"
        setSaveStatus("unsaved");

        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        // Schedule a debounced save
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            setSaveStatus("saving");
            try {
                const singleNote = isSingleNote(selectedNote);
                const sql = await invoke(singleNote ? "auto_save_single_note" : "auto_save_folder_note", {
                    noteId: selectedNote.id,
                    content: markdown,
                });
                const db = await Database.load("sqlite:fenris_app_notes.db");
                await db.execute(sql);

                setSaveStatus("saved");
                setLastSaveTime(new Date());
                previousMarkdownRef.current = markdown;
                console.log(`${singleNote ? 'Single' : 'Folder'} note saved successfully`);
            } catch (error) {
                console.error('Error in auto-save:', error);
                setSaveStatus("unsaved");
            } finally {
                setIsSaving(false);
                saveTimeoutRef.current = null;
            }
        }, 1000);

        // Cleanup if markdown/selection changes before timeout fires
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [markdown, selectedNote, isSingleNote]);

    // Manual save function
    const handleManualSave = useCallback(async () => {
        if (!selectedNote || markdown === previousMarkdownRef.current) {
            return;
        }

        // Cancel any pending debounced save and perform immediately
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        setIsSaving(true);
        setSaveStatus("saving");

        try {
            const singleNote = isSingleNote(selectedNote);
            const sql = await invoke(singleNote ? "auto_save_single_note" : "auto_save_folder_note", {
                noteId: selectedNote.id,
                content: markdown,
            });
            const db = await Database.load("sqlite:fenris_app_notes.db");
            await db.execute(sql);

            setSaveStatus("saved");
            setLastSaveTime(new Date());
            previousMarkdownRef.current = markdown;
        } catch (error) {
            setSaveStatus("unsaved");
        } finally {
            setIsSaving(false);
        }
    }, [selectedNote, markdown, isSingleNote]);

    // Keyboard shortcut for save (Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleManualSave();
            }
            if (e.key === 'Escape') {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleManualSave]);

    if (!selectedNote) {
        return <EmptyNotePageComponent/>;
    }

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
        const currentIndex = modes.indexOf(viewMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        await toggleViewMode(nextMode);
    };

    function toggleFullscreen() {
        setIsFullscreen(!isFullscreen);
    }

    const handleMarkdownChange = (e) => {
        const newContent = e.target.value;
        setMarkdown(newContent);
        setContent(newContent);
    };

    // Determine which panels to show based on view mode
    const showEditor = viewMode === "split" || viewMode === "editor";
    const showPreview = viewMode === "split" || viewMode === "preview";

    // Calculate widths based on view mode
    const getEditorWidth = () => {
        if (viewMode === "split") return "w-1/2";
        if (viewMode === "editor") return "w-full";
        return "w-0";
    };

    const getPreviewWidth = () => {
        if (viewMode === "split") return "w-1/2";
        if (viewMode === "preview") return "w-full";
        return "w-0";
    };

    const getViewModeIcon = () => {
        switch (viewMode) {
            case "split":
                return <FiLayout size={12}/>;
            case "editor":
                return <FiCode size={12}/>;
            case "preview":
                return <MdOutlinePreview size={12}/>;
            default:
                return <FiLayout size={12}/>;
        }
    };

    const getViewModeTooltip = () => {
        switch (viewMode) {
            case "split":
                return "Split View (Click to cycle)";
            case "editor":
                return "Editor Only (Click to cycle)";
            case "preview":
                return "Preview Only (Click to cycle)";
            default:
                return "Change View Mode";
        }
    };

    const getSaveStatusIcon = () => {
        switch (saveStatus) {
            case "saved":
                return <MdOutlineSave className="text-green-500" size={16}/>;
            case "saving":
                return <div
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>;
            case "unsaved":
                return <MdSave className="text-orange-500" size={16}/>;
            default:
                return <MdOutlineSave size={16}/>;
        }
    };

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case "saved":
                return lastSaveTime ? `Saved ${lastSaveTime.toLocaleTimeString()}` : "Saved";
            case "saving":
                return "Saving...";
            case "unsaved":
                return "Unsaved changes";
            default:
                return "";
        }
    };

    return (
        <div
            className={`h-full w-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-(--background)/30 backdrop-blur-sm' : 'p-4'} overflow-x-hidden`}
            tabIndex={0}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-(--on-surface) bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text">
                        {title}
                    </h1>
                    <span
                        className="text-xs bg-(--surface-container) px-2 py-1 rounded-full border border-(--outline) text-(--on-surface-container)">
                        {isSingleNote(selectedNote) ? 'Single Note' : 'Folder Note'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Save Status */}
                    <div className="flex items-center gap-2 text-sm text-(--on-surface-variant)">
                        <button
                            onClick={handleManualSave}
                            disabled={isSaving || saveStatus === "saved"}
                            className="cursor-pointer p-2 rounded-lg hover:bg-(--surface-container-high) transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tooltip"
                            title="Save (Ctrl+S)"
                        >
                            {getSaveStatusIcon()}
                        </button>
                        <span className="text-xs">{getSaveStatusText()}</span>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={cycleViewMode}
                            className="cursor-pointer p-2 bg-(--surface-container) border border-(--outline) rounded-lg hover:bg-(--surface-container-high) transition-all duration-200 text-(--on-surface-container) tooltip"
                            title={getViewModeTooltip()}
                        >
                            {getViewModeIcon()}
                        </button>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                    >
                        <FiSettings className="text-(--on-surface)" size={16}/>
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                    >
                        {isFullscreen ? <FiMinimize2 size={16}/> : <FiMaximize2 size={16}/>}
                    </button>

                    {/* Settings Dropdown */}
                    {isSettingsOpen && (
                        <div
                            className="absolute top-14 right-2 bg-(--surface-container) border border-(--outline) rounded-xl shadow-2xl p-4 z-10 min-w-48">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-(--on-surface)">View Mode</span>
                                    <div className="flex items-center gap-1 text-xs">
                                        <button
                                            onClick={() => toggleViewMode("split")}
                                            className={`px-2 py-1 rounded transition-all duration-200 ${
                                                viewMode === "split"
                                                    ? "bg-(--primary) text-(--on-primary)"
                                                    : "bg-(--surface-container-high) text-(--on-surface-container-high) hover:bg-(--surface-container-highest)"
                                            }`}
                                        >
                                            Split
                                        </button>
                                        <button
                                            onClick={() => toggleViewMode("editor")}
                                            className={`px-2 py-1 rounded transition-all duration-200 ${
                                                viewMode === "editor"
                                                    ? "bg-(--primary) text-(--on-primary)"
                                                    : "bg-(--surface-container-high) text-(--on-surface-container-high) hover:bg-(--surface-container-highest)"
                                            }`}
                                        >
                                            Editor
                                        </button>
                                        <button
                                            onClick={() => toggleViewMode("preview")}
                                            className={`px-2 py-1 rounded transition-all duration-200 ${
                                                viewMode === "preview"
                                                    ? "bg-(--primary) text-(--on-primary)"
                                                    : "bg-(--surface-container-high) text-(--on-surface-container-high) hover:bg-(--surface-container-highest)"
                                            }`}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-2 text-(--on-surface)">Theme</label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="cursor-pointer w-full border border-(--outline) rounded-lg px-3 py-2 bg-(--surface) text-(--on-surface) focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all"
                                    >
                                        {THEMES.map((themeOption) => (
                                            <option className="cursor-pointer" key={themeOption.name}
                                                    value={themeOption.name}>
                                                {themeOption.display}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-2 border-t border-(--outline)">
                                    <div className="text-xs text-(--on-surface-variant)">
                                        <p>Auto-save: Enabled</p>
                                        <p>Debounce: 1 second</p>
                                        <p>Note Type: {isSingleNote(selectedNote) ? 'Single Note' : 'Folder Note'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor + Preview Area */}
            <div className="flex flex-row gap-4 h-full w-full items-stretch flex-1 min-h-0 overflow-hidden">
                {/* Editor Panel */}
                {showEditor && (
                    <div className={`relative transition-all duration-500 flex flex-col min-w-0 ${getEditorWidth()}`}>
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-(--on-surface-variant) mb-2">
                            <div
                                className="bg-(--surface-container) px-3 py-1 rounded-t-lg border border-b-0 border-(--outline) font-medium text-(--on-surface-container)">
                                EDITOR
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                <span>Editing</span>
                            </div>
                        </div>
                        <div
                            className="flex-1 relative rounded-lg border border-(--outline) bg-(--surface-container) overflow-hidden">
                            <textarea
                                spellCheck={false}
                                autoCorrect="off"
                                autoCapitalize="off"
                                value={markdown}
                                onChange={handleMarkdownChange}
                                className="w-full h-full p-4 bg-(--surface-container) text-(--on-surface-container) resize-none outline-none font-mono text-sm leading-relaxed scrollbar-thin placeholder:text-(--on-surface-variant) text-sm"
                                placeholder="Write your markdown here..."
                            />
                        </div>
                    </div>
                )}

                {/* Preview Panel */}
                {showPreview && (
                    <div className={`relative transition-all duration-500 flex flex-col min-w-0 ${getPreviewWidth()}`}>
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-(--on-surface-variant) mb-2">
                            <div
                                className="bg-(--surface-container) px-3 py-1 rounded-t-lg border border-b-0 border-(--outline) font-medium text-(--on-surface-container)">
                                PREVIEW
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                <span>Live</span>
                            </div>
                        </div>
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
            <div className="flex-shrink-0 mt-3 px-2">
                <div className="flex items-center justify-between text-sm text-(--on-surface-variant)">
                    <div className="flex items-center gap-4">
                        <span
                            className="font-medium bg-(--surface-container) px-3 py-1 rounded-full border border-(--outline) text-(--on-surface-container) text-xs">
                            {title}
                        </span>
                        <DocumentStats charCount={charCount} wordCount={wordCount}/>
                        <span className="text-xs opacity-75">
                            Mode: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                        </span>
                    </div>
                    <div className="text-xs opacity-75">
                        {saveStatus === "saved" && lastSaveTime && `Last saved: ${lastSaveTime.toLocaleTimeString()}`}
                    </div>
                </div>
            </div>
        </div>
    );
}