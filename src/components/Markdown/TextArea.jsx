import {useRef} from "react";

export const Textarea = ({ value, onChange, placeholder, className = '' }) => {
    const textareaRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = value.substring(0, start) + '  ' + value.substring(end);

            onChange(newValue);

            setTimeout(() => {
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
            }, 0);
        }

        // Handle Enter key with smart indentation
        if (e.key === 'Enter') {
            const start = e.target.selectionStart;
            const textBeforeCursor = value.substring(0, start);
            const lines = textBeforeCursor.split('\n');
            const currentLine = lines[lines.length - 1];

            // Count leading spaces/tabs for auto-indentation
            const match = currentLine.match(/^(\s*)/);
            const leadingWhitespace = match ? match[1] : '';

            if (leadingWhitespace) {
                e.preventDefault();
                const newValue = value.substring(0, start) + '\n' + leadingWhitespace + value.substring(end);
                onChange(newValue);

                setTimeout(() => {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1 + leadingWhitespace.length;
                }, 0);
            }
        }
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className={`w-full h-full p-4 bg-(--surface-container) text-(--on-surface-container) resize-none outline-none font-mono text-sm leading-relaxed scrollbar-thin placeholder:text-(--on-surface-variant) whitespace-pre-wrap break-words overflow-x-hidden selection:bg-(--primary)/30 caret-(--primary) ${className}`}
            placeholder={placeholder}
            style={{
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                tabSize: 2,
                MozTabSize: 2,
                OTabSize: 2
            }}
        />
    );
};