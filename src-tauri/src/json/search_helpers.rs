use regex::Regex;
use serde::Serialize;
use tauri::command;
use std::time::Instant;

#[derive(Serialize)]
pub struct SearchMatch {
    pub line_number: usize,
    pub line: String,
    pub matches: Vec<MatchRange>,
}

#[derive(Serialize)]
pub struct MatchRange {
    pub start: usize,
    pub end: usize,
}

#[derive(Serialize)]
pub struct SearchResult {
    pub count: usize,
    pub matches: Vec<SearchMatch>,
    pub duration_ms: u128,
}

#[command]
pub fn perform_search(json_response: String, search_term: String) -> Result<SearchResult, String> {
    let start_time = Instant::now();

    if search_term.trim().is_empty() {
        return Ok(SearchResult {
            count: 0,
            matches: Vec::new(),
            duration_ms: 0,
        });
    }

    let regex = Regex::new(&search_term)
        .map_err(|e| format!("Invalid regex pattern: {}", e))?;

    let mut matches = Vec::new();
    let mut total_count = 0;

    let estimated_lines = json_response.len() / 80;
    matches.reserve(estimated_lines.min(1000));

    for (line_number, line) in json_response.lines().enumerate() {
        let line_matches: Vec<MatchRange> = regex
            .find_iter(line)
            .map(|m| MatchRange {
                start: m.start(),
                end: m.end(),
            })
            .collect();

        if !line_matches.is_empty() {
            total_count += line_matches.len();
            matches.push(SearchMatch {
                line_number: line_number + 1,
                line: line.to_string(),
                matches: line_matches,
            });

            if total_count > 10000 {
                break;
            }
        }
    }

    let duration = start_time.elapsed();

    Ok(SearchResult {
        count: total_count,
        matches,
        duration_ms: duration.as_millis(),
    })
}

#[command]
pub fn perform_fast_search(json_response: String, search_term: String) -> Result<SearchResult, String> {
    let start_time = Instant::now();

    if search_term.trim().is_empty() {
        return Ok(SearchResult {
            count: 0,
            matches: Vec::new(),
            duration_ms: 0,
        });
    }

    let mut matches = Vec::new();
    let mut total_count = 0;
    let search_term_lower = search_term.to_lowercase();

    for (line_number, line) in json_response.lines().enumerate() {
        let line_lower = line.to_lowercase();
        let mut start = 0;
        let mut line_matches = Vec::new();

        while let Some(pos) = line_lower[start..].find(&search_term_lower) {
            let absolute_pos = start + pos;
            let match_range = MatchRange {
                start: absolute_pos,
                end: absolute_pos + search_term.len(),
            };

            line_matches.push(match_range);
            total_count += 1;
            start = absolute_pos + search_term.len();

            // Performance optimization for large files
            if total_count > 10000 {
                break;
            }
        }

        if !line_matches.is_empty() {
            matches.push(SearchMatch {
                line_number: line_number + 1,
                line: line.to_string(),
                matches: line_matches,
            });
        }

        if total_count > 10000 {
            break;
        }
    }

    let duration = start_time.elapsed();

    Ok(SearchResult {
        count: total_count,
        matches,
        duration_ms: duration.as_millis(),
    })
}