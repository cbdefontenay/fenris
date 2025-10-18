import {createContext, useContext, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

const ThemeContext = createContext();

export function ThemeProvider({children}) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await invoke("store_and_get_theme");
                setTheme(savedTheme);
                document.documentElement.className = savedTheme;
            } catch (error) {
                setTheme("light");
                document.documentElement.className = "light";
            }
        };

        loadTheme();
    }, []);

    const changeTheme = async (newTheme) => {
        setTheme(newTheme);
        await invoke("store_and_set_theme", {
            appTheme: newTheme,
        })
        document.documentElement.className = newTheme;
    };

    const toggleTheme = async () => {
        // Only toggle between light and dark for quick switching
        const newTheme = theme === "light" ? "dark" : "light";
        changeTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme, changeTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}