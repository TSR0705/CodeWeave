import React from "react";
import { PromptBox } from "../ui/PromptBox";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatPanel = ({
    setIsChatOpen,
    messages,
    handleSendMessage,
    inputRef,
    user,
    getFileIcon,
    handleCopyToClipboard,
}) => {
    const [inputMessage, setInputMessage] = React.useState("");
    const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleQuickPrompt = (promptText) => {
        setInputMessage(promptText);
        setTimeout(() => {
            if (inputRef?.current) {
                inputRef.current.focus();
            }
        }, 50);
    };

    // Render Chat Messages
    const renderMessage = (msg, index) => {
        const isAI = msg.sender?._id === "ai";
        const isMe = msg.sender?._id === user?._id;

        if (isAI) {
            let aiText = "";
            let aiFiles = {};
            let buildCommand = null;
            let startCommand = null;

            try {
                const parsed = typeof msg.message === "string" ? JSON.parse(msg.message) : msg.message;
                aiText = parsed.text || "Generated updates";
                if (parsed.fileTree) aiFiles = parsed.fileTree;
                buildCommand = parsed.buildCommand;
                startCommand = parsed.startCommand;
            } catch (e) {
                aiText = typeof msg.message === "string" ? msg.message : JSON.stringify(msg.message);
            }

            return (
                <div
                    key={msg._id || index}
                    className="flex flex-col mb-6 bg-obsidian-900/20 p-2 rounded-2xl rounded-tl-sm self-start text-left max-w-[95%] group animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <div className="w-6 h-6 rounded-md bg-accent-violet/10 flex items-center justify-center border border-accent-violet/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            <i className="ri-magic-line text-accent-violet text-xs"></i>
                        </div>
                        <span className="text-xs font-bold text-obsidian-200 uppercase tracking-widest flex items-center gap-2">
                            CodeWeave AI
                        </span>
                    </div>

                    <div className="text-[13px] text-obsidian-200 leading-relaxed px-2 markdown-body break-words">
                        <ReactMarkdown
                            children={aiText}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                        <div className="my-4 rounded-xl overflow-hidden border border-obsidian-800 bg-obsidian-950 font-mono text-[13px] shadow-sm">
                                            <div className="bg-obsidian-900 px-4 py-2 flex justify-between items-center border-b border-obsidian-850 text-obsidian-400 text-[10px] uppercase font-bold tracking-widest">
                                                <span>{match[1]}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopyToClipboard(String(children).replace(/\n$/, ""))
                                                    }
                                                    className="hover:text-white flex items-center gap-1.5 transition-colors bg-obsidian-950 px-2 py-1 rounded-md border border-obsidian-800 active:scale-95"
                                                >
                                                    <i className="ri-file-copy-line"></i> Copy
                                                </button>
                                            </div>
                                            <SyntaxHighlighter
                                                {...props}
                                                children={String(children).replace(/\n$/, "")}
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, background: "transparent", padding: "1rem" }}
                                            />
                                        </div>
                                    ) : (
                                        <code
                                            {...props}
                                            className="bg-obsidian-800 text-accent-violet px-1.5 py-0.5 rounded-md text-[12px] font-mono mx-0.5"
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                                p: ({ children }) => (
                                    <p className="mb-3 last:mb-0 leading-relaxed text-obsidian-200 break-words">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc pl-5 mb-3 text-obsidian-300 space-y-1">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal pl-5 mb-3 text-obsidian-300 space-y-1">{children}</ol>
                                ),
                                a: ({ children, href }) => (
                                    <a
                                        href={href}
                                        className="text-accent-violet hover:underline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {children}
                                    </a>
                                ),
                                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                            }}
                        />
                    </div>

                    {Object.keys(aiFiles).length > 0 && (
                        <div className="mt-4 pt-3 mx-2">
                            <span className="text-[10px] font-bold text-obsidian-400 block mb-2 uppercase tracking-widest">
                                Affected Files
                            </span>
                            <div className="space-y-1.5">
                                {Object.keys(aiFiles).map((filename, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center bg-obsidian-900/50 px-3 py-2 rounded-lg border border-obsidian-800 hover:border-obsidian-700 transition-colors group/file"
                                    >
                                        <span className="text-[13px] font-mono text-obsidian-200 flex items-center gap-2.5">
                                            {getFileIcon(filename)}
                                            {filename}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleCopyToClipboard(aiFiles[filename]?.file?.contents || "")
                                            }
                                            className="p-1.5 text-obsidian-500 hover:text-white opacity-0 group-hover/file:opacity-100 transition-all rounded-md"
                                            title="Copy File Contents"
                                        >
                                            <i className="ri-file-copy-line text-sm"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(buildCommand || startCommand) && (
                        <div className="mt-4 mx-2 bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-850 font-mono text-[12px] text-obsidian-400 space-y-2 shadow-inner">
                            {buildCommand && (
                                <div className="flex items-center gap-2">
                                    <span className="text-accent-violet font-bold select-none">$ </span>
                                    <span className="text-obsidian-200">
                                        {buildCommand.mainItem} {buildCommand.commands?.join(" ")}
                                    </span>
                                </div>
                            )}
                            {startCommand && (
                                <div className="flex items-center gap-2">
                                    <span className="text-accent-violet font-bold select-none">$ </span>
                                    <span className="text-obsidian-200">
                                        {startCommand.mainItem} {startCommand.commands?.join(" ")}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                key={msg._id || index}
                className={`flex gap-3 mb-5 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? "self-end flex-row" : "self-start flex-row-reverse"}`}
            >
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} flex-1`}>
                    {!isMe && (
                        <span className="text-[10px] font-bold mb-1.5 uppercase tracking-wider text-obsidian-500 pl-1">
                            {msg.sender?.email}
                        </span>
                    )}
                    <div
                        className={`p-3.5 border shadow-sm ${
                            isMe
                                ? "bg-obsidian-850/80 border-obsidian-800 text-white rounded-2xl rounded-tr-sm text-left"
                                : "bg-obsidian-900 border-obsidian-850 text-obsidian-100 rounded-2xl rounded-tl-sm text-left"
                        }`}
                    >
                        <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                            {typeof msg.message === "string"
                                ? msg.message.split(/(@ai)/gi).map((part, idx) =>
                                      part.toLowerCase() === "@ai" ? (
                                          <span
                                              key={idx}
                                              className="text-accent-violet font-bold bg-accent-violet/10 px-1 py-0.5 rounded border border-accent-violet/20"
                                          >
                                              {part}
                                          </span>
                                      ) : (
                                          part
                                      )
                                  )
                                : msg.message}
                        </div>
                    </div>
                </div>

                <div
                    className="w-8 h-8 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-obsidian-300 shadow-sm mt-0.5"
                    title={msg.sender?.email}
                >
                    {msg.sender?.email?.[0]?.toUpperCase() || "?"}
                </div>
            </div>
        );
    };

    return (
        <section className="w-[420px] bg-obsidian-950 flex flex-col flex-shrink-0 border-l border-obsidian-850 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] relative">
            <div className="p-4 border-b border-obsidian-850 flex items-center justify-between bg-obsidian-950/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-obsidian-200 tracking-widest uppercase">AI Workspace</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20 uppercase tracking-widest font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        <span>Live</span>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(false)}
                        className="text-obsidian-500 hover:text-white w-6 h-6 flex items-center justify-center rounded-md hover:bg-obsidian-850 transition-colors"
                        title="Close Panel"
                    >
                        <i className="ri-close-line text-lg"></i>
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col message-box scroll-container pb-48">
                {messages.length === 0 && (
                    <div className="my-auto px-4 flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-obsidian-800 to-obsidian-900 flex items-center justify-center mb-6 border border-obsidian-700 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                            <div className="absolute inset-0 rounded-2xl bg-accent-violet/20 blur-xl"></div>
                            <i className="ri-robot-2-line text-2xl text-white relative z-10"></i>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 text-center">How can I help you build?</h3>
                        <p className="text-sm text-obsidian-400 text-center leading-relaxed mb-8 max-w-[280px]">
                            CodeWeave AI can write code, debug issues, and explain complex logic.
                        </p>

                        <div className="w-full space-y-2">
                            <button
                                onClick={() => handleQuickPrompt("@ai Create a modern landing page component")}
                                className="w-full p-3 rounded-xl bg-obsidian-900/50 hover:bg-obsidian-850 border border-obsidian-800 hover:border-obsidian-700 text-left transition-all group flex items-start gap-3"
                            >
                                <i className="ri-layout-4-line text-accent-violet mt-0.5"></i>
                                <div>
                                    <span className="block text-[13px] text-white font-medium mb-0.5">Generate UI</span>
                                    <span className="block text-xs text-obsidian-400">
                                        "Create a modern landing page"
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => handleQuickPrompt("@ai Explain how the socket logic works here")}
                                className="w-full p-3 rounded-xl bg-obsidian-900/50 hover:bg-obsidian-850 border border-obsidian-800 hover:border-obsidian-700 text-left transition-all group flex items-start gap-3"
                            >
                                <i className="ri-book-read-line text-emerald-400 mt-0.5"></i>
                                <div>
                                    <span className="block text-[13px] text-white font-medium mb-0.5">
                                        Understand Code
                                    </span>
                                    <span className="block text-xs text-obsidian-400">
                                        "Explain how the socket logic works"
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
                {messages.map((msg, i) => renderMessage(msg, i))}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area (Floating) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950 to-transparent pt-12 pb-4 px-4 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2">
                    {/* Quick AI Prompts chips bar */}
                    <div className="flex items-center gap-2 overflow-x-auto scroll-container pb-1 hide-scrollbar">
                        <button
                            type="button"
                            onClick={() => handleQuickPrompt("@ai explain this file ")}
                            className="text-[11px] font-bold text-obsidian-300 hover:text-white bg-obsidian-900/80 backdrop-blur hover:bg-obsidian-800 border border-obsidian-800/80 hover:border-obsidian-700 px-3 py-1.5 rounded-full flex-shrink-0 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            <i className="ri-magic-line text-accent-violet"></i> Explain
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickPrompt("@ai find and fix the bug ")}
                            className="text-[11px] font-bold text-obsidian-300 hover:text-white bg-obsidian-900/80 backdrop-blur hover:bg-obsidian-800 border border-obsidian-800/80 hover:border-obsidian-700 px-3 py-1.5 rounded-full flex-shrink-0 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            <i className="ri-bug-line text-red-400"></i> Debug
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickPrompt("@ai refactor this to be more efficient ")}
                            className="text-[11px] font-bold text-obsidian-300 hover:text-white bg-obsidian-900/80 backdrop-blur hover:bg-obsidian-800 border border-obsidian-800/80 hover:border-obsidian-700 px-3 py-1.5 rounded-full flex-shrink-0 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            <i className="ri-flashlight-line text-amber-400"></i> Refactor
                        </button>
                    </div>

                    <div className="shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-3xl">
                        <PromptBox
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onSubmit={(e) => {
                                if (e && e.preventDefault) e.preventDefault();
                                handleSendMessage(inputMessage);
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatPanel;
