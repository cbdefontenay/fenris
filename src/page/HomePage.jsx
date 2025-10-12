import {useState} from "react";
import {useTranslation} from "react-i18next";
import SidePanel from "../components/SidePanel.jsx";
import MarkdownEditorComponent from "../components/Markdown/MarkdownEditorComponent.jsx";

export default function HomePage() {
    const {t} = useTranslation();
    const [selectedNote, setSelectedNote] = useState(null);

    const handleNoteSelect = (note) => {
        setSelectedNote(note);
    };

    return (
        <div className="flex min-h-screen">
            <SidePanel onNoteSelect={handleNoteSelect} />
            {/* Main content - adjust margin for sidebar */}
            <main className="flex-1 lg:ml-64 p-6 bg-(--background)">
                <MarkdownEditorComponent selectedNote={selectedNote} />
            </main>
        </div>
    );
}