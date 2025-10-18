import { invoke } from "@tauri-apps/api/core";
import { readFile } from '@tauri-apps/plugin-fs';
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const AiChatbotComponent = () => {
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (modelsLoaded && availableModels.length > 0) {
            const savedModel = localStorage.getItem("ai-chat-model");
            if (savedModel && availableModels.includes(savedModel)) {
                setModel(savedModel);
            } else if (availableModels.length > 0) {
                setModel(availableModels[0]);
                localStorage.setItem("ai-chat-model", availableModels[0]);
            }
        }
    }, [modelsLoaded, availableModels]);

    useEffect(() => {
        if (model) {
            localStorage.setItem("ai-chat-model", model);
        }
    }, [model]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const models = await invoke("list_of_models");
                setAvailableModels(models);
                setModelsLoaded(true);
            } catch (err) {
                console.error("Failed to load models:", err);
                setError(t('aiChatbot.errors.failedToLoadModels'));
                const fallbackModels = ["llama2", "llama3", "mistral", "codellama"];
                setAvailableModels(fallbackModels);
                setModelsLoaded(true);
                if (!model) {
                    setModel(fallbackModels[0]);
                }
            }
        };
        loadModels();
    }, [t]);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError("");

            try {
                // Read file content using FileReader for browser compatibility
                const content = await readFileAsText(file);
                setFileContent(content);
            } catch (err) {
                setError(t('aiChatbot.errors.failedToReadFile'));
                console.error("Failed to read file:", err);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        });
    };

    const callOllama = async () => {
        if (!prompt.trim()) return;
        if (!model) {
            setError(t('aiChatbot.errors.pleaseSelectModel'));
            return;
        }

        setLoading(true);
        setError("");

        const userMessage = {
            role: "user",
            content: prompt,
            timestamp: new Date(),
            hasFile: !!selectedFile
        };
        setMessages(prev => [...prev, userMessage]);

        const currentPrompt = prompt;
        setPrompt("");

        try {
            const answer = await invoke("ollama_api_call", {
                prompt: currentPrompt,
                model: model,
                fileContent: selectedFile ? fileContent : null
            });

            const aiMessage = {
                role: "assistant",
                content: answer,
                timestamp: new Date(),
                isHtml: true
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            setError(t('aiChatbot.errors.apiError', { error: err }));
            console.error("Ollama API error:", err);
        } finally {
            setLoading(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFileContent("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            callOllama();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError("");
        clearFile();
    };

    const SafeHtmlRenderer = ({ htmlContent }) => {
        return (
            <div className="ai-response-content">
                <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        );
    };

    return (
        <div className="page-margin flex h-screen bg-(--background) lg:ml-20">
            {/* Sidebar */}
            <div className="w-80 bg-(--surface-container) border-r border-(--outline-variant) p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-(--primary) rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-(--on-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-(--on-surface)">{t('aiChatbot.title')}</h1>
                        <p className="text-sm text-(--on-surface-variant)">{t('aiChatbot.poweredBy')}</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    {/* Model Selection */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-(--on-surface)">{t('aiChatbot.selectModel')}</span>
                        </label>
                        <select
                            className="select select-bordered w-full bg-(--surface-container-high) border-(--outline-variant) text-(--on-surface)"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            disabled={!modelsLoaded}
                        >
                            {!modelsLoaded ? (
                                <option value="">{t('aiChatbot.loadingModels')}</option>
                            ) : (
                                availableModels.map((modelOption) => (
                                    <option key={modelOption} value={modelOption}>
                                        {modelOption}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* File Upload */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-(--on-surface)">{t('aiChatbot.uploadFile')}</span>
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="file-input file-input-bordered w-full bg-(--surface-container-high) border-(--outline-variant) text-(--on-surface)"
                            accept=".md,.txt,.json,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.html,.css,.xml,.yaml,.yml,.rs,.go,.php,.rb"
                        />
                        {selectedFile && (
                            <div className="mt-2 p-2 bg-(--surface-container-high) rounded-lg flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-(--on-surface) block truncate">{selectedFile.name}</span>
                                    <span className="text-xs text-(--on-surface-variant)">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                                <button onClick={clearFile} className="btn btn-xs btn-ghost text-(--error) ml-2">
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Chat Info */}
                    <div className="stats shadow bg-(--surface-container-high)">
                        <div className="stat">
                            <div className="stat-title text-(--on-surface-variant)">{t('aiChatbot.messages')}</div>
                            <div className="stat-value text-(--on-surface)">{messages.length}</div>
                        </div>
                    </div>

                    {/* Clear Chat Button */}
                    <button
                        onClick={clearChat}
                        className="btn btn-outline w-full border-(--error) text-(--error) hover:bg-(--error) hover:text-(--on-error)"
                        disabled={messages.length === 0 && !selectedFile}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        {t('aiChatbot.clearChat')}
                    </button>
                </div>

                {/* Status */}
                <div className="mt-auto pt-6 border-t border-(--outline-variant)">
                    <div className={`p-3 rounded-lg ${error ? 'bg-(--error-container) text-(--on-error-container)' : 'bg-(--primary-container) text-(--on-primary-container)'}`}>
                        <span className="text-sm">
                            {error || (loading ? t('aiChatbot.status.thinking') : modelsLoaded ? t('aiChatbot.status.ready') : t('aiChatbot.status.loadingModels'))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="select-text flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--surface-container-low)">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-(--primary-container) rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-(--on-surface) mb-2">{t('aiChatbot.startConversation.title')}</h3>
                                <p className="text-(--on-surface-variant)">
                                    {t('aiChatbot.startConversation.description')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div key={index} className={`prose flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-2xl rounded-2xl p-4 ${
                                    message.role === 'user'
                                        ? 'bg-(--primary) text-(--on-primary)'
                                        : 'bg-(--surface-container-high) text-(--on-surface) border border-(--outline-variant)'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            message.role === 'user'
                                                ? 'bg-(--primary-container) text-(--on-primary-container)'
                                                : 'bg-(--secondary-container) text-(--on-secondary-container)'
                                        }`}>
                                            {message.role === 'user' ? t('aiChatbot.messageLabels.user') : t('aiChatbot.messageLabels.ai')}
                                        </div>
                                        <span className="text-sm opacity-70">
                                            {message.role === 'user' ? t('aiChatbot.messageLabels.you') : model}
                                        </span>
                                        <span className="text-xs opacity-50">
                                            {message.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {message.hasFile && (
                                        <div className="text-xs opacity-70 mb-2 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                                            </svg>
                                            {t('aiChatbot.withFile')}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">
                                        {message.isHtml ? (
                                            <SafeHtmlRenderer htmlContent={message.content}/>
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="max-w-2xl rounded-2xl p-4 bg-(--surface-container-high) text-(--on-surface) border border-(--outline-variant)">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-(--secondary-container) text-(--on-secondary-container) flex items-center justify-center text-xs font-bold">
                                        {t('aiChatbot.messageLabels.ai')}
                                    </div>
                                    <span className="text-sm opacity-70">{model}</span>
                                </div>
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Input Area */}
                <div className="border-t border-(--outline-variant) p-6 bg-(--surface-container)">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full h-24 p-4 resize-none rounded-xl border border-(--outline-variant) bg-(--surface-container-high) text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
                                placeholder={selectedFile ? t('aiChatbot.input.placeholderWithFile') : t('aiChatbot.input.placeholder')}
                                disabled={loading || !model}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={callOllama}
                                disabled={loading || !prompt.trim() || !model}
                                className="h-24 px-6 rounded-xl bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="text-sm text-(--on-surface-variant) mt-2">
                        {model ? (
                            <>
                                {t('aiChatbot.usingModel')}: <span className="font-mono text-(--primary)">{model}</span>
                                {selectedFile && (
                                    <span className="ml-2">
                                        • {t('aiChatbot.withFile')}: <span className="font-mono text-(--primary)">{selectedFile.name}</span>
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-(--error)">{t('aiChatbot.errors.pleaseSelectModelFirst')}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};