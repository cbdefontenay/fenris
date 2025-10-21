import { FiSend, FiX, FiCommand, FiClock, FiUser, FiFile } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useTranslation } from "react-i18next";

export default function AiShellChatArea({
                                            model,
                                            selectedFile,
                                            messages,
                                            loading,
                                            prompt,
                                            setPrompt,
                                            handleSubmit,
                                            handleKeyDown,
                                            setShowAiShell,
                                            inputRef,
                                            messagesEndRef
                                        }) {
    const { t } = useTranslation();

    const SafeHtmlRenderer = ({ htmlContent }) => {
        const sanitizedContent = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'i', 'b', 'u', 'code', 'pre',
                'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
            ],
            ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
            FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
            FORBID_ATTR: ['onclick', 'onload', 'onerror', 'style']
        });

        return (
            <div className="ai-response-content">
                <div className="prose prose-sm max-w-none prose-headings:text-(--on-surface) prose-p:text-(--on-surface) prose-strong:text-(--on-surface) prose-em:text-(--on-surface)  prose-pre:bg-(--surface-container-high) prose-pre:border prose-pre:border-(--outline-variant)">
                    {parse(sanitizedContent)}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--outline-variant)/20">
                <div>
                    <h2 className="text-lg font-semibold text-(--on-surface)">{t("aiShellChatBot.header.title")}</h2>
                    {model && (
                        <p className="text-sm text-(--on-surface-variant)">
                            {t("aiShellChatBot.header.usingModel")}: <span className="font-mono text-(--primary)">{model}</span>
                            {selectedFile && (
                                <span className="ml-2">
                                    • {t("aiShellChatBot.header.file")}: <span className="font-mono text-(--primary)">{selectedFile.name}</span>
                                </span>
                            )}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowAiShell(false)}
                    className="cursor-pointer p-2 hover:bg-(--surface-variant) rounded-lg transition-colors text-(--on-surface-variant) hover:text-(--on-surface)"
                >
                    <FiX className="text-xl" />
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            SafeHtmlRenderer={SafeHtmlRenderer}
                        />
                    ))
                )}
                {loading && <LoadingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput
                prompt={prompt}
                setPrompt={setPrompt}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                loading={loading}
                model={model}
                selectedFile={selectedFile}
                inputRef={inputRef}
            />
        </div>
    );
}

const EmptyState = () => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-(--primary-container) rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiRobot2Line className="w-8 h-8 text-(--primary)" />
                </div>
                <h3 className="text-lg font-semibold text-(--on-surface) mb-2">{t("aiShellChatBot.emptyState.title")}</h3>
                <p className="text-(--on-surface-variant) text-sm">
                    {t("aiShellChatBot.emptyState.description")}
                </p>
            </div>
        </div>
    );
};

const ChatMessage = ({ message, SafeHtmlRenderer }) => {
    const { t } = useTranslation();

    return (
        <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user'
                    ? 'bg-(--primary) text-(--on-primary)'
                    : 'bg-(--secondary-container) text-(--on-secondary-container)'
            }`}>
                {message.type === 'user' ? (
                    <FiUser className="text-sm" />
                ) : (
                    <RiRobot2Line className="text-sm" />
                )}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                        ? 'bg-(--primary) text-(--on-primary) rounded-br-md'
                        : 'bg-(--surface-variant) text-(--on-surface-variant) rounded-bl-md'
                }`}>
                    {message.hasFile && (
                        <div className="text-xs opacity-70 mb-2 flex items-center gap-1">
                            <FiFile className="text-xs" />
                            {t("aiShellChatBot.message.withAttachedFile")}
                        </div>
                    )}
                    {message.isHtml ? (
                        <SafeHtmlRenderer htmlContent={message.content} />
                    ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-(--outline-variant)">
                    <FiClock className="text-xs" />
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
};

const LoadingIndicator = () => (
    <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-(--secondary-container) text-(--on-secondary-container) flex items-center justify-center">
            <RiRobot2Line className="text-sm" />
        </div>
        <div className="px-4 py-3 rounded-2xl bg-(--surface-variant) text-(--on-surface-variant) rounded-bl-md">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-(--primary) rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
        </div>
    </div>
);

const ChatInput = ({
                       prompt,
                       setPrompt,
                       handleSubmit,
                       handleKeyDown,
                       loading,
                       model,
                       selectedFile,
                       inputRef
                   }) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-(--outline-variant)/20">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedFile ? t("aiShellChatBot.input.placeholderWithFile") : t("aiShellChatBot.input.placeholder")}
                        disabled={loading || !model}
                        className="w-full px-4 py-3 bg-(--surface-container) text-(--on-surface) rounded-xl border border-(--outline-variant)/30 focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent placeholder-(--outline-variant) pr-12 disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-(--outline-variant)">
                        <kbd className="px-1.5 py-0.5 text-xs bg-(--surface-variant) rounded border border-(--outline-variant)/30">Ctrl</kbd>
                        <kbd className="px-1.5 py-0.5 text-xs bg-(--surface-variant) rounded border border-(--outline-variant)/30">⏎</kbd>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading || !prompt.trim() || !model}
                    className="cursor-pointer px-6 py-3 bg-(--tertiary) text-(--on-tertiary) rounded-xl hover:bg-(--tertiary-container) disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium shadow-lg shadow-(--tertiary)/20"
                >
                    {loading ? (
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    ) : (
                        <>
                            <FiSend className="text-lg text-(--on-tertiary)" />
                            {t("aiShellChatBot.input.sendButton")}
                        </>
                    )}
                </button>
            </div>

            {/* Footer Hint */}
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-(--outline-variant)">
                <FiCommand className="text-xs" />
                <span>{t("aiShellChatBot.footer.hint")}</span>
            </div>
        </form>
    );
};