import {useEffect, useState} from "react";
import {useTheme} from "../data/ThemeProvider";
import LanguageSelector from "../components/LanguageSelector.jsx";
import {useTranslation} from "react-i18next";

export default function SettingPage() {
    const [mounted, setMounted] = useState(false);
    const {theme, toggleTheme, changeTheme} = useTheme();
    const [activeTab, setActiveTab] = useState("appearance");
    const {t} = useTranslation();

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const themeOptions = [
        { value: "light", label: t("settings.appearance.themes.light"), description: t("settings.appearance.themes.lightDescription") },
        { value: "dark", label: t("settings.appearance.themes.dark"), description: t("settings.appearance.themes.darkDescription") },
        { value: "nord", label: t("settings.appearance.themes.nord"), description: t("settings.appearance.themes.nordDescription") }
    ];

    return (
        <div className="page-margin lg:ml-20 flex flex-col h-screen bg-(--background) text-(--on-background)">
            <div className="border-b border-(--outline-variant) p-4">
                <h1 className="text-2xl font-semibold">
                    {t("settings.header")}
                </h1>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-48 border-r border-(--outline-variant) p-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab("appearance")}
                            className={`cursor-pointer w-full text-left px-3 py-2 rounded-md ${activeTab === "appearance" ? "bg-(--primary-container) text-(--on-primary-container)" : "hover:bg-(--surface-container-high)"}`}
                        >
                            {t("settings.tabs.appearance")}
                        </button>
                        <button
                            onClick={() => setActiveTab("language")}
                            className={`cursor-pointer w-full text-left px-3 py-2 rounded-md ${activeTab === "language" ? "bg-(--primary-container) text-(--on-primary-container)" : "hover:bg-(--surface-container-high)"}`}
                        >
                            {t("settings.tabs.language")}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">{t("settings.appearance.title")}</h2>

                            {/* Theme Selection */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg">{t("settings.appearance.appTheme")}</h3>
                                <p className="text-sm text-(--on-surface-variant)">
                                    {t("settings.appearance.themeDescription")}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    {themeOptions.map((themeOption) => (
                                        <div
                                            key={themeOption.value}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                                theme === themeOption.value
                                                    ? 'border-(--primary) bg-(--primary-container/20)'
                                                    : 'border-(--outline-variant) hover:border-(--primary) hover:bg-(--surface-container-high)'
                                            }`}
                                            onClick={() => changeTheme(themeOption.value)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{themeOption.label}</span>
                                                {theme === themeOption.value && (
                                                    <div className="w-2 h-2 bg-(--primary) rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-(--on-surface-variant)">
                                                {themeOption.description}
                                            </p>

                                            {/* Theme Preview */}
                                            <div className="mt-3 flex gap-1">
                                                <div className={`w-4 h-4 rounded ${
                                                    themeOption.value === 'light' ? 'bg-[#422b60]' :
                                                        themeOption.value === 'dark' ? 'bg-[#f8ecff]' :
                                                            'bg-[#88C0D0]'
                                                }`}></div>
                                                <div className={`w-4 h-4 rounded ${
                                                    themeOption.value === 'light' ? 'bg-[#7b629c]' :
                                                        themeOption.value === 'dark' ? 'bg-[#d3b7fb]' :
                                                            'bg-[#81A1C1]'
                                                }`}></div>
                                                <div className={`w-4 h-4 rounded ${
                                                    themeOption.value === 'light' ? 'bg-[#3b3246]' :
                                                        themeOption.value === 'dark' ? 'bg-[#3b4252]' :
                                                            'bg-[#4C566A]'
                                                }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Toggle */}
                            <div className="border-t border-(--outline-variant) pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{t("settings.appearance.quickToggle")}</h3>
                                        <p className="text-sm text-(--on-surface-variant)">
                                            {t("settings.appearance.quickToggleDescription")}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={theme !== "light"}
                                            onChange={toggleTheme}
                                        />
                                        <div
                                            className="w-11 h-6 bg-(--surface-container-high) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--on-surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "language" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">{t("settings.language.title")}</h2>
                            <div className="space-y-4">
                                <LanguageSelector/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}