import {createContext, useContext, useEffect, useState} from "react";


const AiContext = createContext();

export function AiProvider({children}) {
    const [showAiShell, setShowAiShell] = useState(false);
    const [prompt, setPrompt] = useState("");

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'a') {
                event.preventDefault();
                setShowAiShell(true);
                setPrompt("");
            }

            if (event.key === 'Escape') {
                setShowAiShell(false);
            }
        };
    });

    const value = {
        showAiShell,
        setShowAiShell,
    };

    return (
        <AiContext.Provider value={{value}}>
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
