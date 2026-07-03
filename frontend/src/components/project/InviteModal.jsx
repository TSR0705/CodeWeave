import React, { useState } from "react";

const InviteModal = ({ isInviteModalOpen, setIsInviteModalOpen, allUsers, collaborators, handleAddCollaborator }) => {
    const [searchQuery, setSearchQuery] = useState("");

    if (!isInviteModalOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 transition-opacity">
            <div className="bg-obsidian-950 border border-obsidian-800 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white tracking-tight">Add Collaborator</h2>
                    <button
                        onClick={() => {
                            setIsInviteModalOpen(false);
                            setSearchQuery("");
                        }}
                        className="p-1.5 text-obsidian-400 hover:text-white rounded-lg hover:bg-obsidian-900 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-obsidian-300 uppercase tracking-widest mb-2">
                        Search Users
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-obsidian-500 pointer-events-none">
                            <i className="ri-search-line"></i>
                        </span>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-obsidian-900 border border-obsidian-800 focus:border-accent-violet focus:ring-0 rounded-xl text-sm text-white placeholder-obsidian-500 focus:outline-none transition-all"
                            placeholder="Enter email address..."
                        />
                    </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 mb-2 scroll-container">
                    {allUsers
                        .filter((u) => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((u) => {
                            const isAlreadyMember = collaborators.some((collab) => collab._id === u._id);
                            return (
                                <div
                                    key={u._id}
                                    className="flex justify-between items-center p-3 bg-obsidian-900/50 rounded-xl border border-obsidian-850 hover:border-obsidian-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3 truncate mr-3">
                                        <div className="w-8 h-8 rounded-lg bg-obsidian-950 border border-obsidian-800 flex items-center justify-center font-bold text-xs text-obsidian-300 uppercase shadow-sm">
                                            {u.email.slice(0, 2)}
                                        </div>
                                        <span className="text-sm text-obsidian-200 truncate" title={u.email}>
                                            {u.email}
                                        </span>
                                    </div>
                                    {isAlreadyMember ? (
                                        <span className="text-[10px] text-obsidian-500 bg-obsidian-900 border border-obsidian-850 px-2.5 py-1 rounded-md uppercase tracking-wider font-bold">
                                            Member
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleAddCollaborator(u._id)}
                                            className="bg-white hover:bg-obsidian-200 text-obsidian-950 text-xs font-bold px-4 py-1.5 rounded-lg transition-transform active:scale-95 shadow-sm"
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    {allUsers.filter((u) => u.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center py-6 text-sm text-obsidian-500">
                            No users found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
