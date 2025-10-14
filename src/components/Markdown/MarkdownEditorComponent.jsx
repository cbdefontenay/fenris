import {useEffect, useState} from "react";
import {FiEye, FiEyeOff, FiSettings, FiMaximize2, FiMinimize2, FiCode, FiLayout} from "react-icons/fi";
import {invoke} from "@tauri-apps/api/core";
import {
    setMarkdownContent,
    setMarkdownFromRust,
    setMarkdownTitle,
    setPreviewToOpen,
    THEMES
} from "../../data/StateManagementFunctions/MarkdownHelpers.jsx";
import EmptyNotePageComponent from "./EmptyNotePageComponent.jsx";
import DocumentStats from "./DocumentStats.jsx";
import MarkdownPreview from "./MarkdownPreview.jsx";
import {MdOutlinePreview} from "react-icons/md";

export default function MarkdownEditorComponent({ selectedNote }) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [viewMode, setViewMode] = useState("split");
    const [markdown, setMarkdown] = useState("");
    const [theme, setTheme] = useState("atomDark");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            setMarkdownTitle(selectedNote.title || "", setTitle);
            setMarkdownContent(selectedNote.content || "", setContent);
            setMarkdownFromRust(selectedNote.content || "", setMarkdown);
        } else {
            setMarkdownTitle("", setTitle);
            setMarkdownContent("", setContent);
        }
    }, [selectedNote]);

    useEffect(() => {
        const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
        const chars = markdown.length;
        setWordCount(words);
        setCharCount(chars);
    }, [markdown]);

    if (!selectedNote) {
        return <EmptyNotePageComponent />;
    }

    const toggleViewMode = async (mode) => {
        setViewMode(mode);
        await invoke("toggle_view_mode", { mode });
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

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsFullscreen(false);
        }
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
                return <FiLayout size={12} />;
            case "editor":
                return <FiCode size={12} />;
            case "preview":
                return <MdOutlinePreview size={12} />;
            default:
                return <FiLayout size={12} />;
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

    return (
        <div
            className={`h-full w-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-black/30 backdrop-blur-sm' : 'p-4 overflow-x-hidden'}`}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-(--on-surface) bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
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
                        <FiSettings className="text-(--on-surface)" size={16} />
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 cursor-pointer rounded-lg bg-(--surface-container) border border-(--outline) hover:bg-(--surface-container-high) transition-all duration-200 hover:scale-105"
                    >
                        {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                    </button>

                    {/* Settings Dropdown */}
                    {isSettingsOpen && (
                        <div className="absolute top-14 right-2 bg-(--surface-container) border border-(--outline) rounded-xl shadow-2xl p-4 z-10 min-w-48">
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
                                            <option className="cursor-pointer" key={themeOption.name} value={themeOption.name}>
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

            {/* Editor + Preview Area */}
            <div className="flex flex-row gap-4 h-full w-full items-stretch flex-1 min-h-0 overflow-hidden">
                {/* Editor Panel */}
                {showEditor && (
                    <div className={`relative transition-all duration-500 flex flex-col ${getEditorWidth()}`}>
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-(--on-surface-variant) mb-2">
                            <div className="bg-(--surface-container) px-3 py-1 rounded-t-lg border border-b-0 border-(--outline) font-medium text-(--on-surface-container)">
                                EDITOR
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                <span>Editing</span>
                            </div>
                        </div>
                        <div className="flex-1 relative rounded-lg border border-(--outline) bg-(--surface-container) overflow-hidden">
                            <textarea
                                spellCheck={false}
                                autoCorrect="off"
                                autoCapitalize="off"
                                value={markdown}
                                onChange={(e) => setMarkdownFromRust(e.target.value, setMarkdown)}
                                className="w-full h-full p-4 bg-(--surface-container) text-(--on-surface-container) resize-none outline-none font-mono text-sm leading-relaxed scrollbar-thin placeholder:text-(--on-surface-variant) text-sm"
                                placeholder="Write in here..."
                            />
                        </div>
                    </div>
                )}

                {/* Preview Panel */}
                {showPreview && (
                    <div className={`relative transition-all duration-500 flex flex-col ${getPreviewWidth()}`}>
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-(--on-surface-variant) mb-2">
                            <div className="bg-(--surface-container) px-3 py-1 rounded-t-lg border border-b-0 border-(--outline) font-medium text-(--on-surface-container)">
                                PREVIEW
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                <span>Live</span>
                            </div>
                        </div>
                        <div className="flex-1 rounded-lg border border-(--outline) bg-(--surface-container-low) overflow-hidden">
                            <div className="h-full overflow-auto p-4 scrollbar-thin scrollbar-thumb-(--outline) scrollbar-track-transparent bg-(--surface-container-low)">
                                <MarkdownPreview markdown={markdown} theme={theme} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 mt-3 px-2">
                <div className="flex items-center justify-between text-sm text-(--on-surface-variant)">
                    <div className="flex items-center gap-4">
                        <span className="font-medium bg-(--surface-container) px-3 py-1 rounded-full border border-(--outline) text-(--on-surface-container) text-xs">
                            {title}
                        </span>
                        <DocumentStats charCount={charCount} wordCount={wordCount} />
                        <span className="text-xs opacity-75">
                            Mode: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}