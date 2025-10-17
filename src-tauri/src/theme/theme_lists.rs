use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize, Deserialize, Clone)]
pub struct Theme {
    pub name: &'static str,
    pub value: &'static str,
    pub display: &'static str,
}

#[command]
pub fn list_of_themes() -> Result<Vec<Theme>, String> {
    let themes = vec![
        Theme {
            name: "nord",
            value: "nord",
            display: "Nord",
        },
        Theme {
            name: "atomDark",
            value: "atomDark",
            display: "Atom Dark",
        },
        Theme {
            name: "darcula",
            value: "darcula",
            display: "Darcula",
        },
        Theme {
            name: "gruvboxDark",
            value: "gruvboxDark",
            display: "Gruvbox Dark",
        },
        Theme {
            name: "materialDark",
            value: "materialDark",
            display: "Material Dark",
        },
        Theme {
            name: "materialLight",
            value: "materialLight",
            display: "Material Light",
        },
        Theme {
            name: "solarizedlight",
            value: "solarizedlight",
            display: "Solarized Light",
        },
        Theme {
            name: "tomorrow",
            value: "tomorrow",
            display: "Tomorrow",
        },
        Theme {
            name: "vscDarkPlus",
            value: "vscDarkPlus",
            display: "VS Code Dark+",
        },
    ];

    Ok(themes)
}