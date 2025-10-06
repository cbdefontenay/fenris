import {useState} from "react";
import {Link, Outlet} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    FiHome,
    FiSettings,
    FiMenu,
    FiCpu
} from "react-icons/fi";
import {TbJson} from "react-icons/tb";

export default function NavBarComponent({isVisible}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const {t} = useTranslation();

    // Toggle sidebar on mobile
    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const navItems = [
        {
            nameKey: t("navbar.home"),
            icon: <FiHome className="text-(--tertiary)" size={24} />,
            path: "/home",
        },
        {
            nameKey: t("navbar.json"),
            icon: <TbJson  className="text-(--tertiary)" size={24} />,
            path: "/json",
        },
        {
            nameKey: t("navbar.aiChatbot"),
            icon: <FiCpu className="text-(--tertiary)" size={24} />,
            path: "/ai-chatbot",
        },
        {
            nameKey: t("navbar.settings"),
            icon: <FiSettings className="text-(--tertiary)" size={24} />,
            path: "/settings",
        },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={toggleSidebar}
                className="fixed md:hidden bottom-4 left-4 z-50 p-3 rounded-full bg-(--primary) text-(--on-primary) shadow-lg"
            >
                <FiMenu size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className={`sidebar
        fixed top-0 left-0 h-full z-40
        bg-(--surface-container-lowest) border-r border-(--outline-variant)
        transition-all duration-300 ease-in-out
        ${isExpanded ? "w-64" : "w-20"}
        ${isExpanded ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
            >
                <nav className="navbar h-full flex flex-col pt-6">
                    <ul className="space-y-6 px-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path}>
                                    <div
                                        className={`
                    flex items-center p-3 rounded-lg cursor-pointer
                    hover:bg-(--surface-container-high) transition-colors
                    group relative
                  `}
                                    >
                                        <div className="text-(--on-surface-variant) group-hover:text-(--on-surface)">
                                            {item.icon}
                                        </div>
                                        {/* Tooltip (visible on hover when collapsed) */}
                                        {!isExpanded && (
                                            <span
                                                className="absolute left-full ml-4 px-3 py-2 rounded-lg bg-(--surface-container-high) text-(--on-surface) text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                                                {t(item.nameKey)}
                                            </span>
                                        )}
                                        {isExpanded && (
                                            <span className="ml-4 text-(--on-surface) font-medium">
                                                {t(item.nameKey)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {isExpanded && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                />
            )}
            <main className="">
                <Outlet/>
            </main>
        </>
    );
}