export default function DocumentStats({wordCount, charCount}) {
    return (
        <div className="flex items-center gap-4 text-sm text-(--on-surface-variant)">
            <div
                className="flex items-center gap-1 bg-(--surface) px-3 py-1 rounded-full border border-(--outline)">
                <span className="w-2 h-2 bg-(--error) rounded-full animate-pulse"></span>
                <span>{wordCount} words</span>
            </div>
            <div
                className="flex items-center gap-1 bg-(--surface) px-3 py-1 rounded-full border border-(--outline)">
                <span className="w-2 h-2 bg-(--tertiary) rounded-full"></span>
                <span>{charCount} chars</span>
            </div>
        </div>
    )
}