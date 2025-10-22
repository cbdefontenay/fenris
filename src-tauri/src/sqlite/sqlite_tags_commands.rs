use tauri::command;

#[command]
pub fn select_all_tags_by_name() -> Result<String, ()> {
    let sql = "SELECT * FROM tags ORDER BY name".to_string();
    Ok(sql)
}

#[command]
pub fn select_all_tags_where_name(name: String) -> Result<String, ()> {
    let sql = format!("SELECT * FROM tags WHERE name = '{}'", name);
    Ok(sql)
}

#[command]
pub fn create_tag(name: String, color: String) -> Result<String, ()> {
    let sql = format!(
        "INSERT OR IGNORE INTO tags (name, color) VALUES ('{}', '{}')",
        name, color
    );
    Ok(sql)
}

#[command]
pub fn insert_or_ignore_note_tag(
    note_id: usize,
    tag_id: String,
    note_type: String,
) -> Result<String, ()> {
    let sql = format!(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id, note_type) VALUES ({}, {}, {})",
        note_id, tag_id, note_type
    );
    Ok(sql)
}
