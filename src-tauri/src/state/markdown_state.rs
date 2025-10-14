use std::sync::Mutex;
use tauri::{command, State};

pub struct MarkdownState {
    pub is_preview_open: bool,
    pub is_editor_open: bool,
    pub markdown: String,
    pub title: String,
    pub content: String,
}

impl Default for MarkdownState {
    fn default() -> Self {
        Self {
            is_preview_open: true,
            is_editor_open: true, // Both open by default (split view)
            markdown: String::new(),
            title: String::new(),
            content: String::new(),
        }
    }
}

pub struct MarkdownPreviewManager(pub Mutex<MarkdownState>);

#[command]
pub fn preview_state(state: State<MarkdownPreviewManager>) -> Result<bool, String> {
    let state = state.0.lock().unwrap();
    Ok(state.is_preview_open)
}

#[command]
pub fn set_preview_state(
    is_open: bool,
    state: State<MarkdownPreviewManager>,
) -> Result<bool, String> {
    let mut state = state.0.lock().unwrap();
    state.is_preview_open = is_open;
    Ok(state.is_preview_open)
}

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
pub fn set_markdown_state(
    markdown: String,
    state: State<MarkdownPreviewManager>,
) -> Result<String, String> {
    let mut state = state.0.lock().unwrap();
    state.markdown = markdown;
    Ok(state.markdown.clone())
}

#[command]
pub fn set_markdown_title(
    title: String,
    state: State<MarkdownPreviewManager>,
) -> Result<String, String> {
    let mut state = state.0.lock().unwrap();
    state.title = title;
    Ok(state.title.clone())
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