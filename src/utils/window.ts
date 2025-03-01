import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

/**
 * Window size controller for precise window dimensions
 * This utility helps ensure the app window is precisely sized to
 * match the UI content dimensions
 */

// The ideal content dimensions for the UI
const IDEAL_CONTENT_WIDTH = 400;  // Exact width for login form
const IDEAL_CONTENT_HEIGHT = 600; // Increased height to accommodate all content

/**
 * Adjusts the window size to match the ideal content dimensions
 * This accounts for titlebar height on different platforms
 */
export async function adjustWindowSize(): Promise<void> {
  try {
    // Invoke the Rust resize_window command
    await invoke('resize_window', {
      width: IDEAL_CONTENT_WIDTH,
      height: IDEAL_CONTENT_HEIGHT
    });
    
    console.log('Window size adjusted to content dimensions');
  } catch (error) {
    console.error('Failed to resize window:', error);
  }
}

/**
 * Sets up window sizing and event listeners for resize events
 */
export async function setupWindow(): Promise<void> {
  // Initial size adjustment
  await adjustWindowSize();
  
  // Detect when the user manually resizes the window
  // (Only applicable if resizable is enabled)
  const unlistenResize = await appWindow.onResized(async () => {
    // Get current inner size
    const innerSize = await appWindow.innerSize();
    
    // If the window deviates too much from the ideal size, reset it
    const widthDiff = Math.abs(innerSize.width - IDEAL_CONTENT_WIDTH);
    const heightDiff = Math.abs(innerSize.height - IDEAL_CONTENT_HEIGHT);
    
    // Log the current size to help with debugging
    console.log(`Current window size: ${innerSize.width}x${innerSize.height}`);
    console.log(`Ideal size: ${IDEAL_CONTENT_WIDTH}x${IDEAL_CONTENT_HEIGHT}`);
    console.log(`Difference: ${widthDiff}w x ${heightDiff}h`);
    
    // Always force the window size on startup to ensure consistency
    await adjustWindowSize();
  });
  
  // Handle app closing to clean up listeners
  const unlistenClose = await appWindow.onCloseRequested(async (_: any) => {
    // Clean up event listeners
    unlistenResize();
    unlistenClose();
  });
}

/**
 * Use this function to detect high DPI displays and make size adjustments
 * This helps with macOS Retina displays and Windows high DPI scaling
 */
export async function detectDisplayScaling(): Promise<number> {
  // Get scaling factor based on device pixel ratio
  const factor = window.devicePixelRatio || 1;
  
  console.log(`Display scaling factor: ${factor}`);
  return factor;
}