import {useShell} from "../context/ShellContext.jsx";
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

export default function ShellPopup() {
    const {
        showShell,
        setShowShell,
        command,
        setCommand,
        history,
        handleCommandSubmit
    } = useShell();
    const [shellName, setShellName] = useState("");

    useEffect(() => {
        if (showShell) {
            invoke("cli_design").then((result) => {
                setShellName(result);
            }).catch(() => {
                setShellName("user@fenris:~$");
            });
        }
    }, [showShell]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowShell(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowShell(false);
        }
    };

    if (!showShell) return null;

    return (
        <div
            className="fixed inset-0 bg-(--background)/50 backdrop-blur-sm flex items-center justify-center z-100 font-mono"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
        >
            <div
                className="bg-black rounded-lg w-4/5 max-w-4xl h-2/4 flex flex-col border border-gray-800 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Terminal Header Bar */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-900 rounded-t-lg border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 cursor-pointer"
                                 onClick={() => setShowShell(false)}></div>
                            </div>
                        <span className="text-gray-300 text-sm ml-2">Terminal</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        {shellName}
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 p-4 text-sm overflow-y-auto bg-black">
                    {/* Command History */}
                    {history.map((item, index) => (
                        <div key={index} className="mb-3">
                            {/* Command Input Line */}
                            <div className="flex items-start">
                                <span className="text-green-400 font-bold mr-2 flex-shrink-0">
                                   {shellName}
                                </span>
                                <span className="text-gray-100">{item.command}</span>
                            </div>

                            {/* Command Output */}
                            {item.output && (
                                <div className="text-gray-300 mt-1 ml-6 whitespace-pre-wrap">
                                    {item.output}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Current Input Line */}
                    <div className="flex items-start">
                        <span className="text-green-400 font-bold mr-2 flex-shrink-0">
                            {shellName}
                        </span>
                        <form onSubmit={handleCommandSubmit} className="flex-1">
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                className="w-full bg-transparent text-gray-100 outline-none border-none caret-green-400"
                                placeholder="Type a command..."
                                autoFocus
                                spellCheck="false"
                                autoComplete="off"
                                autoCapitalize="off"
                            />
                        </form>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-1 bg-gray-900 text-xs text-gray-400 border-t border-gray-700 flex justify-between">
                    <div>Fenris</div>
                    <div className="flex gap-4">
                        <span>×{history.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}