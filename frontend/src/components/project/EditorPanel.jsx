import React from "react";
import Editor from "@monaco-editor/react";

const EditorPanel = ({
    openTabs,
    selectedFile,
    handleOpenFile,
    handleCloseTab,
    isUnsaved,
    handleSaveFile,
    editorContent,
    setEditorContent,
    setIsUnsaved,
    handleCreateFile,
    handleOpenInviteModal,
    setIsChatOpen,
    textareaRef,
    getLanguageFromFilename,
    getFileIcon,
}) => {
    return (
        <section className="flex-1 bg-black flex flex-col min-w-0 border-r border-obsidian-850">
            {openTabs.length > 0 ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* VS Code Style Multi-Tab Header Strip */}
                    <div className="h-11 border-b border-obsidian-850 bg-obsidian-950 flex justify-between items-center pr-4 flex-shrink-0 select-none overflow-hidden">
                        <div className="flex-1 flex overflow-x-auto scroll-container h-full">
                            {openTabs.map((filename) => {
                                const isActive = selectedFile === filename;
                                return (
                                    <div
                                        key={filename}
                                        onClick={() => handleOpenFile(filename)}
                                        className={`group/tab h-full flex items-center gap-2.5 px-4 border-r border-obsidian-900 cursor-pointer transition-all text-sm relative ${
                                            isActive
                                                ? "bg-black text-white border-t-2 border-t-accent-violet font-semibold"
                                                : "bg-obsidian-950/40 text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-900/40"
                                        }`}
                                    >
                                        <span className="flex items-center text-base">{getFileIcon(filename)}</span>
                                        <span className="truncate max-w-[150px] font-mono mt-0.5">{filename}</span>

                                        {/* Unsaved status dot or Close cross button */}
                                        {isUnsaved && isActive ? (
                                            <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 group-hover/tab:hidden shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
                                        ) : null}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCloseTab(filename);
                                            }}
                                            className={`p-1 rounded text-obsidian-500 hover:text-white hover:bg-obsidian-800 transition-all ${
                                                isActive ? "flex" : "hidden group-hover/tab:flex"
                                            }`}
                                            title="Close Tab"
                                        >
                                            <i className="ri-close-line text-sm"></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Save Action Button aligned with tab strip */}
                        <div className="flex items-center gap-3 flex-shrink-0 pl-3">
                            {selectedFile && (
                                <button
                                    onClick={handleSaveFile}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all font-bold shadow-sm ${
                                        isUnsaved
                                            ? "bg-white hover:bg-obsidian-100 text-obsidian-950 active:scale-95"
                                            : "bg-obsidian-900 text-obsidian-500 cursor-not-allowed border border-obsidian-850"
                                    }`}
                                    disabled={!isUnsaved}
                                >
                                    <i className="ri-save-line text-sm"></i>
                                    <span className="uppercase tracking-wider">Save</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Editor Panel */}
                    {selectedFile ? (
                        <Editor
                            height="100%"
                            language={getLanguageFromFilename(selectedFile)}
                            value={editorContent}
                            onChange={(value) => {
                                setEditorContent(value ?? "");
                                setIsUnsaved(true);
                            }}
                            theme="vs-dark"
                            options={{
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                fontSize: 14, // slightly larger for readability
                                fontFamily: "'Fira Code', monospace",
                                minimap: { enabled: false },
                                padding: { top: 16 },
                            }}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black">
                            <div className="w-16 h-16 rounded-2xl bg-obsidian-900/50 flex items-center justify-center mb-4 border border-obsidian-800 shadow-sm">
                                <i className="ri-file-code-line text-3xl text-obsidian-500"></i>
                            </div>
                            <h3 className="text-lg font-bold text-obsidian-200 tracking-tight">
                                No active tab selected
                            </h3>
                            <p className="text-sm text-obsidian-400 max-w-md mt-2 leading-relaxed">
                                Select an open file from your tab strip or folder tree to continue editing.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-violet/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-obsidian-950 border border-obsidian-800 flex items-center justify-center mb-6 shadow-2xl">
                            <i className="ri-code-s-slash-line text-4xl text-accent-violet/80"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">codeweave</h3>
                        <p className="text-sm text-obsidian-400 max-w-md mt-3 leading-relaxed">
                            Select or create a file from the explorer pane to start coding collaboratively.
                        </p>

                        <div className="mt-10 flex flex-col gap-3 max-w-sm w-full text-left bg-obsidian-950/80 p-6 rounded-xl border border-obsidian-900 shadow-lg backdrop-blur-sm">
                            <span className="text-xs text-obsidian-500 font-bold uppercase tracking-widest block mb-2">
                                Quick Actions
                            </span>
                            <button
                                onClick={handleCreateFile}
                                className="flex items-center gap-3 text-obsidian-300 hover:text-white transition-colors py-1.5 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-obsidian-900 border border-obsidian-850 flex items-center justify-center group-hover:bg-obsidian-800 transition-colors">
                                    <i className="ri-file-add-line"></i>
                                </div>
                                <span className="text-sm font-medium">Create new file</span>
                            </button>
                            <button
                                onClick={handleOpenInviteModal}
                                className="flex items-center gap-3 text-obsidian-300 hover:text-white transition-colors py-1.5 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-obsidian-900 border border-obsidian-850 flex items-center justify-center group-hover:bg-obsidian-800 transition-colors">
                                    <i className="ri-user-add-line"></i>
                                </div>
                                <span className="text-sm font-medium">Add team member</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsChatOpen(true);
                                    setTimeout(() => {
                                        if (textareaRef.current) textareaRef.current.focus();
                                    }, 100);
                                }}
                                className="flex items-center gap-3 text-obsidian-300 hover:text-white transition-colors py-1.5 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-obsidian-900 border border-obsidian-850 flex items-center justify-center group-hover:bg-obsidian-800 transition-colors">
                                    <i className="ri-message-3-line"></i>
                                </div>
                                <span className="text-sm font-medium">Open workspace chat</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EditorPanel;
