import {useShell} from "../context/ShellContext.jsx";

export default function ShellPopup() {
    const {
        showShell,
        setShowShell,
        command,
        setCommand,
        history,
        handleCommandSubmit
    } = useShell();

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowShell(false);
        }
    };

    if (!showShell) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-(--surface-container-high) rounded-lg w-3/4 max-w-2xl h-96 flex flex-col border border-(--outline-variant)"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-2 bg-(--tertiary) rounded-t-lg">
                    <span className="text-(--on-tertiary) font-medium">Terminal</span>
                    <button
                        onClick={() => setShowShell(false)}
                        className="cursor-pointer text-(--on-tertiary) hover:text-(--tertiary-container) text-lg transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Output Area */}
                <div
                    className="flex-1 p-4 font-mono text-sm text-(--tertiary) overflow-y-auto bg-(--surface-container-lowest) whitespace-pre-wrap">
                    <div className="text-(--on-surface-variant)">
                        Welcome to Shell. Type 'help' for available commands.
                    </div>
                    {history.map((item, index) => (
                        <div key={index} className="mt-2">
                            <div className="text-(--tertiary) font-semibold">$ {item.command}</div>
                            {item.output && (
                                <div className="text-(--on-surface) italic whitespace-pre-wrap">
                                    {item.output}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleCommandSubmit} className="border-t border-(--outline-variant)">
                    <div className="flex items-center px-4 py-2 bg-(--surface-container-low)">
                        <span className="text-(--tertiary) font-mono mr-2">
                            $
                        </span>
                        <input
                            type="text"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            className="flex-1 bg-transparent text-(--on-surface) font-mono outline-none border-none placeholder-(--on-surface-variant)"
                            placeholder="Type a command..."
                            autoFocus
                        />
                    </div>
                </form>

                {/* Footer Hint */}
                <div className="px-4 py-1 bg-(--inverse-primary) text-xs text-(--on-inverse-primary) rounded-b-lg">
                    Press Ctrl+T to open, Esc to close
                </div>
            </div>
        </div>
    );
}