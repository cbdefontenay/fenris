use fs::read_to_string;
use html::push_html;
use pulldown_cmark::{html, Options, Parser};
use reqwest::Client;
use serde_json::{json, Value};
use std::fs;
use std::path::Path;
use std::time::Duration;
use tauri::command;

#[command]
pub async fn ollama_api_call(
    prompt: String,
    model: String,
    file_content: Option<String>,
) -> Result<String, String> {
    let ollama_base_url = "http://localhost:11434/api/chat";

    let client = Client::builder()
        .timeout(Duration::from_secs(300))
        .build()
        .map_err(|e| e.to_string())?;

    // Combine file content with prompt if provided
    let final_prompt = if let Some(content) = file_content {
        format!("File content:\n{}\n\nQuestion: {}", content, prompt)
    } else {
        prompt
    };

    let body = json!({
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": final_prompt
            }
        ],
        "stream": false
    });

    let response = client
        .post(ollama_base_url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let json_res: Value = response
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    if let Some(content) = json_res["message"]["content"].as_str() {
        let markdown_content = content.trim();
        let html_content = markdown_to_html(markdown_content);
        Ok(html_content)
    } else {
        if let Some(done) = json_res["done"].as_bool() {
            if done {
                Err("Request completed but no content received".to_string())
            } else {
                Err("Request still processing".to_string())
            }
        } else {
            Err("Unexpected response format from Ollama".to_string())
        }
    }
}

#[command]
pub async fn read_file(file_path: String) -> Result<String, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    // Check if it's a file (not a directory)
    if !path.is_file() {
        return Err("Path is not a file".to_string());
    }

    read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))
}

fn markdown_to_html(markdown: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_TASKLISTS);

    let parser = Parser::new_ext(markdown, options);
    let mut html_output = String::new();
    push_html(&mut html_output, parser);
    html_output
}
