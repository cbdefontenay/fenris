import { FiFile, FiTrash2, FiPlus, FiEdit } from "react-icons/fi";
import { RiRobot2Line, RiSparkling2Fill } from "react-icons/ri";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";

export default function AiShellSidebar({
                                           model,
                                           setModel,
                                           availableModels,
                                           modelsLoaded,
                                           selectedFile,
                                           handleFileSelect,
                                           clearFile,
                                           messages,
                                           clearChat,
                                           error,
                                           loading
                                       }) {
    const fileInputRef = useRef(null);
    const [showCustomModelInput, setShowCustomModelInput] = useState(false);
    const [customModelName, setCustomModelName] = useState("");
    const [isAddingCustomModel, setIsAddingCustomModel] = useState(false);
    const { t } = useTranslation();

    const handleAddCustomModel = async () => {
        if (!customModelName.trim()) return;

        setIsAddingCustomModel(true);
        try {
            await invoke("store_and_set_ai_model", { appAiModel: customModelName.trim() });

            if (!availableModels.includes(customModelName.trim())) {
                availableModels.push(customModelName.trim());
            }

            setModel(customModelName.trim());
            setShowCustomModelInput(false);
            setCustomModelName("");
        } catch (err) {
            if (!availableModels.includes(customModelName.trim())) {
                availableModels.push(customModelName.trim());
            }
            setModel(customModelName.trim());
            setShowCustomModelInput(false);
            setCustomModelName("");
        } finally {
            setIsAddingCustomModel(false);
        }
    };

    const handleModelSelect = async (selectedModel) => {
        setModel(selectedModel);
        try {
            await invoke("store_and_set_ai_model", { appAiModel: selectedModel });
        } catch (err) {
            localStorage.setItem("ai-shell-model", selectedModel);
        }
    };

    return (
        <div className="w-80 bg-(--surface-container) border-r border-(--outline-variant)/20 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <RiRobot2Line className="text-2xl text-(--primary)" />
                    <RiSparkling2Fill className="absolute -top-1 -right-1 text-xs text-(--primary-container)" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-(--on-surface)">{t("aiShellSidebar.title")}</h2>
                    <p className="text-xs text-(--on-surface-variant)">{t("aiShellSidebar.poweredBy")}</p>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {/* Model Selection */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-(--on-surface)">
                            {t("aiShellSidebar.model.label")}
                        </label>
                        <button
                            onClick={() => setShowCustomModelInput(!showCustomModelInput)}
                            className="p-1 hover:bg-(--surface-container-high) rounded text-(--primary) transition-colors"
                            title={t("aiShellSidebar.model.addCustom")}
                        >
                            <FiPlus className="text-sm" />
                        </button>
                    </div>

                    {showCustomModelInput ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={customModelName}
                                onChange={(e) => setCustomModelName(e.target.value)}
                                placeholder={t("aiShellSidebar.model.customPlaceholder")}
                                className="w-full p-2 rounded-lg bg-(--surface-container-high) border border-(--outline-variant)/30 text-(--on-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddCustomModel();
                                    }
                                    if (e.key === 'Escape') {
                                        setShowCustomModelInput(false);
                                        setCustomModelName("");
                                    }
                                }}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddCustomModel}
                                    disabled={!customModelName.trim() || isAddingCustomModel}
                                    className="flex-1 p-2 bg-(--primary) text-(--on-primary) rounded-lg text-sm hover:bg-(--primary-dark) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isAddingCustomModel ? t("aiShellSidebar.model.adding") : t("aiShellSidebar.model.add")}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCustomModelInput(false);
                                        setCustomModelName("");
                                    }}
                                    className="p-2 border border-(--outline-variant) text-(--on-surface-variant) rounded-lg text-sm hover:bg-(--surface-container-high) transition-colors"
                                >
                                    {t("aiShellSidebar.model.cancel")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <select
                            className="w-full p-2 rounded-lg bg-(--surface-container-high) border border-(--outline-variant)/30 text-(--on-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)"
                            value={model}
                            onChange={(e) => handleModelSelect(e.target.value)}
                            disabled={!modelsLoaded}
                        >
                            {!modelsLoaded ? (
                                <option value="">{t("aiShellSidebar.model.loading")}</option>
                            ) : (
                                <>
                                    <option value="" disabled>
                                        {t("aiShellSidebar.model.select")}
                                    </option>
                                    {availableModels.map((modelOption) => (
                                        <option key={modelOption} value={modelOption}>
                                            {modelOption}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    )}
                    <p className="text-xs text-(--on-surface-variant) mt-1">
                        {t("aiShellSidebar.model.helperText")}
                    </p>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-(--on-surface) mb-2">
                        {t("aiShellSidebar.file.label")}
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".md,.txt,.json,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.html,.css,.xml,.yaml,.yml,.rs,.go,.php,.rb"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 p-2 border border-(--outline-variant)/30 border-dashed rounded-lg cursor-pointer hover:bg-(--surface-container-high) transition-colors text-sm text-(--on-surface-variant)"
                    >
                        <FiFile className="text-(--primary)" />
                        <span>{t("aiShellSidebar.file.choose")}</span>
                    </label>
                    {selectedFile && (
                        <div className="mt-2 p-2 bg-(--surface-container-high) rounded-lg flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <span className="text-sm text-(--on-surface) block truncate">{selectedFile.name}</span>
                                <span className="text-xs text-(--on-surface-variant)">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            <button
                                onClick={clearFile}
                                className="p-1 hover:bg-(--error-container) rounded text-(--error)"
                                title={t("aiShellSidebar.file.remove")}
                            >
                                <FiTrash2 className="text-sm" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Chat Stats */}
                <div className="p-3 bg-(--surface-container-high) rounded-lg">
                    <div className="text-sm text-(--on-surface-variant)">{t("aiShellSidebar.stats.messages")}</div>
                    <div className="text-lg font-semibold text-(--on-surface)">{messages.length}</div>
                </div>

                {/* Clear Chat */}
                <button
                    onClick={clearChat}
                    disabled={messages.length === 0 && !selectedFile}
                    className="w-full p-2 border border-(--error) text-(--error) rounded-lg hover:bg-(--error) hover:text-(--on-error) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <FiTrash2 className="text-sm" />
                    {t("aiShellSidebar.clearChat")}
                </button>
            </div>

            {/* Status */}
            <div className="mt-auto pt-4 border-t border-(--outline-variant)/20">
                <div className={`p-2 rounded text-xs ${
                    error
                        ? 'bg-(--error-container) text-(--on-error-container)'
                        : loading
                            ? 'bg-(--primary-container) text-(--on-primary-container)'
                            : 'bg-(--surface-container-high) text-(--on-surface-variant)'
                }`}>
                    {error || (loading ? t("aiShellSidebar.status.thinking") : modelsLoaded ? t("aiShellSidebar.status.ready") : t("aiShellSidebar.status.loading"))}
                </div>
            </div>
        </div>
    );
}