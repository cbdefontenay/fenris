import {invoke} from "@tauri-apps/api/core";
import {useState, useRef, useEffect} from "react";

export const AiChatbotComponent = () => {
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("llama2");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const callOllama = async () => {
        if (!prompt.trim()) return;
        if (!model.trim()) {
            setError("Please select a model");
            return;
        }

        setLoading(true);
        setError("");

        // Add user message
        const userMessage = {role: "user", content: prompt, timestamp: new Date()};
        setMessages(prev => [...prev, userMessage]);

        const currentPrompt = prompt;
        setPrompt("");

        try {
            const answer = await invoke("ollama_api_call", {
                prompt: currentPrompt,
                model: model
            });

            // Add AI response (now contains HTML)
            const aiMessage = {
                role: "assistant",
                content: answer,
                timestamp: new Date(),
                isHtml: true
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            setError(`Error: ${err}`);
            console.error("Ollama API error:", err);
        } finally {
            setLoading(false);
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
    };

    // Safe HTML renderer component
    const SafeHtmlRenderer = ({htmlContent}) => {
        return (
            <div
                className="prose prose-sm max-w-none prose-headings:text-(--on-surface) prose-p:text-(--on-surface) prose-strong:text-(--on-surface) prose-em:text-(--on-surface) prose-code:text-(--on-surface) prose-pre:bg-(--surface-container-high) prose-pre:text-(--on-surface) prose-a:text-(--primary) prose-blockquote:text-(--on-surface-variant) prose-li:text-(--on-surface)"
                dangerouslySetInnerHTML={{__html: htmlContent}}
            />
        );
    };

    const availableModels = [
        "llama2",
        "llama2:13b",
        "llama2:70b",
        "llama3.2:3b",
        "codellama",
        "mistral",
        "mixtral",
        "phi",
        "neural-chat",
        "starling-lm",
        "orca-mini",
        "vicuna",
        "wizardcoder",
        "gemma3",
        "gemma3:4b",
        "gemma2",
        "gemma2:2b",
        "gemma2:9b",
        "llama3.1:8b",
        "llama3.1:70b",
        "llama3.3:70b",
        "phi3",
        "phi3:3.8b",
        "phi3:14b",
        "llava",
        "llava-llama3",
        "granite3.3",
        "deepseek-r1",
        "qwen2.5",
        "mistral-nemo",
        "dolphin-llama3",
        "moondream2"
    ];

    return (
        <div className="flex h-screen bg-(--background) ml-20">
            {/* Sidebar */}
            <div className="w-80 bg-(--surface-container) border-r border-(--outline-variant) p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-(--primary) rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-(--on-primary)" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-(--on-surface)">AI Chat</h1>
                        <p className="text-sm text-(--on-surface-variant)">Powered by Ollama</p>
                    </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-4 flex-1">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-(--on-surface)">Select Model</span>
                        </label>
                        <select
                            className="select select-bordered w-full bg-(--surface-container-high) border-(--outline-variant) text-(--on-surface)"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                        >
                            {availableModels.map((modelOption) => (
                                <option key={modelOption} value={modelOption}>
                                    {modelOption}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chat Info */}
                    <div className="stats shadow bg-(--surface-container-high)">
                        <div className="stat">
                            <div className="stat-title text-(--on-surface-variant)">Messages</div>
                            <div className="stat-value text-(--on-surface)">{messages.length}</div>
                        </div>
                    </div>

                    {/* Clear Chat Button */}
                    <button
                        onClick={clearChat}
                        className="btn btn-outline w-full border-(--error) text-(--error) hover:bg-(--error) hover:text-(--on-error)"
                        disabled={messages.length === 0}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Clear Chat
                    </button>
                </div>

                {/* Status */}
                <div className="mt-auto pt-6 border-t border-(--outline-variant)">
                    <div
                        className={`p-3 rounded-lg ${error ? 'bg-(--error-container) text-(--on-error-container)' : 'bg-(--primary-container) text-(--on-primary-container)'}`}>
                        <div>
                            <span className="text-sm">
                                {error || (loading ? "AI is thinking..." : "Ready to chat")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--surface-container-low)">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md">
                                <div
                                    className="w-20 h-20 bg-(--primary-container) rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-(--primary)" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-(--on-surface) mb-2">Start a conversation</h3>
                                <p className="text-(--on-surface-variant)">
                                    Ask anything to your AI assistant. Select a model and type your message below.
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-2xl rounded-2xl p-4 ${
                                    message.role === 'user'
                                        ? 'bg-(--primary) text-(--on-primary)'
                                        : 'bg-(--surface-container-high) text-(--on-surface) border border-(--outline-variant)'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                message.role === 'user'
                                                    ? 'bg-(--primary-container) text-(--on-primary-container)'
                                                    : 'bg-(--secondary-container) text-(--on-secondary-container)'
                                            }`}>
                                            {message.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <span className="text-sm opacity-70">
                                            {message.role === 'user' ? 'You' : model}
                                        </span>
                                        <span className="text-xs opacity-50">
                                            {message.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
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
                            <div
                                className="max-w-2xl rounded-2xl p-4 bg-(--surface-container-high) text-(--on-surface) border border-(--outline-variant)">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-6 h-6 rounded-full bg-(--secondary-container) text-(--on-secondary-container) flex items-center justify-center text-xs font-bold">
                                        AI
                                    </div>
                                    <span className="text-sm opacity-70">{model}</span>
                                </div>
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce"
                                         style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce"
                                         style={{animationDelay: '0.2s'}}></div>
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
                                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={callOllama}
                                disabled={loading || !prompt.trim()}
                                className="h-24 px-6 rounded-xl bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"
                                             style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"
                                             style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="text-sm text-(--on-surface-variant) mt-2">
                        Using model: <span className="font-mono text-(--primary)">{model}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};