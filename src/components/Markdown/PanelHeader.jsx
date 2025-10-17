export default function PanelHeader({title, status, color}) {
    const colorClasses = {
        green: "bg-green-400",
        blue: "bg-blue-400"
    };

    return (
        <div className="flex-shrink-0 flex items-center gap-2 text-xs text-(--on-surface-variant) mb-2">
            <div
                className="bg-(--surface-container) px-3 py-1 rounded-t-lg border border-b-0 border-(--outline) font-medium text-(--on-surface-container)">
                {title}
            </div>
            <div className="flex items-center gap-1">
                <span
                    className={`w-1.5 h-1.5 ${colorClasses[color]} rounded-full ${color === 'green' ? 'animate-pulse' : ''}`}></span>
                <span>{status}</span>
            </div>
        </div>
    );
}