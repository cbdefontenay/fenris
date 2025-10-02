import {invoke} from "@tauri-apps/api/core";
import {useState} from "react";
import {LuGitPullRequestDraft} from "react-icons/lu";
import {FaCopy} from "react-icons/fa";
import {CiImport, CiTextAlignCenter} from "react-icons/ci";
import {GrSatellite} from "react-icons/gr";
import DaisyToast from "./DaisyToast.jsx";

export default function JsonFormatUrlComponent() {
    const [url, setUrl] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [outputLength, setOutputLength] = useState(0);
    const [toastVisible, setToastVisible] = useState(false);

    const handleFetch = async () => {
        if (!url) return;

        setLoading(true);

        try {
            const result = await invoke("fetch_json", {url});
            setResponse(result);
            setOutputLength(result.length);
        } catch (error) {
            setResponse(`Error: ${error}`);
            setOutputLength(0);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleFetch().then(r => "");
        }
    };

    async function chooseJsonFileFromSystem() {
        try {
            return await invoke("pick_json_file");
        } catch (error) {
            return t('shell.error', {error});
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(response);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    return (
        <div className="ml-20 flex flex-col h-screen p-6 bg-(--background) text-(--on-background)">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-(--on-background) mb-2">
                    JSON Fetcher
                </h1>
                <p className="text-(--on-surface-variant)">
                    Fetch and view JSON from any URL
                </p>
            </div>

            {/* Input Section */}
            <div className="flex gap-4 mb-6">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="https://api.example.com/data.json"
                    className="flex-1 px-4 py-3 bg-(--surface-container) border border-(--outline-variant) rounded-xl text-(--on-surface) placeholder-(--on-surface-variant) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all"
                    disabled={loading}
                />

                <button
                    onClick={handleFetch}
                    disabled={loading || !url}
                    className="cursor-pointer px-8 py-3 bg-(--primary) text-(--on-primary) rounded-xl hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors disabled:opacity-50 font-medium"
                >
          <span className="flex flex-row items-center gap-4">
            <LuGitPullRequestDraft/>
              {loading ? "Fetching..." : "Fetch"}
          </span>
                </button>
            </div>

            {/* Response Section */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-(--on-surface-variant)">
            <span className="flex flex-row items-center gap-4">
              <CiTextAlignCenter className="text-(--secondary)"/> Length:{" "}
                {outputLength} characters
            </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={chooseJsonFileFromSystem}
                                className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors disabled:opacity-50 text-sm font-medium">
                            <span className="flex flex-row items-center gap-4">
                                <CiImport className="text-(--secondary)"/> Browse files
                              </span>
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={!response}
                            className="cursor-pointer px-4 py-2 bg-(--surface-container-high) text-(--on-surface) rounded-lg hover:bg-(--surface-container-highest) transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          <span className="flex flex-row items-center gap-4">
                            <FaCopy className="text-(--secondary)"/> Copy
                          </span>
                        </button>
                    </div>
                </div>

                {/* JSON Display */}
                <div
                    className="flex-1 bg-(--surface-container) rounded-xl border border-(--outline-variant) overflow-hidden">
                    {response ? (
                        <pre
                            className="w-full h-full p-4 bg-(--surface-container-high) text-(--on-surface) font-mono text-sm overflow-auto whitespace-pre-wrap">
              {response}
            </pre>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-(--on-surface-variant)">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="text-4xl mb-2">
                                    <GrSatellite className="text-(--tertiary)" size={30}/>
                                </div>
                                <p className="text-(--tertiary)">
                                    Enter a URL and click Fetch to get JSON data
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Examples */}
            <div className="mt-6 p-4 bg-(--surface-container) rounded-xl border border-(--outline-variant)">
                <h3 className="text-sm font-medium text-(--on-surface-variant) mb-2">
                    💡 Try these examples:
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                    {[
                        "https://jsonplaceholder.typicode.com/posts/1",
                        "https://api.github.com/users/octocat",
                        "https://api.agify.io?name=michael",
                    ].map((exampleUrl) => (
                        <button
                            key={exampleUrl}
                            onClick={() => setUrl(exampleUrl)}
                            className="px-3 py-1 bg-(--surface-container-high) text-(--on-surface) rounded hover:bg-(--surface-container-highest) transition-colors"
                        >
                            {exampleUrl}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toast */}
            {toastVisible && <DaisyToast message="Text copied!"/>}
        </div>
    );
}