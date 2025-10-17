import {invoke} from "@tauri-apps/api/core";
import {
    atomDark,
    darcula,
    gruvboxDark,
    materialDark,
    materialLight,
    nord,
    solarizedlight,
    tomorrow,
    vscDarkPlus
} from "react-syntax-highlighter/dist/cjs/styles/prism/index.js";


export const listOfThemes = await invoke("list_of_themes");

export const themeMap = {
    nord,
    atomDark,
    darcula,
    gruvboxDark,
    materialDark,
    materialLight,
    solarizedlight,
    tomorrow,
    vscDarkPlus
};

export async function getStoredTheme() {
    return await invoke("get_theme");
}

export async function setStoredTheme(codeTheme, setCodeTheme) {
    const state = await invoke("set_theme", {
        codeTheme: codeTheme,
    });
    setCodeTheme(state);
}

export async function setWordCountForMarkdown(count, setWordCount) {
    const state = await invoke("set_word_count_for_markdown", {
        count: count,
    });
    setWordCount(state);
}

export async function setCharCountForMarkdown(charCount, setCharCount) {
    const state = await invoke("set_char_count_for_markdown", {
        charCount: charCount,
    });
    setCharCount(state);
}

export async function setIsMarkdownFullScreen(isFullscreen, setIsFullscreen) {
    const state = await invoke("is_markdown_full_screen", {
        isFullscreen: isFullscreen,
    });
    setIsFullscreen(state);
}