import {invoke} from "@tauri-apps/api/core";
import {useState, useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import DaisyToast from "./DaisyToast.jsx";
import SearchJsonComponent from "./SearchJsonComponent.jsx";
import {TiCloudStorageOutline} from "react-icons/ti";
import {FaCheck, FaCloudDownloadAlt, FaPaste, FaRegCopy, FaTrash, FaChevronDown} from "react-icons/fa";
import {LuFileJson} from "react-icons/lu";
import {VscGitFetch} from "react-icons/vsc";
import {TfiImport} from "react-icons/tfi";
import {CiTextAlignCenter} from "react-icons/ci";
import {MdImportExport, MdOutlineFormatIndentIncrease} from "react-icons/md";
import {RiDeleteBack2Fill} from "react-icons/ri";
import {BsFiletypeJson} from "react-icons/bs";

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
            setCurrentMatchIndex(0); // Reset to first match
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

    const highlightJsonWithMatches = (jsonText, matches, currentMatchIdx) => {
        if (!matches || matches.length === 0) return jsonText;

        // Flatten all matches from all lines
        const allMatches = [];
        matches.forEach((searchMatch) => {
            searchMatch.matches.forEach((match) => {
                allMatches.push({
                    ...match,
                    lineNumber: searchMatch.line_number,
                    line: searchMatch.line
                });
            });
        });

        // Sort matches by their position in the document
        const sortedMatches = [...allMatches].sort((a, b) => {
            if (a.lineNumber !== b.lineNumber) {
                return a.lineNumber - b.lineNumber;
            }
            return a.start - b.start;
        });

        let result = "";
        const lines = jsonText.split('\n');
        let matchIndex = 0;

        lines.forEach((line, lineIndex) => {
            const lineNumber = lineIndex + 1;
            const lineMatches = sortedMatches.filter(m => m.lineNumber === lineNumber);

            if (lineMatches.length > 0) {
                let highlightedLine = "";
                let lastIndex = 0;

                lineMatches.forEach((match, matchInLineIndex) => {
                    const globalMatchIndex = matchIndex + matchInLineIndex;

                    highlightedLine += line.substring(lastIndex, match.start);

                    const isCurrentMatch = globalMatchIndex === currentMatchIdx;
                    const highlightClass = isCurrentMatch
                        ? 'bg-(--tertiary) text-(--on-tertiary) ring-2 ring-(--tertiary)'
                        : 'bg-yellow-200 text-yellow-900';

                    highlightedLine += `<span id="match-${globalMatchIndex}" class="${highlightClass} px-0.5 rounded mx-0.5 transition-all duration-200">${line.substring(match.start, match.end)}</span>`;
                    lastIndex = match.end;
                });

                // Add remaining text after last match
                highlightedLine += line.substring(lastIndex);
                result += highlightedLine + '\n';
                matchIndex += lineMatches.length;
            } else {
                result += line + '\n';
            }
        });

        return result;
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
                    setSearchTerm(""); // Reset search when importing new file
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
            setSearchTerm(""); // Reset search when loading stored file
            setSearchResults([]);
            setSearchCount(0);
            setCurrentMatchIndex(0);
            showToast(t('jsonFormatter.toast.fileLoaded'));
        } catch (error) {
            console.error("Failed to load file:", error);
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
                            <LuFileJson/>
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
                {/* Left Panel - Input/Quick Actions */}
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

                    {/* Stored Files Dropdown  */}
                    <div className="bg-(--surface-container) rounded-xl border border-(--outline-variant) p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-(--on-surface) flex items-center gap-2">
                                <TiCloudStorageOutline/>
                                {t('jsonFormatter.storedFiles.title')}
                            </h3>
                            <button
                                onClick={() => setShowStoredFiles(!showStoredFiles)}
                                className="cursor-pointer p-2 hover:bg-(--surface-container-high) rounded-lg transition-colors"
                            >
                                <FaChevronDown className={`transition-transform ${showStoredFiles ? 'rotate-180' : ''}`}/>
                            </button>
                        </div>

                        {showStoredFiles && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {storedFiles.length === 0 ? (
                                    <p className="text-(--on-surface-variant) text-sm text-center py-4">
                                        {t('jsonFormatter.storedFiles.empty')}
                                    </p>
                                ) : (
                                    storedFiles.map((fileName, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-(--surface-container-high) hover:bg-(--surface-container-highest) rounded-lg transition-colors group"
                                        >
                                            <button
                                                onClick={() => loadStoredFile(fileName)}
                                                className="cursor-pointer flex-1 text-left"
                                            >
                                                <div className="text-sm font-medium text-(--on-surface) group-hover:text-(--tertiary) truncate">
                                                    {fileName}
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => deleteStoredFile(fileName, e)}
                                                className="cursor-pointer p-1 text-(--on-surface-variant) hover:text-(--error) transition-colors opacity-0 group-hover:opacity-100"
                                                title={t('jsonFormatter.buttons.delete')}
                                            >
                                                <FaTrash size={14}/>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats & Info */}
                    <div className="json-stats bg-(--surface-container) rounded-xl border border-(--outline-variant) p-5">
                        <h3 className="text-lg font-semibold text-(--on-surface) mb-4">{t('jsonFormatter.documentInfo.title')}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-(--on-surface-variant)">{t('jsonFormatter.documentInfo.length')}</span>
                                <span className="font-mono text-(--on-surface)">{outputLength} {t('jsonFormatter.documentInfo.chars')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-(--on-surface-variant)">{t('jsonFormatter.documentInfo.lines')}</span>
                                <span className="font-mono text-(--on-surface)">
                                    {response ? response.split('\n').length : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-(--on-surface-variant)">{t('jsonFormatter.documentInfo.status')}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    response
                                        ? 'bg-(--success-container) text-(--on-success-container)'
                                        : 'bg-(--surface-container-high) text-(--on-surface-variant)'
                                }`}>
                                    {response ? t('jsonFormatter.documentInfo.loaded') : t('jsonFormatter.documentInfo.empty')}
                                </span>
                            </div>
                            {searchCount > 0 && (
                                <>
                                    <div className="flex justify-between items-center pt-2 border-t border-(--outline-variant)">
                                        <span className="text-(--on-surface-variant)">{t('jsonFormatter.search.matches')}</span>
                                        <span className="font-mono text-(--primary) bg-(--primary-container) px-2 py-1 rounded">
                                            {searchCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-(--on-surface-variant)">{t('jsonFormatter.search.currentMatch')}</span>
                                        <span className="font-mono text-(--secondary) bg-(--secondary-container) px-2 py-1 rounded">
                                            {currentMatchIndex + 1}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - JSON Editor */}
                <div
                    className="flex-1 flex md:h-[710px] lg:h-[710px] flex-col bg-(--surface-container) rounded-xl border border-(--outline-variant) overflow-hidden">
                    {/* Editor Header */}
                    <div
                        className="flex justify-between items-center p-4 border-b border-(--outline-variant) bg-(--surface-container-high)">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-(--on-surface)">{t('jsonFormatter.editor.title')}</h3>
                            <div className="flex items-center gap-2 text-sm text-(--on-surface-variant)">
                                <CiTextAlignCenter/>
                                {outputLength} {t('jsonFormatter.documentInfo.chars')}
                            </div>
                            {saveFileName && (
                                <span className="text-xs px-2 py-1 bg-(--primary-container) text-(--on-primary-container) rounded-full">
                                    {saveFileName}
                                </span>
                            )}
                            {searchCount > 0 && (
                                <span className="text-xs px-2 py-1 bg-(--secondary-container) text-(--on-secondary-container) rounded-full">
                                    {currentMatchIndex + 1}/{searchCount} {t('jsonFormatter.search.matches')}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <button
                                    onClick={handleSaveEdit}
                                    className="cursor-pointer px-4 py-2 bg-(--success-container) text-(--on-success-container) rounded-lg hover:bg-(--success) hover:text-(--on-success) transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <FaCheck/>
                                    {t('jsonFormatter.buttons.doneEditing')}
                                </button>
                            ) : (
                                <button
                                    onClick={handlePasteJson}
                                    className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <FaPaste/>
                                    {t('jsonFormatter.buttons.pasteJson')}
                                </button>
                            )}
                            <button
                                onClick={handleSaveAs}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--tertiary-container) text-(--on-tertiary-container) rounded-lg hover:bg-(--tertiary) hover:text-(--on-tertiary) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <TiCloudStorageOutline/>
                                {t('jsonFormatter.buttons.saveAs')}
                            </button>
                            <button
                                onClick={handleFormatJson}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--secondary-container) text-(--on-secondary-container) rounded-lg hover:bg-(--secondary) hover:text-(--on-secondary) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <MdOutlineFormatIndentIncrease/>
                                {t('jsonFormatter.buttons.format')}
                            </button>
                            <button
                                onClick={handleCopy}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <FaRegCopy/>
                                {t('jsonFormatter.buttons.copy')}
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--error-container) text-(--on-error-container) rounded-lg hover:bg-(--error) hover:text-(--on-error) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <RiDeleteBack2Fill/>
                                {t('jsonFormatter.buttons.clear')}
                            </button>
                        </div>
                    </div>

                    {/* JSON Editor - updated for highlighting */}
                    <div className="flex-1 relative select-text" ref={editorRef}>
                        {response || isEditing ? (
                            isEditing ? (
                                <textarea
                                    value={response}
                                    onChange={handleEditChange}
                                    className="absolute inset-0 p-6 bg-(--surface-container-high) text-(--on-surface) font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed resize-none border-0 focus:outline-none"
                                    placeholder={t('jsonFormatter.input.pastePlaceholder')}
                                    autoFocus
                                />
                            ) : (
                                <div className="absolute inset-0 overflow-auto">
                                    <pre className="p-6 bg-(--surface-container-high) text-(--on-surface) font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                        {searchTerm && searchResults.length > 0 ? (
                                            <div dangerouslySetInnerHTML={{
                                                __html: highlightJsonWithMatches(response, searchResults, currentMatchIndex)
                                            }} />
                                        ) : (
                                            response
                                        )}
                                   </pre>
                                </div>
                            )
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-md">
                                    <div
                                        className="w-16 h-16 bg-(--surface-container-highest) rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <BsFiletypeJson className="text-(--tertiary)" size={30}/>
                                    </div>
                                    <h4 className="text-lg font-medium text-(--on-surface) mb-2">
                                        {t('jsonFormatter.emptyState.title')}
                                    </h4>
                                    <p className="text-(--on-surface-variant) mb-4">
                                        {t('jsonFormatter.emptyState.description')}
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={chooseJsonFileFromSystem}
                                            className="cursor-pointer px-4 py-2 bg-(--primary) text-(--on-primary) rounded-lg hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <MdImportExport className="text-(--on-primary) font-bold" size={15}/>
                                            {t('jsonFormatter.buttons.importFile')}
                                        </button>
                                        <button
                                            onClick={handlePasteJson}
                                            className="cursor-pointer px-4 py-2 bg-(--secondary) text-(--on-secondary) rounded-lg hover:bg-(--secondary-container) hover:text-(--on-secondary-container) transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <FaPaste className="text-(--on-primary)" size={15}/>
                                            {t('jsonFormatter.buttons.pasteJson')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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