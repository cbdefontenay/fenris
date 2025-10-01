use reqwest::Client;
use serde_json::{from_str, to_string_pretty, Value};
use tauri::command;

#[command]
pub async fn fetch_json(url: String) -> Result<String, String> {
    let client = Client::new();

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Parse and pretty-print the JSON
    let parsed_json: Value =
        from_str(&response_text).map_err(|e| format!("Response is not valid JSON: {}", e))?;

    to_string_pretty(&parsed_json).map_err(|e| format!("Failed to format JSON: {}", e))
}

#[command]
pub fn format_json(json_string: String) -> Result<String, String> {
    let parsed_json: Value = from_str(&json_string).map_err(|e| format!("Invalid JSON: {}", e))?;

    to_string_pretty(&parsed_json).map_err(|e| format!("Failed to format JSON: {}", e))
}
