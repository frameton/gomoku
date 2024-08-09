#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate core;
extern crate tauri;
mod ai;


pub fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![ai::ai_move])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}