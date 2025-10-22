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
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_tags_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    color TEXT DEFAULT '#6B7280',
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_note_tags_junction_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS note_tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    note_id INTEGER NOT NULL,
                    tag_id INTEGER NOT NULL,
                    note_type TEXT NOT NULL CHECK (note_type IN ('single', 'folder')),
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    UNIQUE(note_id, tag_id, note_type),
                    FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_indexes_for_tags",
            sql: r#"
                CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id, note_type);
                CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);
                CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
            "#,
            kind: MigrationKind::Up,
        }
    ]
}