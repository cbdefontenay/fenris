import {createContext, useContext, useEffect, useState} from 'react';
import {invoke} from "@tauri-apps/api/core";
import {useNavigate} from 'react-router-dom';
import {useTheme} from "../data/ThemeProvider.jsx";
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {
    AddFolderWithCli,
    addNoteWithCli,
    deleteFolderWithCli,
    deleteNoteWithCli, getCommandDescription, getCommandExplanation, getVacuumFromDb,
    updateFolderWithCli
} from "./ShellHelpers.jsx";

const ShellContext = createContext();

export function ShellProvider({children}) {
    const [showShell, setShowShell] = useState(false);
    const [command, setCommand] = useState("");
    const [history, setHistory] = useState([]);
    const {theme, toggleTheme, changeTheme} = useTheme();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18next.language);

    const handleLanguageChange = (code) => {
        setCurrentLanguage(code);
        i18next.changeLanguage(code).then(r => "");
    };

    const getHistoryFromRust = async () => {
        try {
            const rustHistory = await invoke("get_vec_history");
            const historyArray = rustHistory.history || rustHistory || [];
            setHistory(historyArray);
        } catch (error) {
            setHistory([]);
        }
    };

    const updateHistory = async (newHistory) => {
        try {
            const historyForRust = newHistory.map(item => {
                if (typeof item === 'string') {
                    return item;
                } else {
                    return JSON.stringify(item);
                }
            });

            const result = await invoke("set_vec_history", {
                history: historyForRust
            });

            const updatedHistory = result.history || result || [];
            setHistory(updatedHistory);

        } catch (error) {
            setHistory(newHistory);
        }
    };

    useEffect(() => {
        getHistoryFromRust();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 't') {
                event.preventDefault();
                setShowShell(true);
                setCommand("");
            }

            if (event.ctrlKey && event.key === 'l') {
                event.preventDefault();
                handleClearTerminal(event);
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

    const handleClearTerminal = (input) => {
        if ((input.ctrlKey && input.key === 'l') || input === "clear") {
            updateHistory([]);
        }
    }

    async function cliHelpCommand(explanation = null) {
        try {
            const result = await invoke("cli_help_command", {explanation});

            if (explanation) {
                return getCommandExplanation(result, t);
            } else {
                const commands = result.split(',');
                return t('shell.availableCommands', {
                    commands: commands.map(cmd => `  ${cmd.padEnd(20)} ${getCommandDescription(cmd, t)}`).join('\n')
                });
            }
        } catch (error) {
            return t('shell.error', {error});
        }
    }

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

        if (trimmedCmd.startsWith('help ')) {
            const specificCmd = trimmedCmd.substring(5).trim();
            return await cliHelpCommand(specificCmd);
        }

        if (trimmedCmd.startsWith('add folder ')) {
            return await AddFolderWithCli(cmd, t);
        }

        if (trimmedCmd.startsWith('delete folder ')) {
            await deleteFolderWithCli(cmd, t);
        }

        if (trimmedCmd.startsWith('update folder ')) {
            await updateFolderWithCli(cmd, t)
        }

        if (trimmedCmd.startsWith('add note ')) {
            await addNoteWithCli(cmd, t);
        }

        if (trimmedCmd.startsWith('delete note ')) {
            await deleteNoteWithCli(cmd, t);
        }

        switch (trimmedCmd) {
            case 'help':
                return await cliHelpCommand();
            case 'clear':
                handleClearTerminal();
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
            case 'lang fr':
                handleLanguageChange('fr');
                return t('shell.success.languageChanged', {language: 'Français'});
            case 'lang en':
                handleLanguageChange('en');
                return t('shell.success.languageChanged', {language: 'English'});
            case 'lang de':
                handleLanguageChange('de');
                return t('shell.success.languageChanged', {language: 'Deutsch'});
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
            case 'theme light':
            case 'theme nord':
                const themeArg = trimmedCmd.substring(6).trim();
                try {
                    const result = await invoke("handle_shell_theme_command", {themeArg: themeArg});
                    // Force theme reload by calling changeTheme with the current stored theme
                    const currentTheme = await invoke("store_and_get_theme");
                    await changeTheme(currentTheme);
                    return result;
                } catch (error) {
                    return t('shell.error', {error: error.message});
                }
            case 'hide navbar':
                const navbarToHide = document.querySelector('nav, aside, main, [class*="navbar"], [class*="sidebar"], [class*="page-margin-markdown"]');
                if (navbarToHide) {
                    navbarToHide.style.display = 'none';
                }
                document.documentElement.style.setProperty('--navbar-margin', '0px');
                document.documentElement.style.setProperty('--markdown-margin', '260px');
                return t('shell.success.navbarHidden');
            case 'show navbar':
                const navbarToShow = document.querySelector('nav, aside, main, [class*="navbar"], [class*="sidebar"], [class*="page-margin-markdown"]');
                if (navbarToShow) {
                    navbarToShow.style.display = 'block';
                }
                document.documentElement.style.setProperty('--navbar-margin', '5rem');
                document.documentElement.style.setProperty('--markdown-margin', '350px');
                return t('shell.success.navbarShown');
            case 'hide json-stats':
                const hideStatsSection = document.querySelector('.json-stats');
                if (hideStatsSection) {
                    hideStatsSection.style.display = 'none';
                }
                return t('shell.success.jsonStatsHidden');
            case 'show json-stats':
                const showStatsSection = document.querySelector('.json-stats');
                if (showStatsSection) {
                    showStatsSection.style.display = 'block';
                }
                return t('shell.success.jsonStatsShown');
            case "add folder":
                return t("shell.errors.addFolder.missingName");
            case "delete folder":
                return t("shell.errors.deleteFolder.missingName");
            case "update folder":
                return t("shell.errors.updateFolder.missingNames");
            case "add note":
                return t("shell.errors.updateFolder.missingNames");
            case "vacuum":
                await getVacuumFromDb();
                return "The VACUUM was successfully executed.";
            case "":
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

        const newHistoryEntry = {
            command,
            output: outputText,
            timestamp: new Date().toISOString()
        };
        const newHistory = [...history, newHistoryEntry];

        await updateHistory(newHistory);

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

