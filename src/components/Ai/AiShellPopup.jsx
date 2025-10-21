import {useEffect, useRef, useState} from "react";
import {useAiShell} from "../../context/AiContext.jsx";
import {invoke} from "@tauri-apps/api/core";
import AiShellSidebar from "./AiShellSidebar.jsx";
import AiShellChatArea from "./AiShellChatArea.jsx";
import {useTranslation} from "react-i18next";

export default function AiShellPopup() {
    const {showAiShell, setShowAiShell, prompt, setPrompt} = useAiShell();
    const [messages, setMessages] = useState([]);
    const [model, setModel] = useState("");
    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");

    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const loadModels = async () => {
            try {
                let allModels = [];

                try {
                    const baseModels = await invoke("list_of_models");
                    allModels = [...baseModels];
                    console.log("Base models loaded:", baseModels.length);
                } catch (baseErr) {
                }

                try {
                    const customModelsResult = await invoke("get_available_models_with_custom");
                    allModels = [...new Set([...allModels, ...customModelsResult])];
                    console.log("Models with custom:", allModels.length);
                } catch (customErr) {
                }

                setAvailableModels(allModels);
                setModelsLoaded(true);

                try {
                    const savedModel = await invoke("store_and_get_ai_model");
                    if (savedModel && allModels.includes(savedModel)) {
                        setModel(savedModel);
                        console.log("Using saved model:", savedModel);
                    } else if (allModels.length > 0) {
                        const defaultModel = allModels[0];
                        setModel(defaultModel);
                        await invoke("store_and_set_ai_model", {appAiModel: defaultModel});
                    }
                } catch (storeErr) {
                    const fallbackModel = localStorage.getItem("ai-shell-model") || (allModels.length > 0 ? allModels[0] : "llama3");
                    setModel(fallbackModel);
                }

            } catch (err) {
                setAvailableModels(["llama3", "mistral", "codellama"]);
                setModelsLoaded(true);
                if (!model) {
                    setModel("llama3");
                }
            }
        };

        if (showAiShell) {
            loadModels();
        }
    }, [showAiShell]);

    useEffect(() => {
        const saveModel = async () => {
            if (model) {
                try {
                    await invoke("store_and_set_ai_model", {appAiModel: model});
                } catch (err) {
                    // Fallback to localStorage
                    localStorage.setItem("ai-shell-model", model);
                }
            }
        };
        saveModel();
    }, [model]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (showAiShell && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showAiShell]);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError("");

            try {
                const content = await readFileAsText(file);
                setFileContent(content);
            } catch (err) {
                setError(t("aiChatbot.errors.failedToReadFile"));
                console.error("Failed to read file:", err);
                setSelectedFile(null);
            }
        }
    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error(t("aiChatbot.errors.failedToReadFile")));
            reader.readAsText(file);
        });
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFileContent("");
    };

    const callOllama = async () => {
        if (!prompt.trim()) return;
        if (!model) {
            setError(t("aiChatbot.errors.pleaseSelectModelFirst"));
            return;
        }

        setLoading(true);
        setError("");

        const userMessage = {
            id: Date.now(),
            type: "user",
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
                id: Date.now() + 1,
                type: "ai",
                content: answer,
                timestamp: new Date(),
                isHtml: true
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            setError(t("aiChatbot.errors.apiError", { error: err }));
            console.error("Ollama API error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        callOllama();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowAiShell(false);
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit(e);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError("");
        clearFile();
    };

    if (!showAiShell) return null;

    return (
        <div
            className="fixed inset-0 bg-(--background)/20 backdrop-blur-sm flex items-center justify-center z-50 font-sans"
            onClick={() => setShowAiShell(false)}
        >
            <div
                className="bg-(--surface) rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] mx-4 flex border border-(--outline-variant)/20"
                onClick={(e) => e.stopPropagation()}
            >
                <AiShellSidebar
                    model={model}
                    setModel={setModel}
                    availableModels={availableModels}
                    modelsLoaded={modelsLoaded}
                    selectedFile={selectedFile}
                    handleFileSelect={handleFileSelect}
                    clearFile={clearFile}
                    messages={messages}
                    clearChat={clearChat}
                    error={error}
                    loading={loading}
                />

                <AiShellChatArea
                    model={model}
                    selectedFile={selectedFile}
                    messages={messages}
                    loading={loading}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    handleSubmit={handleSubmit}
                    handleKeyDown={handleKeyDown}
                    setShowAiShell={setShowAiShell}
                    inputRef={inputRef}
                    messagesEndRef={messagesEndRef}
                />
            </div>
        </div>
    );
}