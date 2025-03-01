use tauri::AppHandle;
use serde::{Serialize, Deserialize};
use crate::error::AppResult;

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageResponse {
    message: String,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VersionInfo {
    version: String,
    build: String,
}

/// Simple greet command for testing
#[tauri::command]
pub fn greet(name: String) -> MessageResponse {
    MessageResponse {
        message: format!("Hello, {}! Welcome to Tauri Application.", name),
        status: "success".to_string(),
    }
}

/// Get the application version
#[tauri::command]
pub fn get_app_version(app_handle: AppHandle) -> VersionInfo {
    let app_version = app_handle.package_info().version.to_string();
    
    VersionInfo {
        version: app_version,
        build: option_env!("BUILD_NUMBER").unwrap_or("dev").to_string(),
    }
}

/// Get contacts list from the database
#[tauri::command]
pub async fn get_contacts(app_handle: AppHandle) -> AppResult<Vec<Contact>> {
    use crate::db::get_pool;
    use sqlx::query_as;
    
    let pool = get_pool(app_handle)?;
    
    let contacts = query_as::<_, Contact>(
        "SELECT id, name, status, category FROM contacts ORDER BY category, name"
    )
    .fetch_all(&pool)
    .await?;
    
    Ok(contacts)
}

/// Get messages for a specific contact
#[tauri::command]
pub async fn get_messages(contact_id: i64, app_handle: AppHandle) -> AppResult<Vec<Message>> {
    use crate::db::get_pool;
    use sqlx::query_as;
    
    let pool = get_pool(app_handle)?;
    
    let messages = query_as::<_, Message>(
        "SELECT id, contact_id, content, is_from_user, timestamp FROM messages 
         WHERE contact_id = ? 
         ORDER BY timestamp"
    )
    .bind(contact_id)
    .fetch_all(&pool)
    .await?;
    
    Ok(messages)
}

/// Send a message to a contact
#[tauri::command]
pub async fn send_message(contact_id: i64, content: String, app_handle: AppHandle) -> AppResult<Message> {
    use crate::db::get_pool;
    use sqlx::query_as;
    
    let pool = get_pool(app_handle)?;
    
    // Insert the message from the user
    let message_id = sqlx::query(
        "INSERT INTO messages (contact_id, content, is_from_user) VALUES (?, ?, true)"
    )
    .bind(contact_id)
    .bind(&content)
    .execute(&pool)
    .await?
    .last_insert_rowid();
    
    // Get the inserted message
    let message = query_as::<_, Message>(
        "SELECT id, contact_id, content, is_from_user, timestamp FROM messages WHERE id = ?"
    )
    .bind(message_id)
    .fetch_one(&pool)
    .await?;
    
    Ok(message)
}

/// Data structures for the commands

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Contact {
    pub id: i64,
    pub name: String,
    pub status: String,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Message {
    pub id: i64,
    pub contact_id: i64,
    pub content: String,
    pub is_from_user: bool,
    #[serde(with = "time::serde::iso8601")]
    pub timestamp: time::OffsetDateTime,
}