use std::sync::Mutex;
use tauri::{command, State};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderState {
    pub folder_name: String,
    pub is_loading: bool,
    pub show_error: bool,
    pub error_message: String,
}

impl Default for FolderState {
    fn default() -> Self {
        Self {
            folder_name: String::new(),
            is_loading: false,
            show_error: false,
            error_message: String::new(),
        }
    }
}

pub struct FolderManager {
    pub state: Mutex<FolderState>,
}

#[command]
pub fn set_folder_name(folder_name: String, state: State<FolderManager>) -> Result<FolderState, String> {
    let mut folder_state = state.state.lock().unwrap();
    folder_state.folder_name = folder_name;
    folder_state.show_error = false;
    folder_state.error_message.clear();

    Ok(folder_state.clone())
}

#[command]
pub fn validate_folder_name(state: State<FolderManager>) -> Result<FolderState, String> {
    let folder_state = state.state.lock().unwrap();

    if folder_state.folder_name.trim().is_empty() {
        return Err("Folder name cannot be empty".to_string());
    }

    Ok(folder_state.clone())
}

#[command]
pub fn reset_folder_state(state: State<FolderManager>) -> Result<FolderState, String> {
    let mut folder_state = state.state.lock().unwrap();
    *folder_state = FolderState::default();
    Ok(folder_state.clone())
}

#[command]
pub fn get_folder_state(state: State<FolderManager>) -> Result<FolderState, String> {
    let folder_state = state.state.lock().unwrap();
    Ok(folder_state.clone())
}