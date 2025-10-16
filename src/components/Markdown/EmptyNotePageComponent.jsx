import { ImFilesEmpty } from "react-icons/im";
import { useTranslation } from "react-i18next";

export default function EmptyNotePageComponent() {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center justify-center h-full text-(--primary)">
            <div className="text-center p-8 max-w-md">
                <div className="mb-6 flex items-center justify-center">
                    <div className="relative">
                        <ImFilesEmpty size={72} className="text-(--tertiary) opacity-80"/>
                        <div className="absolute -inset-4 bg-(--primary) opacity-10 rounded-full blur-lg"></div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">
                    {t('markdownEditor.emptyState.title')}
                </h2>
                <p className="italic text-(--on-surface-variant) leading-relaxed mb-6">
                    {t('markdownEditor.emptyState.description')}
                </p>
            </div>
        </div>
    );
}