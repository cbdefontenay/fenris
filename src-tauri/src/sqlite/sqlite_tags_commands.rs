use tauri::command;

#[command]
pub fn select_all_tags_by_name() -> Result<String, ()> {
    let sql = "SELECT * FROM tags ORDER BY name".to_string();
    Ok(sql)
}

#[command]
pub fn create_tag(name: String, color: String) -> Result<String, ()> {
    let sql = format!("INSERT OR IGNORE INTO tags (name, color) VALUES ('{}', '{}')", name, color);
    Ok(sql)
}