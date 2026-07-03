import React, { useState } from "react";

const ProjectSidebar = ({
    user,
    fileTree,
    selectedFile,
    handleCreateFile,
    handleOpenFile,
    handleDeleteFile,
    getFileIcon,
    collaborators,
    isCollabSectionCollapsed,
    setIsCollabSectionCollapsed,
    handleOpenInviteModal,
    isChatOpen,
    setIsChatOpen,
}) => {
    const [fileSearchQuery, setFileSearchQuery] = useState("");

    return (
        <>
            {/* 1. Activity Bar (Left-most vertical strip) */}
            <aside className="w-14 border-r border-obsidian-850 bg-obsidian-900 flex flex-col justify-between items-center py-4 flex-shrink-0 select-none shadow-sm z-20">
                <div className="flex flex-col items-center gap-4 w-full">
                    {/* Explorer icon */}
                    <div className="relative group w-full flex justify-center">
                        <div className="absolute left-0 top-1 w-1 h-6 bg-accent-violet rounded-r-md"></div>
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-obsidian-950 border border-obsidian-850 shadow-inner cursor-pointer hover:bg-obsidian-850 transition-colors"
                            title="Explorer"
                        >
                            <i className="ri-file-code-line text-lg text-accent-violet"></i>
                        </div>
                    </div>

                    {/* Chat icon indicator inside Activity Bar */}
                    <div
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 border ${
                            isChatOpen
                                ? "text-white bg-obsidian-950 border-obsidian-800 shadow-inner"
                                : "text-obsidian-400 hover:text-white hover:bg-obsidian-850 border-transparent"
                        }`}
                        title="Toggle Chat & AI"
                    >
                        <i className="ri-message-3-line text-lg"></i>
                    </div>

                    {/* Invite modal trigger inside Activity Bar */}
                    <div
                        onClick={handleOpenInviteModal}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-obsidian-400 hover:text-white hover:bg-obsidian-850 border border-transparent cursor-pointer transition-all duration-200"
                        title="Add Collaborator"
                    >
                        <i className="ri-user-add-line text-lg"></i>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {/* User initials representation */}
                    <div
                        className="w-10 h-10 rounded-full bg-obsidian-950 border border-obsidian-850 flex items-center justify-center text-sm font-bold text-obsidian-300 uppercase cursor-default shadow-inner"
                        title={user?.email}
                    >
                        {user?.email ? user.email.slice(0, 2) : "??"}
                    </div>
                </div>
            </aside>

            {/* 2. Unified Sidebar - Files & Collaborators */}
            <aside className="w-64 border-r border-obsidian-850 bg-obsidian-900 flex flex-col flex-shrink-0 shadow-sm z-10">
                {/* Local File Search Input */}
                <div className="p-4 border-b border-obsidian-850/60 bg-obsidian-900/50">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-obsidian-400 pointer-events-none">
                            <i className="ri-search-line text-sm"></i>
                        </span>
                        <input
                            value={fileSearchQuery}
                            onChange={(e) => setFileSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 bg-obsidian-950 border border-obsidian-800 hover:border-obsidian-700 focus:border-accent-violet rounded-lg text-sm text-white placeholder-obsidian-500 focus:outline-none transition-all"
                            placeholder="Search files..."
                        />
                        {fileSearchQuery && (
                            <button
                                onClick={() => setFileSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-obsidian-400 hover:text-white"
                            >
                                <i className="ri-close-line text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Files Section */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-[200px] bg-obsidian-900/10">
                    <div className="px-4 py-3 flex justify-between items-center group">
                        <span className="text-xs font-bold text-obsidian-300 tracking-wider uppercase">Explorer</span>
                        <button
                            onClick={handleCreateFile}
                            className="w-7 h-7 bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-800 text-obsidian-300 hover:text-white rounded-lg transition-colors flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Create File"
                        >
                            <i className="ri-file-add-line text-sm"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 scroll-container">
                        {Object.keys(fileTree).filter((filename) =>
                            filename.toLowerCase().includes(fileSearchQuery.toLowerCase())
                        ).length === 0 ? (
                            <div className="text-center text-sm text-obsidian-500 py-10 px-4">
                                {Object.keys(fileTree).length === 0
                                    ? "Your project is empty. Create a file to get started."
                                    : "No matching files found."}
                            </div>
                        ) : (
                            Object.keys(fileTree)
                                .filter((filename) => filename.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                                .map((filename) => (
                                    <div
                                        key={filename}
                                        onClick={() => handleOpenFile(filename)}
                                        className={`w-full group/file flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all cursor-pointer border ${
                                            selectedFile === filename
                                                ? "bg-obsidian-950 text-white border-obsidian-800 shadow-sm font-medium"
                                                : "text-obsidian-300 hover:text-white hover:bg-obsidian-850/50 border-transparent"
                                        }`}
                                    >
                                        <span className="truncate flex items-center gap-2.5 font-mono">
                                            {getFileIcon(filename)}
                                            {filename}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteFile(e, filename)}
                                            className="opacity-0 group-hover/file:opacity-100 p-1 text-obsidian-500 hover:text-red-400 rounded transition-opacity"
                                            title="Delete File"
                                        >
                                            <i className="ri-delete-bin-line text-sm"></i>
                                        </button>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* Collaborators Collapsible Section */}
                <div className="border-t border-obsidian-850 bg-obsidian-900 flex flex-col flex-shrink-0 shadow-inner">
                    <div
                        onClick={() => setIsCollabSectionCollapsed(!isCollabSectionCollapsed)}
                        className="px-4 py-3.5 flex justify-between items-center cursor-pointer select-none hover:bg-obsidian-850/40 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <i
                                className={`text-obsidian-400 text-sm transition-transform duration-200 ${isCollabSectionCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-down-s-line"}`}
                            ></i>
                            <span className="text-xs font-bold text-obsidian-300 tracking-wider uppercase">Team</span>
                            <span className="text-xs bg-obsidian-950 border border-obsidian-800 px-1.5 py-0.5 rounded-md text-obsidian-400 shadow-inner font-mono">
                                {collaborators.length}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenInviteModal();
                            }}
                            className="w-7 h-7 bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-800 text-obsidian-300 hover:text-white rounded-lg transition-colors flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100"
                            title="Add Collaborator"
                        >
                            <i className="ri-user-add-line text-sm"></i>
                        </button>
                    </div>

                    {!isCollabSectionCollapsed && (
                        <div className="max-h-56 overflow-y-auto px-2 pb-3 space-y-1.5 scroll-container border-t border-obsidian-850/30 pt-2">
                            {collaborators.map((c) => (
                                <div
                                    key={c._id}
                                    className="flex items-center gap-2.5 p-2 bg-obsidian-900/20 rounded-lg border border-transparent hover:border-obsidian-800 hover:bg-obsidian-850/40 transition-all duration-150"
                                >
                                    <div className="w-7 h-7 rounded-md bg-obsidian-950 border border-obsidian-800 flex items-center justify-center font-bold text-xs text-obsidian-300 uppercase shadow-sm">
                                        {c.email.slice(0, 2)}
                                    </div>
                                    <span className="text-sm text-obsidian-200 truncate flex-1" title={c.email}>
                                        {c.email}
                                    </span>
                                    <span
                                        className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                        title="Online"
                                    ></span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default ProjectSidebar;
