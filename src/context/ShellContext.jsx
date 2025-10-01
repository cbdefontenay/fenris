import {createContext, useContext, useEffect, useState} from 'react';
import {invoke} from "@tauri-apps/api/core";
import {useNavigate} from 'react-router-dom';
import {useTheme} from "../data/ThemeProvider.jsx";

const ShellContext = createContext();

export function ShellProvider({children}) {
    const [showShell, setShowShell] = useState(false);
    const [command, setCommand] = useState("");
    const [history, setHistory] = useState([]);
    const {theme, toggleTheme} = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 't') {
                event.preventDefault();
                setShowShell(true);
                setCommand("");
            }

            if (event.key === 'Escape') {
                setShowShell(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Command explanations in frontend (easily translatable)
    const commandExplanations = {
        help: "help - Display help information\nUsage: help [command]\nDisplays available commands or detailed help for a specific command.",
        clear: "clear - Clear the terminal screen\nUsage: clear\nClears all previous command output from the terminal.",
        date: "date - Show current date and time\nUsage: date\nDisplays the current system date and time.",
        version: "version - Display system version information\nUsage: version\nShows the current application version and build information.",
        pwd: "pwd - Print working directory\nUsage: pwd\nShows the current directory path.",
        goto: "goto - Navigate to different pages\nUsage: goto <page>\nExample: goto settings\nNavigates to the specified application page.",
        theme: "theme - Change color theme\nUsage: theme <dark|light>\nExample: theme dark\nSwitches between dark and light color themes.",
        echo: "echo - Display a line of text\nUsage: echo <text>\nExample: echo Hello World\nPrints the specified text to the terminal.",
        history: "history - Show command history\nUsage: history\nDisplays previously executed commands.",
        exit: "exit - Close the terminal\nUsage: exit\nCloses the terminal window."
    };

    async function cliHelpCommand(explanation = null) {
        try {
            const result = await invoke("cli_help_command", {explanation});

            if (explanation) {
                // Return the translated explanation from frontend
                return commandExplanations[result] || `No help available for command: ${result}`;
            } else {
                // Return formatted list of all commands
                const commands = result.split(',');
                return `Available commands:\n\n${commands.map(cmd => `  ${cmd.padEnd(20)} ${getCommandDescription(cmd)}`).join('\n')}\n\nType 'help <command>' for more information on a specific command.`;
            }
        } catch (error) {
            return `Error: ${error}`;
        }
    }

    // Helper function to get short descriptions
    const getCommandDescription = (cmd) => {
        const descriptions = {
            help: "Display help information",
            clear: "Clear the terminal screen",
            date: "Show current date and time",
            version: "Display version information",
            pwd: "Print working directory",
            goto: "Navigate to different pages",
            theme: "Change theme (dark|light)",
            echo: "Display a line of text",
            history: "Show command history",
            exit: "Close the terminal"
        };
        return descriptions[cmd] || "No description available";
    };

    async function cliDateNow() {
        try {
            return await invoke("cli_date_now");
        } catch (error) {
            return `Error: ${error}`;
        }
    }

    async function cliCurrentDir() {
        try {
            return await invoke("cli_show_dir");
        } catch (error) {
            return `Error: ${error}`;
        }
    }

    const processCommand = async (cmd) => {
        const trimmedCmd = cmd.trim().toLowerCase();

        // Handle help with specific command
        if (trimmedCmd.startsWith('help ')) {
            const specificCmd = trimmedCmd.substring(5).trim();
            return await cliHelpCommand(specificCmd);
        }

        switch (trimmedCmd) {
            case 'help':
                return await cliHelpCommand();
            case 'clear':
                setHistory([]);
                return "";
            case 'date':
                return await cliDateNow();
            case 'exit':
                setShowShell(false);
                return "";
            case 'version':
                return "Shell v1.0.0";
            case 'pwd':
                return await cliCurrentDir();
            case 'goto settings':
                navigate('/settings');
                setShowShell(false);
                return "Navigating to settings...";
            case 'goto home':
                navigate('/home');
                setShowShell(false);
                return "Navigating to home...";
            case 'theme dark':
                toggleTheme('dark');
                return "Theme set to dark";
            case 'theme light':
                toggleTheme('light');
                return "Theme set to light";
            case '':
                return "";
            default:
                if (trimmedCmd.startsWith('echo ')) {
                    return trimmedCmd.substring(5);
                }
                return `Command not found: ${cmd}. Type 'help' for available commands.`;
        }
    };

    const handleCommandSubmit = async (e) => {
        e.preventDefault();
        if (!command.trim()) return;

        const outputText = await processCommand(command);

        setHistory(prev => [...prev, {command, output: outputText}]);
        setCommand("");
    };

    const value = {
        showShell,
        setShowShell,
        command,
        setCommand,
        history,
        handleCommandSubmit,
        processCommand
    };

    return (
        <ShellContext.Provider value={value}>
            {children}
        </ShellContext.Provider>
    );
}

export function useShell() {
    const context = useContext(ShellContext);
    if (!context) {
        throw new Error('useShell must be used within a ShellProvider');
    }
    return context;
}