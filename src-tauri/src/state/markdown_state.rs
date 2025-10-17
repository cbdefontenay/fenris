use std::sync::Mutex;
use tauri::{command, State};

pub struct MarkdownState {
    pub is_preview_open: bool,
    pub is_editor_open: bool,
    pub title: String,
    pub content: String,
    pub word_count: usize,
    pub char_count: usize,
    pub is_full_screen: bool,
}

impl Default for MarkdownState {
    fn default() -> Self {
        Self {
            is_preview_open: true,
            is_editor_open: true,
            title: String::new(),
            content: String::new(),
            word_count: 0,
            char_count: 0,
            is_full_screen: false,
        }
    }
}

pub struct MarkdownPreviewManager(pub Mutex<MarkdownState>);

#[command]
pub fn editor_state(state: State<MarkdownPreviewManager>) -> Result<bool, String> {
    let state = state.0.lock().unwrap();
    Ok(state.is_editor_open)
}

#[command]
pub fn set_editor_state(
    is_open: bool,
    state: State<MarkdownPreviewManager>,
) -> Result<bool, String> {
    let mut state = state.0.lock().unwrap();
    state.is_editor_open = is_open;
    Ok(state.is_editor_open)
}

#[command]
pub fn toggle_view_mode(
    mode: String,
    state: State<MarkdownPreviewManager>,
) -> Result<(bool, bool), String> {
    let mut state = state.0.lock().unwrap();

    match mode.as_str() {
        "split" => {
            state.is_editor_open = true;
            state.is_preview_open = true;
        }
        "editor" => {
            state.is_editor_open = true;
            state.is_preview_open = false;
        }
        "preview" => {
            state.is_editor_open = false;
            state.is_preview_open = true;
        }
        _ => {
            return Err("Invalid view mode".to_string());
        }
    }

    Ok((state.is_editor_open, state.is_preview_open))
}

#[command]
pub fn set_markdown_content(
    content: String,
    state: State<MarkdownPreviewManager>,
) -> Result<String, String> {
    let mut state = state.0.lock().unwrap();
    state.content = content;
    Ok(state.content.clone())
}

#[command]
pub fn set_word_count_for_markdown(
    count: usize,
    state: State<MarkdownPreviewManager>,
) -> Result<String, String> {
    let mut state = state.0.lock().unwrap();
    state.word_count = count;
    Ok(state.word_count.to_string().clone())
}

#[command]
pub fn set_char_count_for_markdown(
    char_count: usize,
    state: State<MarkdownPreviewManager>,
) -> Result<usize, String> {
    let mut state = state.0.lock().unwrap();
    state.char_count = char_count;
    Ok(state.char_count)
}

#[command]
pub fn is_markdown_full_screen(
    is_full_screen: bool,
    state: State<MarkdownPreviewManager>,
) -> Result<bool, String> {
    let mut state = state.0.lock().unwrap();
    state.is_full_screen = is_full_screen;
    Ok(state.is_full_screen.clone())
}