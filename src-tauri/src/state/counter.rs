use std::sync::Mutex;
use tauri::{command, State};

pub struct Counter {
    pub count: Mutex<i32>,
}

#[command]
pub fn calculate(method: &str, state: State<Counter>) -> i32 {
    let mut counter = state.count.lock().unwrap();

    match method {
        "add" => {
            *counter = *counter + 1;
        },
        "subtract" => {
            *counter = *counter - 1;
        },
        _ => ()
    }

    *counter
}