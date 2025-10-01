use reqwest::Client;
use tauri::command;
use serde_json::{json, Value};
use std::time::Duration;
use pulldown_cmark::{Parser, Options, html};

#[command]
pub async fn ollama_api_call(prompt: String, model: String) -> Result<String, String> {
    let ollama_base_url = "http://localhost:11434/api/chat";

    let client = Client::builder()
        .timeout(Duration::from_secs(300)) // 5-minute timeout for long responses
        .build()
        .map_err(|e| e.to_string())?;

    let body = json!({
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt
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

    // Extract the response content
    if let Some(content) = json_res["message"]["content"].as_str() {
        // Parse markdown content to HTML
        let markdown_content = content.trim();
        let html_content = markdown_to_html(markdown_content);
        Ok(html_content)
    } else {
        // Fallback: try to get any response text
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

fn markdown_to_html(markdown: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_TASKLISTS);

    let parser = Parser::new_ext(markdown, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    html_output
}