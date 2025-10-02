import {invoke} from "@tauri-apps/api/core";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import DaisyToast from "./DaisyToast.jsx";
import {TiCloudStorageOutline} from "react-icons/ti";

export default function JsonFormatUrlComponent() {
    const [url, setUrl] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [outputLength, setOutputLength] = useState(0);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const {t} = useTranslation();

    const handleFetch = async () => {
        if (!url) return;

        setLoading(true);

        try {
            const result = await invoke("fetch_json", {url});
            setResponse(result);
            setOutputLength(result.length);
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
            console.log("Starting file picker...");
            const fileContent = await invoke("pick_json_file");
            console.log("File content received:", fileContent);

            if (fileContent) {
                // Try to format the JSON content
                try {
                    const formattedJson = await invoke("format_json", {jsonString: fileContent});
                    setResponse(formattedJson);
                    setOutputLength(formattedJson.length);
                    showToast(t('jsonFormatter.toast.importSuccess'));
                } catch (formatError) {
                    console.log("Formatting error:", formatError);
                    // If formatting fails, show raw content with error
                    setResponse(`${t('jsonFormatter.errors.formatError')}: ${formatError}\n\n${t('jsonFormatter.rawContent')}:\n${fileContent}`);
                    setOutputLength(fileContent.length);
                    showToast(t('jsonFormatter.toast.importInvalid'));
                }
            } else {
                console.log("No file content received");
                showToast(t('jsonFormatter.toast.noContent'));
            }
        } catch (error) {
            console.error("File import error:", error);
            showToast(t('jsonFormatter.toast.importError', {error}));
        }
    };

    const handleFormatJson = async () => {
        if (!response.trim()) return;

        try {
            const formatted = await invoke("format_json", {jsonString: response});
            setResponse(formatted);
            setOutputLength(formatted.length);
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

        try {
            await invoke("save_json_as_file", {jsonString: response});
            showToast(t('jsonFormatter.toast.saveSuccess'));
        } catch (error) {
            console.error("Save error:", error);
            showToast(t('jsonFormatter.toast.saveError', {error}));
        }
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
        showToast(t('jsonFormatter.toast.clearSuccess'));
    };

    const quickExamples = [
        {
            name: t('jsonFormatter.examples.samplePost.name'),
            url: "https://jsonplaceholder.typicode.com/posts/1"
        },
        {
            name: t('jsonFormatter.examples.marsApi.name'),
            url: "https://eyes.nasa.gov/apps/solar-system/descriptions/mars.json"
        },
        {
            name: t('jsonFormatter.examples.agePrediction.name'),
            url: "https://api.agify.io?name=michael"
        }
    ];

    // Simple SVG icons as components
    const FileJsonIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
    );

    const DownloadIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
    );

    const FetchIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
    );

    const ImportIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
        </svg>
    );

    const FormatIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        </svg>
    );

    const CopyIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
    );

    const ClearIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
    );

    const TextIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/>
        </svg>
    );

    return (
        <div className="ml-20 flex flex-col h-screen bg-(--background) text-(--on-background)">
            {/* Header */}
            <div className="border-b border-(--outline-variant) bg-(--surface-container)">
                <div className="px-8 py-6">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-(--primary-container) rounded-xl flex items-center justify-center">
                            <FileJsonIcon/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-(--on-background)">{t('jsonFormatter.title')}</h1>
                            <p className="text-(--on-surface-variant)">{t('jsonFormatter.subtitle')}</p>
                        </div>
                    </div>

                    {/* Main Input Section */}
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
                                    <FetchIcon/>
                                    {loading ? t('jsonFormatter.buttons.fetching') : t('jsonFormatter.buttons.fetch')}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={chooseJsonFileFromSystem}
                            className="cursor-pointer px-6 py-3 bg-(--surface-container-high) text-(--on-surface) border border-(--outline-variant) rounded-xl hover:bg-(--surface-container-highest) transition-colors font-medium flex items-center gap-3"
                        >
                            <ImportIcon/>
                            {t('jsonFormatter.buttons.importFile')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                {/* Left Panel - Input/Quick Actions */}
                <div className="w-80 flex flex-col gap-6">
                    {/* Quick Examples */}
                    <div className="bg-(--surface-container) rounded-xl border border-(--outline-variant) p-5">
                        <h3 className="text-lg font-semibold text-(--on-surface) mb-4 flex items-center gap-2">
                            <DownloadIcon/>
                            {t('jsonFormatter.quickExamples.title')}
                        </h3>
                        <div className="space-y-2">
                            {quickExamples.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => setUrl(example.url)}
                                    className="cursor-pointer w-full text-left p-3 bg-(--surface-container-high) hover:bg-(--surface-container-highest) rounded-lg transition-colors group"
                                >
                                    <div
                                        className="text-sm font-medium text-(--on-surface) group-hover:text-(--primary)">
                                        {example.name}
                                    </div>
                                    <div className="text-xs text-(--on-surface-variant) truncate mt-1">
                                        {example.url}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="bg-(--surface-container) rounded-xl border border-(--outline-variant) p-5">
                        <h3 className="text-lg font-semibold text-(--on-surface) mb-4">{t('jsonFormatter.documentInfo.title')}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-(--on-surface-variant)">{t('jsonFormatter.documentInfo.length')}</span>
                                <span
                                    className="font-mono text-(--on-surface)">{outputLength} {t('jsonFormatter.documentInfo.chars')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-(--on-surface-variant)">{t('jsonFormatter.documentInfo.lines')}</span>
                                <span className="font-mono text-(--on-surface)">
                                    {response ? response.split('\n').length : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-(--on-surface-variant)">{t('jsonFormatter.documentInfo.status')}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    response
                                        ? 'bg-(--success-container) text-(--on-success-container)'
                                        : 'bg-(--surface-container-high) text-(--on-surface-variant)'
                                }`}>
                                    {response ? t('jsonFormatter.documentInfo.loaded') : t('jsonFormatter.documentInfo.empty')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - JSON Editor */}
                <div
                    className="flex-1 flex flex-col bg-(--surface-container) rounded-xl border border-(--outline-variant) overflow-hidden">
                    {/* Editor Header */}
                    <div
                        className="flex justify-between items-center p-4 border-b border-(--outline-variant) bg-(--surface-container-high)">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-(--on-surface)">{t('jsonFormatter.editor.title')}</h3>
                            <div className="flex items-center gap-2 text-sm text-(--on-surface-variant)">
                                <TextIcon/>
                                {outputLength} {t('jsonFormatter.documentInfo.chars')}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveJson}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--tertiary-container) text-(--on-tertiary-container) rounded-lg hover:bg-(--tertiary) hover:text-(--on-tertiary) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <TiCloudStorageOutline />
                                {t('jsonFormatter.buttons.save')}
                            </button>
                            <button
                                onClick={handleFormatJson}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--secondary-container) text-(--on-secondary-container) rounded-lg hover:bg-(--secondary) hover:text-(--on-secondary) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <FormatIcon/>
                                {t('jsonFormatter.buttons.format')}
                            </button>
                            <button
                                onClick={handleCopy}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <CopyIcon/>
                                {t('jsonFormatter.buttons.copy')}
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={!response}
                                className="cursor-pointer px-4 py-2 bg-(--error-container) text-(--on-error-container) rounded-lg hover:bg-(--error) hover:text-(--on-error) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                            >
                                <ClearIcon/>
                                {t('jsonFormatter.buttons.clear')}
                            </button>
                        </div>
                    </div>

                    {/* JSON Editor */}
                    <div className="flex-1 relative">
                        {response ? (
                            <pre
                                className="absolute inset-0 p-6 bg-(--surface-container-high) text-(--on-surface) font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed">
                                {response}
                            </pre>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-md">
                                    <div
                                        className="w-16 h-16 bg-(--surface-container-highest) rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileJsonIcon/>
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
                                            <ImportIcon/>
                                            {t('jsonFormatter.buttons.importFile')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toastVisible && <DaisyToast message={toastMessage}/>}
        </div>
    );
}