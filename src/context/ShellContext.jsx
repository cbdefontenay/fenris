import {createContext, useContext, useEffect, useState} from 'react';
import {invoke} from "@tauri-apps/api/core";
import {useNavigate} from 'react-router-dom';
import {useTheme} from "../data/ThemeProvider.jsx";
import {useTranslation} from "react-i18next";

const ShellContext = createContext();

export function ShellProvider({children}) {
    const [showShell, setShowShell] = useState(false);
    const [command, setCommand] = useState("");
    const [history, setHistory] = useState([]);
    const {theme, toggleTheme} = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

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

    // Command explanations with translations
    const getCommandExplanation = (command) => {
        const explanations = {
            help: t('shell.commands.help', {
                command: "help",
                usage: "help [command]",
                description: "Displays available commands or detailed help for a specific command."
            }),
            clear: t('shell.commands.clear', {
                command: "clear",
                usage: "clear",
                description: "Clears all previous command output from the terminal."
            }),
            date: t('shell.commands.date', {
                command: "date",
                usage: "date",
                description: "Displays the current system date and time."
            }),
            version: t('shell.commands.version', {
                command: "version",
                usage: "version",
                description: "Shows the current application version and build information."
            }),
            pwd: t('shell.commands.pwd', {
                command: "pwd",
                usage: "pwd",
                description: "Shows the current directory path."
            }),
            goto: t('shell.commands.goto', {
                command: "goto",
                usage: "goto <page>",
                example: "goto settings",
                description: "Navigates to the specified application page."
            }),
            theme: t('shell.commands.theme', {
                command: "theme",
                usage: "theme <dark|light>",
                example: "theme dark",
                description: "Switches between dark and light color themes."
            }),
            echo: t('shell.commands.echo', {
                command: "echo",
                usage: "echo <text>",
                example: "echo Hello World",
                description: "Prints the specified text to the terminal."
            }),
            history: t('shell.commands.history', {
                command: "history",
                usage: "history",
                description: "Displays previously executed commands."
            }),
            exit: t('shell.commands.exit', {
                command: "exit",
                usage: "exit",
                description: "Closes the terminal window."
            })
        };
        return explanations[command] || t('shell.noHelpAvailable', {command});
    };

    async function cliHelpCommand(explanation = null) {
        try {
            const result = await invoke("cli_help_command", {explanation});

            if (explanation) {
                return getCommandExplanation(result);
            } else {
                const commands = result.split(',');
                return t('shell.availableCommands', {
                    commands: commands.map(cmd => `  ${cmd.padEnd(20)} ${getCommandDescription(cmd)}`).join('\n')
                });
            }
        } catch (error) {
            return t('shell.error', {error});
        }
    }

    // Helper function to get short descriptions
    const getCommandDescription = (cmd) => {
        const descriptions = {
            help: t('shell.descriptions.help'),
            clear: t('shell.descriptions.clear'),
            date: t('shell.descriptions.date'),
            version: t('shell.descriptions.version'),
            pwd: t('shell.descriptions.pwd'),
            goto: t('shell.descriptions.goto'),
            theme: t('shell.descriptions.theme'),
            exit: t('shell.descriptions.exit')
        };
        return descriptions[cmd] || t('shell.descriptions.noDescription');
    };

    async function cliDateNow() {
        try {
            return await invoke("cli_date_now");
        } catch (error) {
            return t('shell.error', {error});
        }
    }

    async function cliCurrentDir() {
        try {
            return await invoke("cli_show_dir");
        } catch (error) {
            return t('shell.error', {error});
        }
    }

    const processCommand = async (cmd) => {
        const trimmedCmd = cmd.trim().toLowerCase();

        // Handle help with a specific command
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
                return t('shell.versionInfo');
            case 'pwd':
                return await cliCurrentDir();
            case 'goto settings':
                navigate('/settings');
                setShowShell(false);
                return t('shell.navigatingToSettings');
            case 'goto json':
                navigate('/json');
                setShowShell(false);
                return t('shell.navigatingToJson');
            case 'goto home':
                navigate('/home');
                setShowShell(false);
                return t('shell.navigatingToHome');
            case 'goto ai':
                navigate('/ai-chatbot');
                setShowShell(false);
                return t('shell.navigatingToAiChatbot');
            case 'theme dark':
                toggleTheme('dark');
                return t('shell.themeSetToDark');
            case 'theme light':
                toggleTheme('light');
                return t('shell.themeSetToLight');
            case '':
                return "";
            default:
                if (trimmedCmd.startsWith('echo ')) {
                    return trimmedCmd.substring(5);
                }
                return t('shell.commandNotFound', {command: cmd});
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