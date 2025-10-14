use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AddNoteState {
    pub new_note_title: String,
    pub is_loading: bool,
    pub is_popup_open: bool,
    pub error: String,
}

pub struct AddNoteManager(pub Mutex<AddNoteState>);

#[command]
pub fn get_add_note_state(state: State<AddNoteManager>) -> Result<AddNoteState, String> {
    Ok(state.0.lock().map_err(|e| e.to_string())?.clone())
}

#[command]
pub fn set_add_note_state(updates: AddNoteState, state: State<AddNoteManager>) -> Result<AddNoteState, String> {
    let mut state = state.0.lock().map_err(|e| e.to_string())?;
    *state = updates;
    Ok(state.clone())
}

#[command]
pub fn update_add_note_field(field: String, value: serde_json::Value, state: State<AddNoteManager>) -> Result<AddNoteState, String> {
    let mut state = state.0.lock().map_err(|e| e.to_string())?;

    match field.as_str() {
        "new_note_title" => state.new_note_title = serde_json::from_value(value).unwrap_or_default(),
        "is_loading" => state.is_loading = serde_json::from_value(value).unwrap_or(false),
        "is_popup_open" => state.is_popup_open = serde_json::from_value(value).unwrap_or(false),
        "error" => state.error = serde_json::from_value(value).unwrap_or_default(),
        _ => return Err(format!("Unknown field: {}", field)),
    }

    Ok(state.clone())
}

#[command]
pub fn reset_add_note_state(state: State<AddNoteManager>) -> Result<AddNoteState, String> {
    let mut state = state.0.lock().map_err(|e| e.to_string())?;
    *state = AddNoteState::default();
    Ok(state.clone())
}