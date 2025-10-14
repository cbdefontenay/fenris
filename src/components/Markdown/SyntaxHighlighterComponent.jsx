import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {themeMap} from "../../data/StateManagementFunctions/MarkdownHelpers.jsx";

export default function SyntaxHighlighterComponent({ theme, language, children, ...props }) {
    return (
        <SyntaxHighlighter
            style={themeMap[theme]}
            language={language}
            PreTag="div"
            className="rounded-lg border border-(--outline) shadow-lg syntax-highlighter"
            showLineNumbers
            wrapLines={false}
            showInlineLineNumbers={false}
            {...props}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    );
}