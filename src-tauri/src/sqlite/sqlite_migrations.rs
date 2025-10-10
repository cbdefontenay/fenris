use tauri_plugin_sql::{Migration, MigrationKind};

pub fn sqlite_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_folders_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS folders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    tag TEXT DEFAULT NULL,
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    parent_id INTEGER DEFAULT NULL,
                    FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_note_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS note (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL DEFAULT 'Untitled',
                    content TEXT NOT NULL DEFAULT '',
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    folder_id INTEGER NOT NULL,
                    FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_single_note_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS single_notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL DEFAULT 'Untitled',
                    content TEXT NOT NULL DEFAULT '',
                    tag TEXT DEFAULT NULL,
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
                );
            "#,
            kind: MigrationKind::Up,
        },
    ]
}
