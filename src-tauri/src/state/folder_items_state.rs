use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FolderItemsState {
    pub notes: Vec<Note>,
    pub selected_note: Option<String>,
    pub new_folder_name: String,
    pub is_loading: bool,
    pub is_expanded: bool,
    pub error: String,
    pub error_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub folder_id: String,
}

pub struct FolderItemsManager(pub Mutex<FolderItemsState>);

#[command]
pub fn get_folder_items_state(
    state: State<FolderItemsManager>,
) -> Result<FolderItemsState, String> {
    Ok(state.0.lock().map_err(|e| e.to_string())?.clone())
}

#[command]
pub fn set_folder_items_state(
    updates: FolderItemsState,
    state: State<FolderItemsManager>,
) -> Result<FolderItemsState, String> {
    let mut state = state.0.lock().map_err(|e| e.to_string())?;
    *state = updates;
    Ok(state.clone())
}

#[command]
pub fn update_folder_items_field(
    field: String,
    value: serde_json::Value,
    state: State<FolderItemsManager>,
) -> Result<FolderItemsState, String> {
    let mut state = state.0.lock().map_err(|e| e.to_string())?;

    match field.as_str() {
        "notes" => state.notes = serde_json::from_value(value).unwrap_or_default(),
        "selected_note" => state.selected_note = serde_json::from_value(value).unwrap_or(None),
        "new_folder_name" => {
            state.new_folder_name = serde_json::from_value(value).unwrap_or_default()
        }
        "is_loading" => state.is_loading = serde_json::from_value(value).unwrap_or(false),
        "is_expanded" => state.is_expanded = serde_json::from_value(value).unwrap_or(false),
        "error" => state.error = serde_json::from_value(value).unwrap_or_default(),
        "error_message" => state.error_message = serde_json::from_value(value).unwrap_or_default(),
        _ => return Err(format!("Unknown field: {}", field)),
    }

    Ok(state.clone())
}

#[command]
pub fn reset_folder_items_state(
    state: State<FolderItemsManager>,
) -> Result<FolderItemsState, String> {
    let mut state = state.0.lock().map_err(|e| e.to_string())?;
    *state = FolderItemsState::default();
    Ok(state.clone())
}