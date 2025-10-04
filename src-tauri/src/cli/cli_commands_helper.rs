use chrono::{DateTime, Utc};
use std::env;
use std::env::{current_dir, var};
use std::path::PathBuf;
use tauri::command;

#[command]
pub fn cli_help_command(explanation: Option<String>) -> String {
    if let Some(cmd) = explanation {
        cmd
    } else {
        "help,clear,date,version,pwd,goto,theme,lang,navbar,exit".to_string()
    }
}

#[command]
pub fn cli_date_now() -> String {
    let now: DateTime<Utc> = Utc::now();
    now.format("%d-%m-%Y %H:%M:%S").to_string()
}

#[command]
pub fn cli_show_dir() -> PathBuf {
    let path = env::current_dir().unwrap();
    path
}

#[command]
pub fn cli_design() -> String {
    let path = current_dir().unwrap();

    let user = if cfg!(windows) {
        var("USERNAME")
    } else {
        var("USER")
    }
    .unwrap_or_else(|_| String::from("Unknown"));

    let prompt = format!("{user}@fenris$ ");
    prompt
}
