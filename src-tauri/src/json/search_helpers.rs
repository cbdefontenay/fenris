use regex::Regex;
use serde::Serialize;
use tauri::command;

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
}

#[command]
pub fn perform_search(json_response: String, search_term: String) -> Result<SearchResult, String> {
    // Parse regex and handle errors
    let regex = Regex::new(&search_term)
        .map_err(|e| format!("Invalid regex pattern: {}", e))?;

    let mut matches = Vec::new();
    let mut total_count = 0;

    // Split by lines and search in each line
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
        }
    }

    Ok(SearchResult {
        count: total_count,
        matches,
    })
}