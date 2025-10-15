use chrono::{DateTime, Utc};
use tauri::command;

#[command]
pub async fn auto_save_folder_note(
    note_id: usize,
    content: String,
) -> Result<String, String> {
    let now: DateTime<Utc> = Utc::now();
    let formatted_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let sql = format!(
        "UPDATE note SET content = '{}', date_modified = '{}' WHERE id = {}",
        content.replace("'", "''"),
        formatted_date,
        note_id
    );
    Ok(sql)
}

#[command]
pub async fn auto_save_single_note(
    note_id: usize,
    content: String,
) -> Result<String, String> {
    let now: DateTime<Utc> = Utc::now();
    let formatted_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let sql = format!(
        "UPDATE single_notes SET content = '{}', date_modified = '{}' WHERE id = {}",
        content.replace("'", "''"),
        formatted_date,
        note_id
    );
    Ok(sql)
}

#[command]
pub async fn get_folder_note_by_id(note_id: usize) -> Result<String, String> {
    let sql = format!("SELECT * FROM note WHERE id = {}", note_id);
    Ok(sql)
}

#[command]
pub async fn get_single_note_by_id(note_id: usize) -> Result<String, String> {
    let sql = format!("SELECT * FROM single_notes WHERE id = {}", note_id);
    Ok(sql)
}