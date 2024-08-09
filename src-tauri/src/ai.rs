use std::time::{Duration, Instant};

use log::{info, LevelFilter};
use env_logger::Env;

#[tauri::command]
pub fn ai_move(map: [[i32; 19]; 19], _player1_capture: i32, _ai_capture: i32, _player1_stones: i32, _ai_stones: i32, _current_color: i32, time_limit_ms: Option<u128>) -> [i32; 2] {
    let start_time = Instant::now();
    let time_limit = Duration::from_millis(time_limit_ms.unwrap_or(500) as u64);

    let mut best_move: [i32; 2] = [0, 0];
    let mut best_score = i32::MIN;

    for i in 0..19 {
        for j in 0..19 {
            if map[i][j] == 0 {
                let mut new_map = map;
                new_map[i][j] = _current_color;

                let score = minimax(new_map, 3, i32::MIN, i32::MAX, false, _current_color, start_time, time_limit);

                info!("Evaluating move at ({}, {}): score = {}", i, j, score);

                if score > best_score {
                    best_score = score;
                    best_move = [i as i32, j as i32];
                }

                if start_time.elapsed() > time_limit {
                    info!("Time limit reached. Best move so far: ({}, {}) with score {}", best_move[0], best_move[1], best_score);
                    // return (best_move, start_time.elapsed().as_millis());
                    return (best_move);
                }
            }
        }
    }

    info!("Best move found: ({}, {}) with score {}", best_move[0], best_move[1], best_score);
    best_move
}

fn minimax(map: [[i32; 19]; 19], depth: i32, alpha: i32, beta: i32, maximizing_player: bool, color: i32, start_time: Instant, time_limit: Duration) -> i32 {
    if depth == 0 || start_time.elapsed() > time_limit {
        let score = evaluate_board(map, color);
        info!("Reached terminal node or time limit. Score: {}", score);
        return score;
    }

    let mut alpha = alpha;
    let mut beta = beta;

    if maximizing_player {
        let mut max_eval = i32::MIN;
        for i in 0..19 {
            for j in 0..19 {
                if map[i][j] == 0 {
                    let mut new_map = map;
                    new_map[i][j] = color;
                    let eval = minimax(new_map, depth - 1, alpha, beta, false, color, start_time, time_limit);
                    max_eval = max_eval.max(eval);
                    alpha = alpha.max(eval);
                    if beta <= alpha {
                        break;
                    }
                }
            }
        }
        max_eval
    } else {
        let mut min_eval = i32::MAX;
        for i in 0..19 {
            for j in 0..19 {
                if map[i][j] == 0 {
                    let mut new_map = map;
                    new_map[i][j] = -color;
                    let eval = minimax(new_map, depth - 1, alpha, beta, true, color, start_time, time_limit);
                    min_eval = min_eval.min(eval);
                    beta = beta.min(eval);
                    if beta <= alpha {
                        break;
                    }
                }
            }
        }
        min_eval
    }
}

fn evaluate_board(map: [[i32; 19]; 19], color: i32) -> i32 {
    let mut score = 0;

    for i in 0..19 {
        for j in 0..19 {
            if map[i][j] == color {
                score += evaluate_position(map, i as i32, j as i32, color);
            } else if map[i][j] == -color {
                score -= evaluate_position(map, i as i32, j as i32, -color);
            }
        }
    }

    score
}

fn evaluate_position(map: [[i32; 19]; 19], x: i32, y: i32, color: i32) -> i32 {
    let mut score = 0;

    for j in 0..19 {
        if map[x as usize][j] == color {
            score += 1;
        }
    }

    for i in 0..19 {
        if map[i][y as usize] == color {
            score += 1;
        }
    }

    for i in 0..19 {
        let j1 = y + (i - x);
        if j1 >= 0 && j1 < 19 && map[i as usize][j1 as usize] == color {
            score += 1;
        }

        let j2 = y - (i - x);
        if j2 >= 0 && j2 < 19 && map[i as usize][j2 as usize] == color {
            score += 1;
        }
    }

    score
}