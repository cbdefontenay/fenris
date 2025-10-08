import {invoke} from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

export async function saveFolder(folderName) {
    try {
        const dateNow = await invoke("cli_date_without_hours");
        const db = await Database.load("sqlite:fenris_notes.db");

        await db.execute("INSERT INTO folders (name, date_created) VALUES ($1, $2)", [
            folderName.trim(), dateNow
        ]);
    } catch (e) {
        console.log(e);
    }
}

export async function deleteFolder(folderId) {
    try {
        const db = await Database.load("sqlite:fenris_notes.db");

        await db.execute("DELETE FROM note WHERE folder_id = $1", [folderId]);

        await db.execute("DELETE FROM folders WHERE id = $1", [folderId]);

        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export async function updateFolderName(newFolderName, folderId) {
    try {
        const db = await Database.load("sqlite:fenris_notes.db");

        await db.execute(
            "UPDATE folders SET name = $1 WHERE id = $2",
            [newFolderName.trim(), folderId]
        );
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export async function updateFolderByName(currentFolderName, newFolderName) {
    try {
        const db = await Database.load("sqlite:fenris_notes.db");

        // First find the folder by name
        const folders = await db.select("SELECT id FROM folders WHERE name = $1", [currentFolderName.trim()]);

        if (folders.length === 0) {
            throw new Error(`Folder "${currentFolderName}" not found`);
        }

        const folderId = folders[0].id;

        // Then update using the ID
        await db.execute("UPDATE folders SET name = $1 WHERE id = $2", [
            newFolderName.trim(),
            folderId
        ]);

        return { success: true };
    } catch (e) {
        console.error("Error updating folder name:", e);
        return { success: false, error: e.message };
    }
}