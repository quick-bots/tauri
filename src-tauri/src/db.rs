use crate::error::{AppError, AppResult};
use sqlx::{sqlite::SqlitePool, migrate::MigrateDatabase, Sqlite};
use tauri::AppHandle;
use std::path::PathBuf;
use std::fs;

// Database connection string
const DB_URL: &str = "sqlite://app.db";

/// Initialize the database
pub async fn init_database(app_handle: AppHandle) -> AppResult<SqlitePool> {
    // Create the database directory if it doesn't exist
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let db_dir = app_dir.join("database");
    fs::create_dir_all(&db_dir)?;
    
    // Get the path to the database file
    let db_path = db_dir.join("app.db");
    let db_url = format!("sqlite://{}", db_path.to_string_lossy());
    
    // Create the database if it doesn't exist
    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url).await?;
    }
    
    // Connect to the database
    let pool = SqlitePool::connect(&db_url).await?;
    
    // Create tables if they don't exist
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'offline',
            category TEXT NOT NULL DEFAULT 'General',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        "#
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_from_user BOOLEAN NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts (id)
        );
        "#
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        "#
    )
    .execute(&pool)
    .await?;
    
    // Initialize with some default settings if none exist
    let count = sqlx::query("SELECT COUNT(*) FROM settings")
        .fetch_one(&pool)
        .await?
        .get::<i64, _>(0);
    
    if count == 0 {
        sqlx::query("INSERT INTO settings (key, value) VALUES ('theme', 'light')")
            .execute(&pool)
            .await?;
        
        sqlx::query("INSERT INTO settings (key, value) VALUES ('notification_sound', 'on')")
            .execute(&pool)
            .await?;
    }
    
    Ok(pool)
}

/// Get the database connection pool
pub fn get_pool(app_handle: AppHandle) -> AppResult<SqlitePool> {
    // This function would retrieve or create a connection pool
    // Implementation would depend on your app's architecture
    // For this example, we'll just create a new connection each time
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let db_path = app_dir.join("database/app.db");
    let db_url = format!("sqlite://{}", db_path.to_string_lossy());
    
    // Here we'd normally use a pool from a cache, but for simplicity
    // we'll just connect directly
    tokio::runtime::Runtime::new()
        .unwrap()
        .block_on(async {
            SqlitePool::connect(&db_url).await
        })
        .map_err(|e| AppError::DatabaseError(e.to_string()))
}