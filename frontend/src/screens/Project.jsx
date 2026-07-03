import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { io } from "socket.io-client";

// Import Refactored Components
import ProjectSidebar from "../components/project/ProjectSidebar";
import EditorPanel from "../components/project/EditorPanel";
import ChatPanel from "../components/project/ChatPanel";
import InviteModal from "../components/project/InviteModal";

const Project = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    // States
    const [project, setProject] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [isUnsaved, setIsUnsaved] = useState(false);
    const [messages, setMessages] = useState([]);

    // Modals & Panels
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    // Tabs & Collapse Sidebar States
    const [openTabs, setOpenTabs] = useState([]);
    const [isCollabSectionCollapsed, setIsCollabSectionCollapsed] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);

    // Refs
    const socketRef = useRef(null);
    const textareaRef = useRef(null); // Used for the chat input focus

    // Monaco language mapping helper
    const getLanguageFromFilename = (filename) => {
        if (!filename) return "plaintext";
        const ext = filename.split(".").pop().toLowerCase();
        switch (ext) {
            case "js":
            case "jsx":
                return "javascript";
            case "ts":
            case "tsx":
                return "typescript";
            case "css":
                return "css";
            case "html":
                return "html";
            case "json":
                return "json";
            case "md":
                return "markdown";
            case "py":
                return "python";
            default:
                return "plaintext";
        }
    };

    // File icon helper
    const getFileIcon = (filename) => {
        const ext = filename.split(".").pop().toLowerCase();
        switch (ext) {
            case "js":
            case "jsx":
                return <i className="ri-javascript-fill text-yellow-500 text-base"></i>;
            case "css":
                return <i className="ri-css3-fill text-blue-400 text-base"></i>;
            case "html":
                return <i className="ri-html5-fill text-orange-500 text-base"></i>;
            case "json":
                return <i className="ri-braces-line text-yellow-600 text-base"></i>;
            case "md":
                return <i className="ri-markdown-fill text-blue-400 text-base"></i>;
            default:
                return <i className="ri-file-code-line text-gray-400 text-base"></i>;
        }
    };

    // Copy to clipboard helper
    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: Replace alert with a toast notification in the future
        alert("Code copied to clipboard!");
    };

    // Fetch Project Details and Users
    useEffect(() => {
        // Fetch project
        axios
            .get(`/projects/get-project/${projectId}`)
            .then((res) => {
                setProject(res.data.project);
                setCollaborators(res.data.project.users || []);
                setFileTree(res.data.project.fileTree || {});
                setMessages(res.data.project.messages || []);
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to load project details");
                navigate("/");
            });

        // Initialize Sockets
        const token = localStorage.getItem("token");
        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

        socketRef.current = io(socketUrl, {
            auth: { token },
            query: { projectId },
        });

        socketRef.current.on("connect", () => {
            console.log("Connected to project room:", projectId);
        });

        socketRef.current.on("project-message", (data) => {
            setMessages((prev) => [...prev, data]);

            // Check if message is from AI and contains a fileTree
            if (data.sender?._id === "ai") {
                try {
                    const aiContent = typeof data.message === "string" ? JSON.parse(data.message) : data.message;
                    if (aiContent.fileTree) {
                        setFileTree((prevTree) => {
                            const newTree = { ...prevTree, ...aiContent.fileTree };
                            // Persist tree to backend
                            axios
                                .put("/projects/update-file-tree", {
                                    projectId,
                                    fileTree: newTree,
                                })
                                .catch((err) => console.error("Error auto-saving AI files:", err));
                            return newTree;
                        });
                    }
                } catch (e) {
                    // Non-JSON AI content
                }
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [projectId, navigate]);

    // Scroll to bottom of chat
    // Handle sending message
    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        const messageData = {
            _id: Date.now() + Math.random().toString(36).substr(2, 9),
            message: text,
            sender: user,
        };

        socketRef.current.emit("project-message", messageData);
        setMessages((prev) => [...prev, messageData]);
    };

    // Open file & add tab
    const handleOpenFile = (filename) => {
        setSelectedFile(filename);
        setEditorContent(fileTree[filename]?.file?.contents || "");
        setIsUnsaved(false);
        if (!openTabs.includes(filename)) {
            setOpenTabs((prev) => [...prev, filename]);
        }
    };

    // Close Tab
    const handleCloseTab = (filename) => {
        const remainingTabs = openTabs.filter((t) => t !== filename);
        setOpenTabs(remainingTabs);
        if (selectedFile === filename) {
            if (remainingTabs.length > 0) {
                handleOpenFile(remainingTabs[remainingTabs.length - 1]);
            } else {
                setSelectedFile(null);
                setEditorContent("");
                setIsUnsaved(false);
            }
        }
    };

    // Save active file
    const handleSaveFile = () => {
        if (!selectedFile) return;

        const updatedFileTree = {
            ...fileTree,
            [selectedFile]: {
                ...fileTree[selectedFile],
                file: {
                    contents: editorContent,
                },
            },
        };

        setFileTree(updatedFileTree);
        setIsUnsaved(false);

        axios
            .put("/projects/update-file-tree", {
                projectId,
                fileTree: updatedFileTree,
            })
            .then(() => {
                // Soft toast/alert can be added here
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to save changes to server");
            });
    };

    // Create file & add tab
    const handleCreateFile = () => {
        const name = prompt("Enter new filename (e.g. index.js):");
        if (!name) return;
        if (fileTree[name]) {
            alert("File already exists!");
            return;
        }

        const updatedTree = {
            ...fileTree,
            [name]: {
                file: {
                    contents: "",
                },
            },
        };
        setFileTree(updatedTree);
        setSelectedFile(name);
        setEditorContent("");
        setIsUnsaved(false);
        if (!openTabs.includes(name)) {
            setOpenTabs((prev) => [...prev, name]);
        }

        axios
            .put("/projects/update-file-tree", {
                projectId,
                fileTree: updatedTree,
            })
            .catch((err) => console.error(err));
    };

    // Delete file & remove tab
    const handleDeleteFile = (e, filename) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

        const updatedTree = { ...fileTree };
        delete updatedTree[filename];

        setFileTree(updatedTree);
        setOpenTabs((prev) => prev.filter((t) => t !== filename));

        if (selectedFile === filename) {
            const remainingTabs = openTabs.filter((t) => t !== filename);
            if (remainingTabs.length > 0) {
                handleOpenFile(remainingTabs[remainingTabs.length - 1]);
            } else {
                setSelectedFile(null);
                setEditorContent("");
                setIsUnsaved(false);
            }
        }

        axios
            .put("/projects/update-file-tree", {
                projectId,
                fileTree: updatedTree,
            })
            .catch((err) => console.error(err));
    };

    // Invite collaborator
    const handleOpenInviteModal = () => {
        setIsInviteModalOpen(true);
        axios
            .get("/users/all")
            .then((res) => {
                setAllUsers(res.data.users || []);
            })
            .catch((err) => console.error(err));
    };

    const handleAddCollaborator = (targetUserId) => {
        axios
            .put("/projects/add-user", {
                projectId,
                users: [targetUserId],
            })
            .then((res) => {
                setCollaborators(res.data.project.users || []);
                alert("Member added to project!");
            })
            .catch((err) => {
                console.error(err);
                alert(err.response?.data?.error || "Failed to add member");
            });
    };

    return (
        <main className="h-screen w-screen bg-obsidian-950 text-obsidian-100 flex flex-col overflow-hidden font-sans relative">
            {/* Top-center ambient indigo glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-accent-violet/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="h-14 border-b border-obsidian-850 px-4 flex justify-between items-center bg-obsidian-900 flex-shrink-0 relative z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 bg-obsidian-950 hover:bg-obsidian-800 text-obsidian-300 hover:text-white rounded-xl border border-obsidian-800 transition-all duration-200 flex items-center justify-center shadow-sm"
                        title="Back to Dashboard"
                    >
                        <i className="ri-arrow-left-line text-sm"></i>
                    </button>
                    <h1 className="text-sm font-bold tracking-tight capitalize flex items-center gap-2 text-white">
                        <i className="ri-folder-line text-accent-violet"></i> {project?.name || "loading..."}
                    </h1>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2 text-obsidian-300 bg-obsidian-950 px-3 py-1.5 rounded-xl border border-obsidian-850 shadow-inner">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        <span>{user?.email}</span>
                    </div>
                    {/* Toggle Chat Button */}
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`p-1.5 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-sans font-medium ${
                            isChatOpen
                                ? "bg-white text-obsidian-950 border-white hover:bg-obsidian-100 shadow-md"
                                : "bg-obsidian-900 text-obsidian-300 border-obsidian-800 hover:text-white"
                        }`}
                        title={isChatOpen ? "Collapse Chat & AI" : "Expand Chat & AI"}
                    >
                        <i className="ri-message-3-line text-base"></i>
                        <span>{isChatOpen ? "Hide Chat" : "Show Chat"}</span>
                    </button>
                </div>
            </header>

            {/* Editor Workspace Panels */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                <ProjectSidebar
                    user={user}
                    fileTree={fileTree}
                    selectedFile={selectedFile}
                    handleCreateFile={handleCreateFile}
                    handleOpenFile={handleOpenFile}
                    handleDeleteFile={handleDeleteFile}
                    getFileIcon={getFileIcon}
                    collaborators={collaborators}
                    isCollabSectionCollapsed={isCollabSectionCollapsed}
                    setIsCollabSectionCollapsed={setIsCollabSectionCollapsed}
                    handleOpenInviteModal={handleOpenInviteModal}
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                />

                <EditorPanel
                    openTabs={openTabs}
                    selectedFile={selectedFile}
                    handleOpenFile={handleOpenFile}
                    handleCloseTab={handleCloseTab}
                    isUnsaved={isUnsaved}
                    handleSaveFile={handleSaveFile}
                    editorContent={editorContent}
                    setEditorContent={setEditorContent}
                    setIsUnsaved={setIsUnsaved}
                    handleCreateFile={handleCreateFile}
                    handleOpenInviteModal={handleOpenInviteModal}
                    setIsChatOpen={setIsChatOpen}
                    textareaRef={textareaRef}
                    getLanguageFromFilename={getLanguageFromFilename}
                    getFileIcon={getFileIcon}
                />

                {isChatOpen && (
                    <ChatPanel
                        setIsChatOpen={setIsChatOpen}
                        messages={messages}
                        handleSendMessage={handleSendMessage}
                        inputRef={textareaRef}
                        user={user}
                        getFileIcon={getFileIcon}
                        handleCopyToClipboard={handleCopyToClipboard}
                    />
                )}
            </div>

            <InviteModal
                isInviteModalOpen={isInviteModalOpen}
                setIsInviteModalOpen={setIsInviteModalOpen}
                allUsers={allUsers}
                collaborators={collaborators}
                handleAddCollaborator={handleAddCollaborator}
            />
        </main>
    );
};

export default Project;
