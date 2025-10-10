import {invoke} from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

export async function saveFolder(folderName) {
    try {
        const dateNow = await invoke("cli_date_without_hours");
        const saveFolderCommandFromRust = await invoke("save_folder_sqlite", {
            folderName: folderName.trim(),
            dateNow: dateNow
        });
        const db = await Database.load("sqlite:fenris_app_notes.db");

        await db.execute(saveFolderCommandFromRust);
    } catch (e) {
        console.log(e);
    }
}

export async function deleteFolder(folderId) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const deleteFolders = await invoke("delete_folder_sqlite", {folderId: folderId});
        const deleteFoldersAndNotes = await invoke("delete_folder_and_note_sqlite", {folderId: folderId});

        await db.execute(deleteFoldersAndNotes);
        await db.execute(deleteFolders);

        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function deleteFolderByName(folderName) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const deleteFolderByNameFromRust = await invoke("delete_folder_by_name_sqlite", {folderName: folderName.trim()});
        const folders = await db.select(deleteFolderByNameFromRust);

        if (folders.length === 0) {
            return {success: false, error: `Folder "${folderName}" not found`};
        }

        const folderId = folders[0].id;

        // Then delete using the ID
        const deleteFolders = await invoke("delete_folder_sqlite", {folderId: folderId});
        const deleteFoldersAndNotes = await invoke("delete_folder_and_note_sqlite", {folderId: folderId});

        await db.execute(deleteFoldersAndNotes);
        await db.execute(deleteFolders);

        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function updateFolderName(newFolderName, folderId) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const updateFolderNameFromRust = await invoke("update_folder_sqlite", {
            folderName: newFolderName.trim(),
            folderId: folderId
        });

        await db.execute(updateFolderNameFromRust);
        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}

export async function updateFolderByName(currentFolderName, newFolderName) {
    try {
        const db = await Database.load("sqlite:fenris_app_notes.db");
        const updateFolderByNameFromRust = await invoke("update_folder_by_name_sqlite", {
            currentFolderName: currentFolderName.trim()
        })

        const folders = await db.select(updateFolderByNameFromRust);

        if (folders.length === 0) {
            throw new Error(`Folder "${currentFolderName}" not found`);
        }

        const folderId = folders[0].id;

        const updateFolderByIdFromRust = await invoke("update_folder_by_id_sqlite", {
            newFolderName: newFolderName.trim(),
            folderId
        })
        await db.execute(updateFolderByIdFromRust);

        return {success: true};
    } catch (e) {
        return {success: false, error: e.message};
    }
}