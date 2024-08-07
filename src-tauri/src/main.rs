#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate core;
extern crate tauri;


#[tauri::command]
fn ai_move(_map: [[i32; 19]; 19], _player1_capture: i32, _ai_capture: i32, _player1_stones: i32, _ai_stones: i32, _current_color: i32) -> [i32; 2] {

    let result: [i32; 2] = [0, 0];
    result
}

pub fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![ai_move])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}