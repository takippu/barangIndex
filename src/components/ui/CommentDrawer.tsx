"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost, timeAgo } from "@/src/lib/api-client";

type Comment = {
    id: number;
    message: string;
    createdAt: string;
    userName: string | null;
};

type CommentDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    reportId: number | null;
    onCommentSuccess?: () => void;
};

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
    isOpen,
    onClose,
    reportId,
    onCommentSuccess,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [commentDraft, setCommentDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && reportId) {
            void loadComments();
        } else {
            setComments([]);
            setCommentDraft("");
            setError(null);
        }
    }, [isOpen, reportId]);

    const loadComments = async () => {
        if (!reportId) return;
        setLoading(true);
        try {
            // Fetching the full report to get comments. 
            // Optimization: In a real app, we might have a dedicated /comments endpoint or include them in the feed if small.
            // For now, re-using report details endpoint is safest.
            const data = await apiGet<{ comments: Comment[] }>(`/api/v1/price-reports/${reportId}`);
            setComments(data.comments || []);
        } catch (err) {
            console.error("Failed to load comments", err);
            // Don't show error to user immediately, just empty list or maybe a toast
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (!reportId || !commentDraft.trim()) return;

        setSubmitting(true);
        try {
            await apiPost(`/api/v1/price-reports/${reportId}/comments`, {
                message: commentDraft.trim(),
            });
            setCommentDraft("");
            await loadComments(); // Reload comments to show the new one
            onCommentSuccess?.();
        } catch (err) {
            setError("Failed to post comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Prevent scrolling on body when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-slate-50 z-50 rounded-t-3xl shadow-2xl transition-transform duration-300 transform flex flex-col max-h-[85vh] ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                {/* Handle bar */}
                <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-5 pb-3 border-b border-slate-200/60 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Comments</h3>
                    <button onClick={onClose} className="p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <span className="material-symbols-outlined animate-spin text-primary-500">progress_activity</span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p className="text-sm">No comments yet.</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-700 text-xs">{comment.userName || "Community User"}</span>
                                    <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-slate-800">{comment.message}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white pb-safe bottom-nav-safe">
                    {error && <p className="text-xs text-rose-500 mb-2">{error}</p>}
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            placeholder="Add a comment..."
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    void handlePostComment();
                                }
                            }}
                        />
                        <button
                            disabled={submitting || !commentDraft.trim()}
                            onClick={() => void handlePostComment()}
                            className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-emerald-700 transition-colors shadow-md"
                        >
                            {submitting ? (
                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">send</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
