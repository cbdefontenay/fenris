import {invoke} from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

export async function saveFolder(folderName) {
    try {
        const saveFolderCommandFromRust = await invoke("save_folder_sqlite", {
            folderName: folderName.trim()
        });
        const db = await Database.load("sqlite:fenris_app_notes.db");
        await db.execute(saveFolderCommandFromRust);
        return {success: true};
    } catch (e) {
        console.log(e);
        return {success: false, error: e.message};
    }
}

export async function deleteFolder(folderId) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");

        // First delete all notes in the folder (due to foreign key constraints)
        const deleteNotesCommand = await invoke("delete_folder_and_note_sqlite", {folderId: folderId});
        await db.execute(deleteNotesCommand);

        // Then delete the folder itself
        const deleteFolderCommand = await invoke("delete_folder_sqlite", {folderId: folderId});
        await db.execute(deleteFolderCommand);

        return {success: true};
    } catch (e) {
        console.error('Error deleting folder:', e);
        return {success: false, error: e.message};
    }
}

export async function deleteFolderByName(folderName) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const getFolderIdCommand = await invoke("delete_folder_by_name_sqlite", {folderName: folderName.trim()});
        const folders = await db.select(getFolderIdCommand);

        if (folders.length === 0) {
            return {success: false, error: `Folder "${folderName}" not found`};
        }

        const folderId = folders[0].id;

        // Delete notes first, then folder
        const deleteNotesCommand = await invoke("delete_folder_and_note_sqlite", {folderId: folderId});
        await db.execute(deleteNotesCommand);

        const deleteFolderCommand = await invoke("delete_folder_sqlite", {folderId: folderId});
        await db.execute(deleteFolderCommand);

        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function updateFolderName(newFolderName, folderId) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const updateFolderCommand = await invoke("update_folder_by_id_sqlite", {
            newFolderName: newFolderName.trim(), folderId: folderId
        });

        await db.execute(updateFolderCommand);
        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function updateFolderByName(currentFolderName, newFolderName) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const getFolderIdCommand = await invoke("update_folder_by_name_sqlite", {
            currentFolderName: currentFolderName.trim()
        });

        const folders = await db.select(getFolderIdCommand);

        if (folders.length === 0) {
            return {success: false, error: `Folder "${currentFolderName}" not found`};
        }

        const folderId = folders[0].id;

        const updateFolderCommand = await invoke("update_folder_by_id_sqlite", {
            newFolderName: newFolderName.trim(), folderId: folderId
        });

        await db.execute(updateFolderCommand);
        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function saveNoteFromShell(noteName) {
    try {
        const saveNoteFromRust = await invoke("create_single_note", {
            noteName: noteName.trim(), content: ""
        });
        const db = await Database.load("sqlite:fenris_app_notes.db");
        await db.execute(saveNoteFromRust);
        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function deleteNoteByName(noteName) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const getNoteIdCommand = await invoke("delete_note_by_name_sqlite", {noteName: noteName.trim()});
        const notes = await db.select(getNoteIdCommand);

        if (notes.length === 0) {
            return {success: false, error: `Note "${noteName}" not found`};
        }

        const noteId = notes[0].id;

        const deleteNoteCommand = await invoke("delete_single_note", {noteId: noteId});
        await db.execute(deleteNoteCommand);

        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}