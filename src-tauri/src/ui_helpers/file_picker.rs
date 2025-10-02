use tauri::{command, AppHandle};
use tauri_plugin_dialog::DialogExt;

#[command]
pub fn pick_json_file(app: AppHandle){
    app.dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .blocking_pick_file()
        .map(|path| {
            println!("Selected file: {:?}", path);
        });
}