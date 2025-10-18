import {createContext, useContext, useEffect, useState} from 'react';
import {invoke} from "@tauri-apps/api/core";
import {useNavigate} from 'react-router-dom';
import {useTheme} from "../data/ThemeProvider.jsx";
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {
    deleteFolderByName,
    deleteNoteByName,
    saveFolder,
    saveNoteFromShell,
    updateFolderByName
} from "../data/CreateNotesDataShell.jsx";

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

    // Command explanations with translations
    const getCommandExplanation = (command) => {
        const explanations = {
            help: t('shell.commands.help', {
                command: "help",
                usage: "help [command]",
                description: t('shell.descriptions.help')
            }),
            clear: t('shell.commands.clear', {
                command: "clear",
                usage: "clear",
                description: t('shell.descriptions.clear')
            }),
            date: t('shell.commands.date', {
                command: "date",
                usage: "date",
                description: t('shell.descriptions.date')
            }),
            version: t('shell.commands.version', {
                command: "version",
                usage: "version",
                description: t('shell.descriptions.version')
            }),
            pwd: t('shell.commands.pwd', {
                command: "pwd",
                usage: "pwd",
                description: t('shell.descriptions.pwd')
            }),
            goto: t('shell.commands.goto', {
                command: "goto",
                usage: "goto <page>",
                example: "goto settings",
                description: t('shell.descriptions.goto')
            }),
            theme: t('shell.commands.theme', {
                command: "theme",
                usage: "theme <dark|light>",
                example: "theme dark",
                description: t('shell.descriptions.theme')
            }),
            lang: t('shell.commands.lang', {
                command: "lang",
                usage: "lang <fr|de|en>",
                description: t('shell.descriptions.lang')
            }),
            navbar: t('shell.commands.navbar', {
                command: "navbar",
                usage: "navbar <show|hide>",
                description: t('shell.descriptions.navbar')
            }),
            exit: t('shell.commands.exit', {
                command: "exit",
                usage: "exit",
                description: t('shell.descriptions.exit')
            }),
            addfolder: t('shell.commands.addfolder', {
                command: "add folder",
                usage: "add folder <name>",
                example: 'add folder "My Folder"',
                description: t('shell.descriptions.addfolder')
            }),
            deletefolder: t('shell.commands.deletefolder', {
                command: "delete folder",
                usage: "delete folder <name>",
                example: 'delete folder "My Folder"',
                description: t('shell.descriptions.deletefolder')
            }),
            updatefolder: t('shell.commands.updatefolder', {
                command: "update folder",
                usage: "update folder <current-name> <new-name>",
                example: 'update folder "Old Name" "New Name"',
                description: t('shell.descriptions.updatefolder')
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
            lang: t('shell.descriptions.lang'),
            navbar: t('shell.descriptions.navbar'),
            exit: t('shell.descriptions.exit'),
            'add folder': t('shell.descriptions.addfolder'),
            'delete folder': t('shell.descriptions.deletefolder'),
            'update folder': t('shell.descriptions.updatefolder')
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

        if (trimmedCmd.startsWith('add folder ')) {
            const folderName = cmd.substring(11).trim();
            if (!folderName) {
                return t('shell.errors.addFolder.missingName');
            }
            try {
                const result = await saveFolder(folderName);
                if (result.success) {
                    return t('shell.success.addFolder', {name: folderName});
                } else {
                    return t('shell.errors.addFolder.generic', {error: result.error});
                }
            } catch (error) {
                return t('shell.errors.addFolder.generic', {error: error.message});
            }
        }

        if (trimmedCmd.startsWith('delete folder ')) {
            const folderName = cmd.substring(14).trim();
            if (!folderName) {
                return t('shell.errors.deleteFolder.missingName');
            }
            try {
                const result = await deleteFolderByName(folderName);
                if (result.success) {
                    return t('shell.success.deleteFolder', {name: folderName});
                } else {
                    return t('shell.errors.deleteFolder.generic', {error: result.error});
                }
            } catch (error) {
                return t('shell.errors.deleteFolder.generic', {error: error.message});
            }
        }

        if (trimmedCmd.startsWith('update folder ')) {
            const args = cmd.substring(13).trim();

            const match = args.match(/^("([^"]+)"|'([^']+)'|(\S+))\s+("([^"]+)"|'([^']+)'|(\S+))$/);

            if (!match) {
                return t('shell.errors.updateFolder.invalidSyntax');
            }

            const currentFolderName = match[2] || match[3] || match[4];
            const newFolderName = match[6] || match[7] || match[8];

            if (!currentFolderName || !newFolderName) {
                return t('shell.errors.updateFolder.missingNames');
            }

            try {
                const result = await updateFolderByName(currentFolderName, newFolderName);

                if (result.success) {
                    return t('shell.success.updateFolder', {
                        oldName: currentFolderName,
                        newName: newFolderName
                    });
                } else {
                    return t('shell.errors.updateFolder.generic', {error: result.error});
                }
            } catch (error) {
                return t('shell.errors.updateFolder.generic', {error: error.message});
            }
        }

        if (trimmedCmd.startsWith('add note ')) {
            const noteName = cmd.substring(9).trim();
            if (!noteName) {
                return t('shell.errors.addFolder.missingName');
            }
            try {
                const result = await saveNoteFromShell(noteName);
                if (result.success) {
                    return t('shell.success.addFolder', {name: noteName});
                } else {
                    return t('shell.errors.addFolder.generic', {error: result.error});
                }
            } catch (error) {
                return t('shell.errors.addFolder.generic', {error: error.message});
            }
        }

        if (trimmedCmd.startsWith('delete note ')) {
            const noteName = cmd.substring(12).trim();
            if (!noteName) {
                return t('shell.errors.deleteFolder.missingName');
            }
            try {
                const result = await deleteNoteByName(noteName);
                if (result.success) {
                    return t('shell.success.deleteFolder', {name: noteName});
                } else {
                    return t('shell.errors.deleteFolder.generic', {error: result.error});
                }
            } catch (error) {
                return t('shell.errors.deleteFolder.generic', {error: error.message});
            }
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
                return t('shell.success.languageChanged', {language: 'French'});
            case 'lang en':
                handleLanguageChange('en');
                return t('shell.success.languageChanged', {language: 'English'});
            case 'lang de':
                handleLanguageChange('de');
                return t('shell.success.languageChanged', {language: 'German'});
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
            case 'add folder':
                return t('shell.errors.addFolder.missingName');
            case 'delete folder':
                return t('shell.errors.deleteFolder.missingName');
            case 'update folder':
                return t('shell.errors.updateFolder.missingNames');
            case 'add note':
                return t('shell.errors.updateFolder.missingNames');
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