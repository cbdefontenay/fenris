import {useTranslation} from "react-i18next";
import {CiTextAlignCenter} from "react-icons/ci";
import {FaCheck, FaPaste, FaRegCopy} from "react-icons/fa";
import {MdOutlineFormatIndentIncrease} from "react-icons/md";
import {RiDeleteBack2Fill} from "react-icons/ri";
import {TiCloudStorageOutline} from "react-icons/ti";
import {BsFiletypeJson} from "react-icons/bs";
import {MdImportExport} from "react-icons/md";

export default function JsonEditorPanel({
                                            response,
                                            isEditing,
                                            saveFileName,
                                            searchCount,
                                            currentMatchIndex,
                                            onPasteJson,
                                            onSaveEdit,
                                            onSaveAs,
                                            onFormatJson,
                                            onCopy,
                                            onClear,
                                            onEditChange,
                                            searchTerm,
                                            searchResults,
                                            editorRef,
                                            onImportFile
                                        }) {
    const {t} = useTranslation();

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

                highlightedLine += line.substring(lastIndex);
                result += highlightedLine + '\n';
                matchIndex += lineMatches.length;
            } else {
                result += line + '\n';
            }
        });

        return result;
    };

    return (
        <div className="flex-1 flex flex-col bg-(--surface-container) rounded-xl border border-(--outline-variant) overflow-hidden min-h-[600px]">
            {/* Editor Header */}
            <div className="flex justify-between items-center p-4 border-b border-(--outline-variant) bg-(--surface-container-high)">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-(--on-surface)">{t('jsonFormatter.editor.title')}</h3>
                    <div className="flex items-center gap-2 text-sm text-(--on-surface-variant)">
                        <CiTextAlignCenter/>
                        {response?.length || 0} {t('jsonFormatter.documentInfo.chars')}
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
                            onClick={onSaveEdit}
                            className="cursor-pointer px-4 py-2 bg-(--success-container) text-(--on-success-container) rounded-lg hover:bg-(--success) hover:text-(--on-success) transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <FaCheck/>
                            {t('jsonFormatter.buttons.doneEditing')}
                        </button>
                    ) : (
                        <button
                            onClick={onPasteJson}
                            className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <FaPaste/>
                            {t('jsonFormatter.buttons.pasteJson')}
                        </button>
                    )}
                    <button
                        onClick={onSaveAs}
                        disabled={!response}
                        className="cursor-pointer px-4 py-2 bg-(--tertiary-container) text-(--on-tertiary-container) rounded-lg hover:bg-(--tertiary) hover:text-(--on-tertiary) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                        <TiCloudStorageOutline/>
                        {t('jsonFormatter.buttons.saveAs')}
                    </button>
                    <button
                        onClick={onFormatJson}
                        disabled={!response}
                        className="cursor-pointer px-4 py-2 bg-(--secondary-container) text-(--on-secondary-container) rounded-lg hover:bg-(--secondary) hover:text-(--on-secondary) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                        <MdOutlineFormatIndentIncrease/>
                        {t('jsonFormatter.buttons.format')}
                    </button>
                    <button
                        onClick={onCopy}
                        disabled={!response}
                        className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                        <FaRegCopy/>
                        {t('jsonFormatter.buttons.copy')}
                    </button>
                    <button
                        onClick={onClear}
                        disabled={!response}
                        className="cursor-pointer px-4 py-2 bg-(--error-container) text-(--on-error-container) rounded-lg hover:bg-(--error) hover:text-(--on-error) transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                        <RiDeleteBack2Fill/>
                        {t('jsonFormatter.buttons.clear')}
                    </button>
                </div>
            </div>

            {/* JSON Editor Content */}
            <div className="flex-1 relative select-text" ref={editorRef}>
                {response || isEditing ? (
                    isEditing ? (
                        <textarea
                            value={response}
                            onChange={onEditChange}
                            className="absolute inset-0 p-6 bg-(--surface-container-high) text-(--on-surface) font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed resize-none border-0 focus:outline-none w-full h-full"
                            placeholder={t('jsonFormatter.input.pastePlaceholder')}
                            autoFocus
                        />
                    ) : (
                        <div className="absolute inset-0 overflow-auto">
                            <pre className="p-6 bg-(--surface-container-high) text-(--on-surface) font-mono text-sm whitespace-pre-wrap leading-relaxed w-full h-full">
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
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="text-center max-w-md">
                            <div className="w-16 h-16 bg-(--surface-container-highest) rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                                    onClick={onImportFile}
                                    className="cursor-pointer px-4 py-2 bg-(--primary) text-(--on-primary) rounded-lg hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <MdImportExport className="text-(--on-primary)" size={15}/>
                                    {t('jsonFormatter.buttons.importFile')}
                                </button>
                                <button
                                    onClick={onPasteJson}
                                    className="cursor-pointer px-4 py-2 bg-(--secondary) text-(--on-secondary) rounded-lg hover:bg-(--secondary-container) hover:text-(--on-secondary-container) transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <FaPaste className="text-(--on-secondary)" size={15}/>
                                    {t('jsonFormatter.buttons.pasteJson')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}