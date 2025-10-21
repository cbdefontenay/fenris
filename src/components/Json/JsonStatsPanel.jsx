import {useTranslation} from "react-i18next";
import {TiCloudStorageOutline} from "react-icons/ti";
import {FaChevronDown, FaTrash} from "react-icons/fa";

export default function JsonStatsPanel({
                                           storedFiles,
                                           showStoredFiles,
                                           setShowStoredFiles,
                                           onLoadStoredFile,
                                           onDeleteStoredFile,
                                           outputLength,
                                           response,
                                           searchCount,
                                           currentMatchIndex
                                       }) {
    const {t} = useTranslation();

    return (
        <div className="w-80 flex flex-col gap-6">
            {/* Stored Files Dropdown */}
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
                                        onClick={() => onLoadStoredFile(fileName)}
                                        className="cursor-pointer flex-1 text-left"
                                    >
                                        <div className="text-sm font-medium text-(--on-surface) group-hover:text-(--tertiary) truncate">
                                            {fileName}
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => onDeleteStoredFile(fileName, e)}
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
    );
}