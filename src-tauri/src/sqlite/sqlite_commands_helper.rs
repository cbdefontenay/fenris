use chrono::{DateTime, Utc};
use tauri::command;

#[command]
pub fn save_folder_sqlite(folder_name: String) -> Result<String, ()> {
    let now: DateTime<Utc> = Utc::now();
    let formatted_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let save_folder_command = format!(
        "INSERT INTO folders (name, date_created, date_modified) VALUES ('{}', '{}', '{}')",
        folder_name, formatted_date, formatted_date
    );

    Ok(save_folder_command)
}

#[command]
pub fn delete_folder_sqlite(folder_id: usize) -> Result<String, ()> {
    let delete_folder_command = format!("DELETE FROM folders WHERE id = {}", folder_id);
    Ok(delete_folder_command)
}

#[command]
pub fn delete_folder_by_name_sqlite(folder_name: String) -> Result<String, ()> {
    let delete_folder_by_name_command =
        format!("SELECT id FROM folders WHERE name = '{}'", folder_name);
    Ok(delete_folder_by_name_command)
}

#[command]
pub fn delete_folder_and_note_sqlite(folder_id: usize) -> Result<String, ()> {
    let delete_folder_and_notes_command =
        format!("DELETE FROM note WHERE folder_id = {}", folder_id);
    Ok(delete_folder_and_notes_command)
}

#[command]
pub fn update_folder_sqlite(folder_name: String, folder_id: usize) -> Result<String, ()> {
    let update_folder_and_notes_command = format!(
        "UPDATE folders SET name = '{}' WHERE id = {}",
        folder_name, folder_id
    );
    Ok(update_folder_and_notes_command)
}

#[command]
pub fn update_folder_by_name_sqlite(current_folder_name: String) -> Result<String, ()> {
    let update_folder_by_name_command = format!(
        "SELECT id FROM folders WHERE name = '{}'",
        current_folder_name
    );
    Ok(update_folder_by_name_command)
}

#[command]
pub fn update_folder_by_id_sqlite(new_folder_name: String, folder_id: usize) -> Result<String, ()> {
    let update_folder_by_name_command = format!(
        "UPDATE folders SET name = '{}' WHERE id = {}",
        new_folder_name, folder_id
    );
    Ok(update_folder_by_name_command)
}

#[command]
pub fn get_all_folders() -> Result<String, ()> {
    let get_all_folders_command = "SELECT * FROM folders ORDER BY date_created DESC".to_string();
    Ok(get_all_folders_command)
}

// Notes from folders:
#[command]
pub fn save_note_to_folder_sqlite(
    title: String,
    content: String,
    folder_id: usize,
) -> Result<String, ()> {
    let now: DateTime<Utc> = Utc::now();
    let formatted_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let save_note_command = format!(
        "INSERT INTO note (title, content, folder_id, date_created, date_modified) VALUES ('{}', '{}', {}, '{}', '{}')",
        title, content, folder_id, formatted_date, formatted_date
    );

    Ok(save_note_command)
}

#[command]
pub fn get_notes_by_folder_sqlite(folder_id: usize) -> Result<String, ()> {
    let get_notes_command = format!(
        "SELECT * FROM note WHERE folder_id = {} ORDER BY date_created DESC",
        folder_id
    );
    Ok(get_notes_command)
}

#[command]
pub fn update_note_in_folder_sqlite(
    note_id: usize,
    title: String,
    content: String,
) -> Result<String, ()> {
    let now: DateTime<Utc> = Utc::now();
    let formatted_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let update_note_command = format!(
        "UPDATE note SET title = '{}', content = '{}', date_modified = '{}' WHERE id = {}",
        title, content, formatted_date, note_id
    );
    Ok(update_note_command)
}

#[command]
pub fn delete_note_from_folder_sqlite(note_id: usize) -> Result<String, ()> {
    let delete_note_command = format!("DELETE FROM note WHERE id = {}", note_id);
    Ok(delete_note_command)
}

// Single Note Commands
#[command]
pub fn create_single_note(note_name: String, content: String) -> Result<String, ()> {
    let now: DateTime<Utc> = Utc::now();
    let formatted_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let create_single_note_command = format!(
        "INSERT INTO single_notes (title, content, date_created, date_modified) VALUES ('{}', '{}', '{}', '{}')",
        note_name, content, formatted_date, formatted_date
    );

    Ok(create_single_note_command)
}

#[command]
pub fn delete_single_note(note_id: usize) -> Result<String, ()> {
    let delete_note_command = format!("DELETE FROM single_notes WHERE id = {}", note_id);

    Ok(delete_note_command)
}

#[command]
pub fn update_single_note(new_note_name: String, note_id: usize) -> Result<String, ()> {
    let update_note_command = format!(
        "UPDATE single_notes SET title = '{}' WHERE id = {}",
        new_note_name, note_id
    );

    Ok(update_note_command)
}

#[command]
pub fn get_all_single_note() -> Result<String, ()> {
    let get_all_single_note_command =
        "SELECT * FROM single_notes ORDER BY date_created DESC".to_string();

    Ok(get_all_single_note_command)
}
