import {useTranslation} from "react-i18next";
import {FaChevronDown, FaChevronUp, FaSearch, FaTimes} from "react-icons/fa";

export default function SearchJsonComponent({
                                                jsonContent,
                                                onSearchChange,
                                                searchTerm,
                                                onSearchTermChange,
                                                searchResults,
                                                searchCount,
                                                searchLoading,
                                                currentMatchIndex,
                                                onNavigateMatch
                                            }) {
    const {t} = useTranslation();

    const handleSearchChange = (e) => {
        onSearchTermChange(e.target.value);
    };

    const navigateToMatch = (direction) => {
        if (searchResults.length === 0) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = currentMatchIndex >= searchResults.length - 1 ? 0 : currentMatchIndex + 1;
        } else {
            newIndex = currentMatchIndex <= 0 ? searchResults.length - 1 : currentMatchIndex - 1;
        }
        onNavigateMatch(newIndex);
    };

    return (
        <div className="bg-(--surface-container) rounded-xl border border-(--outline-variant) p-5">
            <h3 className="text-lg font-semibold text-(--on-surface) mb-4 flex items-center gap-2">
                <FaSearch/>
                {t('jsonFormatter.search.title')}
            </h3>

            <div className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={t('jsonFormatter.search.placeholder')}
                        className="w-full px-4 py-2 pl-10 pr-24 bg-(--surface-container-high) border border-(--outline-variant) rounded-lg text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
                        disabled={!jsonContent}
                    />
                    <FaSearch
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--on-surface-variant)"/>

                    {/* Navigation buttons */}
                    {searchCount > 0 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                            <button
                                onClick={() => navigateToMatch('prev')}
                                disabled={searchCount === 0}
                                className="cursor-pointer p-1 text-(--on-surface-variant) hover:text-(--primary) disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t('jsonFormatter.search.previous')}
                            >
                                <FaChevronUp size={12}/>
                            </button>
                            <span className="text-xs text-(--on-surface-variant) flex items-center px-1">
                {currentMatchIndex + 1}/{searchCount}
              </span>
                            <button
                                onClick={() => navigateToMatch('next')}
                                disabled={searchCount === 0}
                                className="cursor-pointer p-1 text-(--on-surface-variant) hover:text-(--primary) disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t('jsonFormatter.search.next')}
                            >
                                <FaChevronDown size={12}/>
                            </button>
                        </div>
                    )}
                </div>

                {/* Search Status */}
                <div className="text-sm text-(--on-surface-variant) min-h-[20px]">
                    {searchLoading && (
                        <div>{t('jsonFormatter.search.searching')}</div>
                    )}
                    {!searchLoading && searchTerm && (
                        <div>
                            {searchCount > 0 ? (
                                <span>
                  {t('jsonFormatter.search.results', {count: searchCount})}
                </span>
                            ) : (
                                <span>{t('jsonFormatter.search.noMatches')}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}