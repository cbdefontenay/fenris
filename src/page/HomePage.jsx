import { useTranslation } from "react-i18next";
import SidePanel from "../components/SidePanel.jsx";

export default function HomePage() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen">
            <SidePanel/>
            {/* Main content - adjust margin for sidebar */}
            <main className="flex-1 lg:ml-64 p-6 bg-(--background)">
                <h1 className="text-2xl font-bold text-(--on-background) mb-2">{t('home.welcome')}</h1>
                <p className="text-(--on-surface-variant) mb-4">{t('home.description')}</p>

                {/* Test content to see if layout is working */}
                <div className="bg-(--surface-container) p-4 rounded-lg">
                    <p>If you can see this content but not the sidebar, the sidebar is likely hidden by CSS transforms.</p>
                </div>
            </main>
        </div>
    );
}