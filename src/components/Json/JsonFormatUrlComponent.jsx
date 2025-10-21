import {invoke} from "@tauri-apps/api/core";
import {useState, useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import DaisyToast from "../DaisyToast.jsx";
import SearchJsonComponent from "./SearchJsonComponent.jsx";
import {TiCloudStorageOutline} from "react-icons/ti";
import {FaCheck, FaPaste, FaRegCopy, FaTrash, FaChevronDown} from "react-icons/fa";
import {LuFileJson} from "react-icons/lu";
import {VscGitFetch} from "react-icons/vsc";
import {TfiImport} from "react-icons/tfi";
import {MdImportExport} from "react-icons/md";
import {RiDeleteBack2Fill} from "react-icons/ri";
import JsonEditorPanel from "./JsonEditorPanel.jsx";
import JsonStatsPanel from "./JsonStatsPanel.jsx";

export default function JsonFormatUrlComponent() {
    const [url, setUrl] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [outputLength, setOutputLength] = useState(0);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [storedFiles, setStoredFiles] = useState([]);
    const [showStoredFiles, setShowStoredFiles] = useState(false);
    const [saveFileName, setSaveFileName] = useState("");
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchCount, setSearchCount] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    const {t} = useTranslation();
    const editorRef = useRef(null);

    useEffect(() => {
        loadStoredFiles();
    }, []);

    useEffect(() => {
        if (searchTerm && response && !isEditing) {
            performSearch();
        } else {
            setSearchResults([]);
            setSearchCount(0);
            setCurrentMatchIndex(0);
        }
    }, [searchTerm, response, isEditing]);

    useEffect(() => {
        if (searchResults.length > 0 && currentMatchIndex < searchResults.length) {
            scrollToMatch(currentMatchIndex);
        }
    }, [currentMatchIndex, searchResults]);

    const loadStoredFiles = async () => {
        try {
            const files = await invoke("list_json_files");
            setStoredFiles(files);
        } catch (error) {
            console.error("Failed to load stored files:", error);
        }
    };

    const performSearch = async () => {
        if (!response || !searchTerm.trim() || isEditing) {
            setSearchResults([]);
            setSearchCount(0);
            setCurrentMatchIndex(0);
            return;
        }

        setSearchLoading(true);
        try {
            const result = await invoke("perform_search", {
                jsonResponse: response,
                searchTerm: searchTerm
            });

            setSearchResults(result.matches || []);
            setSearchCount(result.count || 0);
            setCurrentMatchIndex(0);
        } catch (error) {
            setSearchResults([]);
            setSearchCount(0);
            setCurrentMatchIndex(0);
            showToast(t('jsonFormatter.search.error'));
        } finally {
            setSearchLoading(false);
        }
    };

    const scrollToMatch = (matchIndex) => {
        if (!editorRef.current || searchResults.length === 0) return;

        const element = document.getElementById(`match-${matchIndex}`);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Add temporary highlight for the current match
            element.classList.add('bg-(--primary-container)');
            setTimeout(() => {
                element.classList.remove('bg-(--primary-container)');
            }, 2000);
        }
    };

    const handleNavigateMatch = (newIndex) => {
        setCurrentMatchIndex(newIndex);
    };

    const handleFetch = async () => {
        if (!url) return;

        setLoading(true);
        setSearchTerm("");
        setSearchResults([]);
        setSearchCount(0);

        try {
            const result = await invoke("fetch_json", {url});
            setResponse(result);
            setOutputLength(result.length);
            setIsEditing(false);
            showToast(t('jsonFormatter.toast.fetchSuccess'));
        } catch (error) {
            setResponse(`${t('jsonFormatter.errors.error')}: ${error}`);
            setOutputLength(0);
            showToast(t('jsonFormatter.toast.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleFetch().then(r => "");
        }
    };

    const chooseJsonFileFromSystem = async () => {
        try {
            const fileContent = await invoke("pick_json_file");

            if (fileContent) {
                try {
                    const formattedJson = await invoke("format_json", {jsonString: fileContent});
                    setResponse(formattedJson);
                    setOutputLength(formattedJson.length);
                    setIsEditing(false);
                    setSearchTerm("");
                    setSearchResults([]);
                    setSearchCount(0);
                    setCurrentMatchIndex(0);
                    showToast(t('jsonFormatter.toast.importSuccess'));
                } catch (formatError) {
                    setResponse(`${t('jsonFormatter.errors.formatError')}: ${formatError}\n\n${t('jsonFormatter.rawContent')}:\n${fileContent}`);
                    setOutputLength(fileContent.length);
                    setIsEditing(true);
                    showToast(t('jsonFormatter.toast.importInvalid'));
                }
            } else {
                showToast(t('jsonFormatter.toast.noContent'));
            }
        } catch (error) {
            showToast(t('jsonFormatter.toast.importError', {error}));
        }
    };

    const handleFormatJson = async () => {
        if (!response.trim()) return;

        try {
            const formatted = await invoke("format_json", {jsonString: response});
            setResponse(formatted);
            setOutputLength(formatted.length);
            setIsEditing(false);
            setSearchTerm("");
            setSearchResults([]);
            setSearchCount(0);
            setCurrentMatchIndex(0);
            showToast(t('jsonFormatter.toast.formatSuccess'));
        } catch (error) {
            showToast(t('jsonFormatter.toast.formatError', {error}));
        }
    };

    const handleSaveJson = async () => {
        if (!response.trim()) {
            showToast(t('jsonFormatter.toast.saveEmpty'));
            return;
        }

        if (!saveFileName) {
            setShowSaveDialog(true);
            return;
        }

        try {
            await invoke("save_json_file", {
                key: saveFileName,
                value: response
            });

            setSaveFileName("");
            setShowSaveDialog(false);
            await loadStoredFiles();
            showToast(t('jsonFormatter.toast.saveSuccess'));
        } catch (error) {
            showToast(t('jsonFormatter.toast.saveError', {error}));
        }
    };

    const handleSaveAs = () => {
        if (!response.trim()) {
            showToast(t('jsonFormatter.toast.saveEmpty'));
            return;
        }
        setShowSaveDialog(true);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(response);
        showToast(t('jsonFormatter.toast.copySuccess'));
    };

    const showToast = (message) => {
        setToastMessage(message);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    const handleClear = () => {
        setResponse("");
        setOutputLength(0);
        setUrl("");
        setIsEditing(false);
        setSaveFileName("");
        setSearchTerm("");
        setSearchResults([]);
        setSearchCount(0);
        setCurrentMatchIndex(0);
        showToast(t('jsonFormatter.toast.clearSuccess'));
    };

    const handlePasteJson = () => {
        setIsEditing(true);
        setSearchTerm("");
        setSearchResults([]);
        setSearchCount(0);
        setCurrentMatchIndex(0);
        if (!response) {
            setResponse("");
        }
    };

    const handleEditChange = (e) => {
        setResponse(e.target.value);
        setOutputLength(e.target.value.length);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
        showToast(t('jsonFormatter.toast.editSaved'));
    };

    const loadStoredFile = async (fileName) => {
        try {
            const content = await invoke("get_json_file", {key: fileName});
            setResponse(content);
            setOutputLength(content.length);
            setIsEditing(false);
            setShowStoredFiles(false);
            setSearchTerm("");
            setSearchResults([]);
            setSearchCount(0);
            setCurrentMatchIndex(0);
            showToast(t('jsonFormatter.toast.fileLoaded'));
        } catch (error) {
            showToast(t('jsonFormatter.toast.fileLoadError', {error}));
        }
    };

    const deleteStoredFile = async (fileName, e) => {
        e.stopPropagation();
        try {
            await invoke("delete_json_file", {key: fileName});
            await loadStoredFiles();
            showToast(t('jsonFormatter.toast.fileDeleted'));

            if (response && saveFileName === fileName) {
                setResponse("");
                setSaveFileName("");
                setSearchTerm("");
                setSearchResults([]);
                setSearchCount(0);
            }
        } catch (error) {
            showToast(t('jsonFormatter.toast.fileDeleteError', {error}));
        }
    };

    return (
        <div className="page-margin lg:ml-20 flex flex-col md:h-full bg-(--background) text-(--on-background)">
            {/* Header */}
            <div className="border-b border-(--outline-variant) bg-(--surface-container)">
                <div className="px-8 py-6">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-(--primary-container) rounded-xl flex items-center justify-center">
                            <LuFileJson className="text-(--on-primary-container)"/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-(--on-background)">{t('jsonFormatter.title')}</h1>
                            <p className="text-(--on-surface-variant)">{t('jsonFormatter.subtitle')}</p>
                        </div>
                    </div>

                    {/* Main Input Section  */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('jsonFormatter.input.placeholder')}
                                className="w-full px-4 py-3 pr-32 bg-(--surface-container-high) border border-(--outline-variant) rounded-xl text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all"
                                disabled={loading}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                                <button
                                    onClick={handleFetch}
                                    disabled={loading || !url}
                                    className="cursor-pointer px-4 py-2 bg-(--primary) text-(--on-primary) rounded-lg hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                                >
                                    <VscGitFetch/>
                                    {loading ? t('jsonFormatter.buttons.fetching') : t('jsonFormatter.buttons.fetch')}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={chooseJsonFileFromSystem}
                            className="cursor-pointer px-6 py-3 bg-(--surface-container-high) text-(--on-surface) border border-(--outline-variant) rounded-xl hover:bg-(--surface-container-highest) transition-colors font-medium flex items-center gap-3"
                        >
                            <TfiImport/>
                            {t('jsonFormatter.buttons.importFile')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                {/* Left Panel - Search & Stats */}
                <div className="w-80 flex flex-col gap-6">
                    {/* Search Component */}
                    <SearchJsonComponent
                        jsonContent={response}
                        onSearchChange={performSearch}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        searchResults={searchResults}
                        searchCount={searchCount}
                        searchLoading={searchLoading}
                        currentMatchIndex={currentMatchIndex}
                        onNavigateMatch={handleNavigateMatch}
                    />

                    {/* Stats Panel */}
                    <JsonStatsPanel
                        storedFiles={storedFiles}
                        showStoredFiles={showStoredFiles}
                        setShowStoredFiles={setShowStoredFiles}
                        onLoadStoredFile={loadStoredFile}
                        onDeleteStoredFile={deleteStoredFile}
                        outputLength={outputLength}
                        response={response}
                        searchCount={searchCount}
                        currentMatchIndex={currentMatchIndex}
                    />
                </div>

                {/* Right Panel - JSON Editor */}
                <JsonEditorPanel
                    response={response}
                    isEditing={isEditing}
                    saveFileName={saveFileName}
                    searchCount={searchCount}
                    currentMatchIndex={currentMatchIndex}
                    onPasteJson={handlePasteJson}
                    onSaveEdit={handleSaveEdit}
                    onSaveAs={handleSaveAs}
                    onFormatJson={handleFormatJson}
                    onCopy={handleCopy}
                    onClear={handleClear}
                    onEditChange={handleEditChange}
                    searchTerm={searchTerm}
                    searchResults={searchResults}
                    editorRef={editorRef}
                    onImportFile={chooseJsonFileFromSystem}
                />
            </div>

            {/* Save Dialog  */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-(--surface-container) rounded-xl border border-(--outline-variant) p-6 w-96">
                        <h3 className="text-lg font-semibold text-(--on-surface) mb-4">
                            {t('jsonFormatter.saveDialog.title')}
                        </h3>
                        <input
                            type="text"
                            value={saveFileName}
                            onChange={(e) => setSaveFileName(e.target.value)}
                            placeholder={t('jsonFormatter.saveDialog.placeholder')}
                            className="w-full px-3 py-2 bg-(--surface-container-high) border border-(--outline-variant) rounded-lg text-(--on-surface) mb-4 focus:outline-none focus:ring-2 focus:ring-(--primary)"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setSaveFileName("");
                                }}
                                className="cursor-pointer px-4 py-2 bg-(--error) text-(--on-error) rounded-lg transition-colors"
                            >
                                {t('jsonFormatter.buttons.cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    handleSaveJson();
                                    setShowSaveDialog(false);
                                }}
                                disabled={!saveFileName.trim()}
                                className="cursor-pointer px-4 py-2 bg-(--tertiary) text-(--on-tertiary) rounded-lg hover:bg-(--tertiary-fixed) hover:text-(--on-tertiary-fixed) transition-colors disabled:opacity-50"
                            >
                                {t('jsonFormatter.buttons.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastVisible && <DaisyToast message={toastMessage}/>}
        </div>
    );
}