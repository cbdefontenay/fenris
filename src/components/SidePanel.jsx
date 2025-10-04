import {useState} from 'react';

export default function SidePanel() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const handleAddFolder = () => {
        console.log("Add folder clicked - functionality to be implemented");
    };

    // Mobile toggle button for small screens
    const MobileToggleButton = () => (
        <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-(--primary) text-(--on-primary) shadow-lg"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        </button>
    );

    // Mobile overlay
    const MobileOverlay = () => (
        <div
            className={`lg:hidden fixed inset-0 bg-(--scrim) bg-opacity-50 z-40 transition-opacity duration-300 ${
                isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileOpen(false)}
        />
    );

    return (
        <>
            <MobileToggleButton/>
            <MobileOverlay/>

            {/* Side Panel */}
            <div className={`
                fixed lg:relative z-40
                w-64 h-screen bg-(--surface-container) text-(--on-surface) border-r border-(--outline-variant)
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                page-margin lg:ml-20
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-(--outline-variant)">
                    <h2 className="text-lg font-semibold text-(--on-surface)">Workspace</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddFolder}
                            className="p-2 rounded-lg bg-(--primary) text-(--on-primary) hover:bg-(--primary-container) hover:text-(--on-primary-container) transition-colors duration-200"
                            title="Add new folder"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        </button>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden p-2 rounded-lg text-(--on-surface-variant) hover:bg-(--surface-container-high) transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Folders Section */}
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-(--on-surface-variant) uppercase tracking-wide mb-3">
                            Folders
                        </h3>

                        {/* Placeholder folder items */}
                        <div className="space-y-2">
                            <div
                                className="flex items-center p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <svg className="w-5 h-5 mr-3 text-(--primary)" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                                </svg>
                                <span className="text-(--on-surface)">Documents</span>
                            </div>

                            <div
                                className="flex items-center p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <svg className="w-5 h-5 mr-3 text-(--primary)" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                                </svg>
                                <span className="text-(--on-surface)">Projects</span>
                            </div>

                            <div
                                className="flex items-center p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <svg className="w-5 h-5 mr-3 text-(--primary)" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                                </svg>
                                <span className="text-(--on-surface)">Archive</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="p-4 border-t border-(--outline-variant)">
                        <h3 className="text-sm font-medium text-(--on-surface-variant) uppercase tracking-wide mb-3">
                            Recent Notes
                        </h3>

                        {/* Placeholder note items */}
                        <div className="space-y-2">
                            <div
                                className="p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <div className="text-(--on-surface) font-medium text-sm">Meeting Notes</div>
                                <div className="text-(--on-surface-variant) text-xs">Updated 2 hours ago</div>
                            </div>

                            <div
                                className="p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <div className="text-(--on-surface) font-medium text-sm">Project Ideas</div>
                                <div className="text-(--on-surface-variant) text-xs">Updated yesterday</div>
                            </div>

                            <div
                                className="p-2 rounded-lg hover:bg-(--surface-container-high) transition-colors cursor-pointer">
                                <div className="text-(--on-surface) font-medium text-sm">Shopping List</div>
                                <div className="text-(--on-surface-variant) text-xs">Updated 3 days ago</div>
                            </div>
                        </div>
                    </div>

                    {/* Empty State - Will be hidden when real data is added */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-(--on-surface-variant) mb-3" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                            </svg>
                            <p className="text-(--on-surface-variant) text-sm">No folders yet</p>
                            <p className="text-(--on-surface-variant) text-xs mt-1">Click the + button to create one</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-(--outline-variant) bg-(--surface-container-low)">
                    <div className="text-xs text-(--on-surface-variant) text-center">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}