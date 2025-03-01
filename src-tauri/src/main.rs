// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod mcp;
mod commands;
mod db;
mod error;

use tauri::Manager;
use log::{info, warn, error};

fn main() {
    // Create a basic Tauri application
    tauri::Builder::default()
        // Add the plugin configuration
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        
        // Register our custom commands
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::get_app_version,
            mcp::connect_mcp
        ])
        
        // Setup window
        .setup(|app| {
            // Log information when the app starts
            info!("Application starting up");
            
            // Initialize the database
            match db::init_database(app.handle()) {
                Ok(_) => info!("Database initialized successfully"),
                Err(e) => error!("Failed to initialize database: {}", e),
            }
            
            // Initialize MCP connections
            match mcp::init_mcp() {
                Ok(_) => info!("MCP initialized successfully"),
                Err(e) => warn!("Failed to initialize MCP: {}", e),
            }
            
            Ok(())
        })
        
        // Run the application
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}