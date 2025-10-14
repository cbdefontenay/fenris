import {invoke} from "@tauri-apps/api/core";
import {
    atomDark,
    darcula,
    gruvboxDark,
    materialDark, materialLight,
    nord, solarizedlight, tomorrow, vscDarkPlus
} from "react-syntax-highlighter/dist/cjs/styles/prism/index.js";

export const THEMES = [
    {name: "nord", value: nord, display: "Nord"},
    {name: "atomDark", value: atomDark, display: "Atom Dark"},
    {name: "darcula", value: darcula, display: "Darcula"},
    {name: "gruvboxDark", value: gruvboxDark, display: "Gruvbox Dark"},
    {name: "materialDark", value: materialDark, display: "Material Dark"},
    {name: "materialLight", value: materialLight, display: "Material Light"},
    {name: "solarizedlight", value: solarizedlight, display: "Solarized Light"},
    {name: "tomorrow", value: tomorrow, display: "Tomorrow"},
    {name: "vscDarkPlus", value: vscDarkPlus, display: "VS Code Dark+"}
];

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

export async function setMarkdownContent(content, setContent) {
    const state = await invoke("set_markdown_content", {
        content: content,
    });
    setContent(state);
}

export async function setMarkdownTitle(title, setTitle) {
    const state = await invoke("set_markdown_title", {
        title: title,
    });
    setTitle(state);
}

export async function setPreviewToOpen(setIsOpen) {
    const state = await invoke("preview_state");
    setIsOpen(state);
}

export async function setMarkdownFromRust(content, setMarkdown) {
    setMarkdown(content);
    await invoke("set_markdown_state", {markdown: content}).catch((err) =>
        console.error("Failed to save markdown:", err)
    );
}