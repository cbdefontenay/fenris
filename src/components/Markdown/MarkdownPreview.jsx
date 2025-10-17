import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import SyntaxHighlighterComponent from "./SyntaxHighlighterComponent.jsx";
import {useState, useEffect, useMemo} from "react";
import {FiCopy, FiCheck} from "react-icons/fi";
import {useTranslation} from "react-i18next";

function CopyButton({text}) {
    const [copied, setCopied] = useState(false);
    const {t} = useTranslation();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-(--surface-container-high) border border-(--outline) hover:bg-(--surface-container-highest) transition-all duration-200 group"
            title={t('markdownEditor.preview.copyCode')}
        >
            {copied ? (
                <FiCheck size={12} className="text-green-500"/>
            ) : (
                <FiCopy size={12} className="text-(--on-surface-container-high) group-hover:text-(--primary)"/>
            )}
        </button>
    );
}

export default function MarkdownPreview({markdown, theme}) {
    const {t} = useTranslation();
    const [debouncedMarkdown, setDebouncedMarkdown] = useState(markdown);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMarkdown(markdown);
        }, 150);

        return () => clearTimeout(timer);
    }, [markdown]);

    const memoizedMarkdown = useMemo(() => {
        return (
            <ReactMarkdown
                children={debouncedMarkdown}
                remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const codeText = String(children).replace(/\n$/, '');

                        if (!inline && language) {
                            return (
                                <div className="relative group my-3 overflow-x-auto">
                                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                        <span
                                            className="text-xs px-2 py-1 bg-(--surface-container-high) text-(--on-surface-container-high) rounded border border-(--outline)">
                                            {language}
                                        </span>
                                        <CopyButton text={codeText}/>
                                    </div>
                                    <SyntaxHighlighterComponent
                                        theme={theme}
                                        language={language}
                                        {...props}
                                    >
                                        {children}
                                    </SyntaxHighlighterComponent>
                                </div>
                            );
                        }

                        return (
                            <code
                                className="bg-(--surface-container-high) text-(--on-surface-container-high) px-1.5 py-0.5 rounded text-xs font-mono border border-(--outline)/30 break-words max-w-full"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },

                    // ... keep all your other component definitions exactly as they are
                    li({node, children, ...props}) {
                        const taskListItem = node.children?.[0]?.type === 'input';
                        if (taskListItem) {
                            return (
                                <li className="flex items-start gap-2 list-none ml-0 my-1" {...props}>
                                    {children}
                                </li>
                            );
                        }
                        return <li className="text-(--on-surface) marker:text-(--primary) my-1" {...props}>{children}</li>;
                    },

                    input({node, checked, ...props}) {
                        if (props.type === "checkbox") {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className={`w-3.5 h-3.5 rounded border-2 mt-0.5 flex-shrink-0 transition-all duration-200
                                        ${checked
                                        ? "bg-(--primary) border-(--primary) text-(--on-primary)"
                                        : "bg-(--surface) border-(--outline) hover:border-(--primary)"}
                                    `}
                                    {...props}
                                />
                            );
                        }
                        return <input {...props} />;
                    },

                    a({node, ...props}) {
                        return (
                            <a
                                {...props}
                                className="text-(--primary) hover:text-(--secondary) transition-colors duration-200 font-medium underline text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        );
                    },

                    blockquote({node, ...props}) {
                        return (
                            <blockquote
                                className="border-l-3 border-(--primary) pl-3 py-1 my-3 bg-(--surface-container) text-(--on-surface-container) not-italic rounded-r text-sm"
                                {...props}
                            />
                        );
                    },

                    hr({node, ...props}) {
                        return (
                            <hr
                                className="my-4 border-t border-(--outline) opacity-30"
                                {...props}
                            />
                        );
                    },

                    table({node, ...props}) {
                        return (
                            <div className="overflow-x-auto my-3 border border-(--outline) rounded text-xs">
                                <table
                                    className="w-full border-collapse"
                                    {...props}
                                />
                            </div>
                        );
                    },

                    th({node, ...props}) {
                        return (
                            <th
                                className="bg-(--surface-container-high) text-(--on-surface-container-high) px-3 py-2 border-b border-(--outline) font-semibold text-left text-xs"
                                {...props}
                            />
                        );
                    },

                    td({node, ...props}) {
                        return (
                            <td
                                className="px-3 py-2 border-b border-(--outline) text-(--on-surface) text-xs"
                                {...props}
                            />
                        );
                    },

                    h1({node, ...props}) {
                        return <h1 className="text-2xl font-bold text-(--on-surface) pb-2 mb-3 mt-4" {...props} />;
                    },
                    h2({node, ...props}) {
                        return <h2 className="text-xl font-bold text-(--on-surface)  pb-1 mb-2 mt-3" {...props} />;
                    },
                    h3({node, ...props}) {
                        return <h3 className="text-lg font-bold text-(--on-surface) mb-1 mt-2" {...props} />;
                    },
                    h4({node, ...props}) {
                        return <h4 className="text-base font-bold text-(--on-surface) mb-1 mt-2" {...props} />;
                    },

                    p({node, ...props}) {
                        return <p className="text-(--on-surface) leading-relaxed mb-3 text-sm" {...props} />;
                    },

                    ul({node, ...props}) {
                        return <ul
                            className="text-(--on-surface) leading-6 mb-3 list-disc list-inside text-sm" {...props} />;
                    },
                    ol({node, ...props}) {
                        return <ol
                            className="text-(--on-surface) leading-6 mb-3 list-decimal list-inside text-sm" {...props} />;
                    },

                    strong({node, ...props}) {
                        return <strong className="text-(--primary) font-bold" {...props} />;
                    },

                    em({node, ...props}) {
                        return <em className="text-(--secondary) italic" {...props} />;
                    },

                    img({node, ...props}) {
                        return <img className="rounded border border-(--outline) max-w-full h-auto my-3" {...props}  alt=""/>;
                    },
                }}
            />
        );
    }, [debouncedMarkdown, theme, t]);

    return (
        <div className="markdown-preview text-sm">
            {memoizedMarkdown}
        </div>
    );
}