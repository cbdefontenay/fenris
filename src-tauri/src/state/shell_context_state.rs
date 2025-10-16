use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellState {
    pub history: Vec<String>,
}

impl Default for ShellState {
    fn default() -> Self {
        Self {
            history: Vec::new(),
        }
    }
}

pub struct ShellManager {
    pub state: Mutex<ShellState>,
}

#[command]
pub fn set_vec_history(
    set_history: Vec<String>,
    state: State<ShellManager>,
) -> Result<ShellState, String> {
    let mut shell_state = state.state.lock().unwrap();
    shell_state.history = set_history;

    Ok(shell_state.clone())
}

#[command]
pub fn get_vec_history(state: State<ShellManager>) -> Result<ShellState, String> {
    let shell_state = state.state.lock().unwrap();
    Ok(shell_state.clone())
}