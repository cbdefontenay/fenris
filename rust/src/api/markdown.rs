use flutter_rust_bridge::frb;
use pulldown_cmark::{Parser, html, Options}; 

#[frb(sync)]
pub fn convert_markdown_to_html(markdown: String) -> String {
    let mut options = Options::empty();
    
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS); 

    let parser = Parser::new_ext(&markdown, options);
    
    let mut html_output = String::new();

    html::push_html(&mut html_output, parser);

    html_output
}

#[frb(init)]
pub fn init_app() {
    flutter_rust_bridge::setup_default_user_utils();
}