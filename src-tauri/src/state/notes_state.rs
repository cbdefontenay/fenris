// state.rs - Add this to your existing state management
use std::sync::Mutex;
use tauri::{command, State};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteState {
    pub note_name: String,
    pub is_loading: bool,
    pub show_error: bool,
    pub error_message: String,
}

impl Default for NoteState {
    fn default() -> Self {
        Self {
            note_name: String::new(),
            is_loading: false,
            show_error: false,
            error_message: String::new(),
        }
    }
}

pub struct NoteManager {
    pub state: Mutex<NoteState>,
}

#[command]
pub fn set_note_name(note_name: String, state: State<NoteManager>) -> Result<NoteState, String> {
    let mut note_state = state.state.lock().unwrap();
    note_state.note_name = note_name;
    note_state.show_error = false;
    note_state.error_message.clear();

    Ok(note_state.clone())
}

#[command]
pub fn validate_note_name(state: State<NoteManager>) -> Result<NoteState, String> {
    let note_state = state.state.lock().unwrap();

    if note_state.note_name.trim().is_empty() {
        return Err("Note name cannot be empty".to_string());
    }

    Ok(note_state.clone())
}

#[command]
pub fn reset_note_state(state: State<NoteManager>) -> Result<NoteState, String> {
    let mut note_state = state.state.lock().unwrap();
    *note_state = NoteState::default();
    Ok(note_state.clone())
}

#[command]
pub fn get_note_state(state: State<NoteManager>) -> Result<NoteState, String> {
    let note_state = state.state.lock().unwrap();
    Ok(note_state.clone())
}