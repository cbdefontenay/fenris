use tauri::command;

#[command]
pub fn list_of_models() -> Vec<String> {
    vec![
        String::from("codellama"),
        String::from("deepseek-coder"),
        String::from("deepseek-llm"),
        String::from("deepseek-r1"),
        String::from("deepseek-v2.5"),
        String::from("gpt-oss:120b-cloud"),
        String::from("gpt-oss"),
        String::from("gemma3"),
        String::from("llama3.1"),
        String::from("llama3.2"),
        String::from("llama-pro"),
        String::from("mistral"),
        String::from("mistral:7b-instruct"),
        String::from("qwen3"),
        String::from("qwen2"),
        String::from("qwen2.5-coder"),
        String::from("llava"),
        String::from("gemma2"),
        String::from("qwen3-vl"),
        String::from("qwen2.5"),
        String::from("opencoder"),
        String::from("phi3"),
        String::from("qwen2:cloud"),
        String::from("tinyllama"),
    ]
}
