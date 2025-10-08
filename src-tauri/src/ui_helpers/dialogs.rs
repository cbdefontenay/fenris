use tauri::{command, AppHandle};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

#[command]
pub fn delete_folder_dialog(
    app: AppHandle,
    message: String,
    title: String,
    confirmation: String,
    cancellation: String,
    folder_name: String,
) -> Result<bool, String> {
    let delete_dialog = app
        .dialog()
        .message(format!("{} \"{}\"?", message, folder_name))
        .title(title)
        .buttons(MessageDialogButtons::OkCancelCustom(
            confirmation,
            cancellation,
        ))
        .blocking_show();
    Ok(delete_dialog)
}
