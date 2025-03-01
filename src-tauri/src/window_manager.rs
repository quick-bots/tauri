use tauri::{Window, Manager, Runtime};
use std::sync::Once;

// Constants for precise window sizing
// Content area dimensions based on your UI design
// Content dimensions exactly matching the login form size with extra padding
const CONTENT_WIDTH: f64 = 400.0;
const CONTENT_HEIGHT: f64 = 600.0;

// We're using logical window sizing now, so we don't need titlebar height constants

// Flag to control content protection
// Set to false during development to allow screenshots
// Set to true for production to prevent screen captures
const ENABLE_CONTENT_PROTECTION: bool = false;

static INIT: Once = Once::new();

/// Adjust window size to exactly match the content size based on the platform
pub fn configure_window_size<R: Runtime>(window: &Window<R>) {
    // Platform-specific window adjustment
    let (width, height) = calculate_exact_window_size();
    
    // Set the window size using logical pixels
    let _ = window.set_size(tauri::Size::Logical(
        tauri::LogicalSize { width: width as f64, height: height as f64 }
    ));
    
    // MacOS-specific content protection setting
    #[cfg(target_os = "macos")]
    if ENABLE_CONTENT_PROTECTION {
        let _ = window.set_content_protected(true);
    }
    
    // Center window on screen
    let _ = window.center();
    
    // Make window visible after sizing (prevents visible resizing)
    let _ = window.show();
    
    // Enable to log window size for debugging
    #[cfg(debug_assertions)]
    log_window_size(window);
}

/// Calculate the window size taking into account platform-specific chrome/decorations
fn calculate_exact_window_size() -> (u32, u32) {
    // Use exactly the dimensions specified in tauri.conf.json
    // This ensures the window size matches the configured dimensions without platform adjustments
    (CONTENT_WIDTH as u32, CONTENT_HEIGHT as u32)
}

/// Configures a perfectly sized window for high DPI displays
pub fn setup_perfect_window<R: Runtime>(app: &tauri::App<R>) {
    // Initialize the main window only once
    INIT.call_once(|| {
        if let Some(window) = app.get_window("main") {
            // For high DPI displays, set the scaling factor correctly
            // Apply content protection based on the configuration flag
            #[cfg(target_os = "macos")]
            if ENABLE_CONTENT_PROTECTION {
                let _ = window.set_content_protected(true); // Prevent screen capture
            }
            
            // Perform precise window sizing
            configure_window_size(&window);
        }
    });
}

/// Logs window size information for debugging
#[cfg(debug_assertions)]
fn log_window_size<R: Runtime>(window: &Window<R>) {
    match window.inner_size() {
        Ok(size) => {
            println!("Window inner size: {}x{}", size.width, size.height);
        },
        Err(e) => {
            println!("Could not get window inner size: {}", e);
        }
    }
    
    match window.outer_size() {
        Ok(size) => {
            println!("Window outer size: {}x{}", size.width, size.height);
        },
        Err(e) => {
            println!("Could not get window outer size: {}", e);
        }
    }
}

#[tauri::command]
pub fn resize_window(width: f64, height: f64, window: tauri::Window) {
    // Set size using logical pixels for consistent UI size
    let _ = window.set_size(tauri::Size::Logical(
        tauri::LogicalSize { 
            width, 
            height 
        }
    ));
}