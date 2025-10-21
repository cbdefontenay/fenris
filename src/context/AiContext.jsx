import {createContext, useContext, useEffect, useState} from "react";

const AiContext = createContext();

export function AiProvider({children}) {
    const [showAiShell, setShowAiShell] = useState(false);
    const [prompt, setPrompt] = useState("");

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only trigger if not in an input/textarea
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            if (event.ctrlKey && event.key === 'e') {
                event.preventDefault();
                setShowAiShell(true);
                setPrompt("");
            }

            if (event.key === 'Escape') {
                setShowAiShell(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const value = {
        showAiShell,
        setShowAiShell,
        prompt,
        setPrompt
    };

    return (
        <AiContext.Provider value={value}>
            {children}
        </AiContext.Provider>
    );
}

export function useAiShell() {
    const context = useContext(AiContext);
    if (!context) {
        throw new Error('useAiShell must be used within an AiProvider');
    }
    return context;
}