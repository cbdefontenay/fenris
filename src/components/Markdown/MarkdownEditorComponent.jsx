import {useState, useEffect} from 'react';
import {ImFilesEmpty} from "react-icons/im";
import {invoke} from "@tauri-apps/api/core";

export default function MarkdownEditorComponent({selectedNote}) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [counter, setCounter] = useState(0);

    async function add() {
        setCounter(await invoke("calculate", { method: "add" }));
    }

    async function subtract() {
        setCounter(await invoke("calculate", { method: "subtract" }));
    }


    useEffect(() => {
        if (selectedNote) {
            setTitle(selectedNote.title || "");
            setContent(selectedNote.content || "");
        } else {
            setTitle("");
            setContent("");
        }
    }, [selectedNote]);

    if (!selectedNote) {
        return (
            <div className="flex items-center justify-center mr-44 h-full text-(--primary)">
                <div className="text-center">
                    <div className="mb-4 flex items-center justify-center">
                        <ImFilesEmpty size={64}/>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                        No Note Selected
                    </h2>
                    <p className="italic">Select a note from the sidebar to start editing <br/> or create a new one.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">

            <div className="text-6xl text-gray-800 font-bold">
                <span>{counter}</span>
            </div>
            <div className="flex justify-between space-x-4">
                <button
                    className="bg-red-700 text-white hover:bg-red-800 active:bg-red-900 text-4xl font-extrabold"
                    onClick={() => subtract()}
                >
                    -
                </button>
                <button
                    className="bg-indigo-700 text-white hover:bg-indigo-800 active:bg-indigo-900 text-4xl font-extrabold"
                    onClick={() => add()}
                >
                    +
                </button>
            </div>
            {/* Note Title */}
            <div className="mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none text-(--on-surface) placeholder-(--on-surface-variant)"
                    placeholder="Note Title"
                />
            </div>

            {/* Markdown Editor */}
            <div className="flex-1 border border-(--outline-variant) rounded-lg overflow-hidden">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-full p-4 bg-(--surface) text-(--on-surface) resize-none outline-none"
                    placeholder="Start writing your markdown here..."
                />
            </div>

            {/* You can add markdown preview functionality later */}
            <div className="mt-4 text-sm text-(--on-surface-variant)">
                Editing: <span className="font-medium">{title}</span>
            </div>
        </div>
    );
}