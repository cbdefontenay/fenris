import {deleteFolderByName, saveFolder, saveNoteFromShell, updateFolderByName} from "../data/CreateNotesDataShell.jsx";
import {invoke} from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

export async function AddFolderWithCli(cmd, t) {
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

export async function deleteFolderWithCli(cmd, t) {
    const deleteFolderName = cmd.substring(14).trim();
    if (!deleteFolderName) {
        return t('shell.errors.deleteFolder.missingName');
    }
    try {
        const result = await deleteFolderByName(deleteFolderName);
        if (result.success) {
            return t('shell.success.deleteFolder', {name: deleteFolderName});
        } else {
            return t('shell.errors.deleteFolder.generic', {error: result.error});
        }
    } catch (error) {
        return t('shell.errors.deleteFolder.generic', {error: error.message});
    }
}

export async function updateFolderWithCli(cmd, t) {
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

export async function addNoteWithCli(cmd, t) {
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

export async function deleteNoteWithCli(cmd, t) {
    const deleteNoteName = cmd.substring(9).trim();
    if (!deleteNoteName) {
        return t('shell.errors.addFolder.missingName');
    }
    try {
        const result = await saveNoteFromShell(deleteNoteName);
        if (result.success) {
            return t('shell.success.addFolder', {name: deleteNoteName});
        } else {
            return t('shell.errors.addFolder.generic', {error: result.error});
        }
    } catch (error) {
        return t('shell.errors.addFolder.generic', {error: error.message});
    }
}

export async function getVacuumFromDb() {
    const db = await Database.load("sqlite:fenris_app_notes.db");
    const vacuum = await invoke("vacuum_sqlite");

    await db.execute(vacuum);
}

export const getCommandExplanation = (command, t) => {
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

export const getCommandDescription = (cmd, t) => {
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
