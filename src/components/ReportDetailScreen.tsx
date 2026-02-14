"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { apiGet, apiPost, apiDelete, formatCurrency, timeAgo } from "@/src/lib/api-client";
import { getItemIcon } from "@/src/lib/item-icons";
import { ReportDetailScreenSkeleton } from "@/src/components/ui/Skeleton";

type ReportDetail = {
  id: number;
  itemId: number;
  itemName: string;
  itemCategory: string;
  defaultUnit: string;
  currency: string;
  marketId: number;
  marketName: string;
  regionId: number;
  regionName: string;
  country: string;
  price: string;
  status: "pending" | "verified" | "rejected";
  helpfulCount: number;
  hasHelpfulVote: boolean;
  comments: Array<{
    id: number;
    message: string;
    createdAt: string;
    userName: string | null;
  }>;
  actions: {
    canThumbsUp: boolean;
    canVerify: boolean;
    canComment: boolean;
  };
  reportedAt: string;
  createdAt: string;
};

export const ReportDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ reportId: string }>();

  const [data, setData] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reportId = Number.parseInt(params.reportId ?? "", 10);
    if (!Number.isFinite(reportId)) {
      setError("Invalid report id");
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiGet<ReportDetail>(`/api/v1/price-reports/${reportId}`);
        if (!mounted) return;
        setData(result);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [params.reportId]);

  const reload = async () => {
    const reportId = Number.parseInt(params.reportId ?? "", 10);
    if (!Number.isFinite(reportId)) return;
    const result = await apiGet<ReportDetail>(`/api/v1/price-reports/${reportId}`);
    setData(result);
  };

  const handleThumbsUp = async () => {
    if (!data) return;
    try {
      setActionLoading(true);
      if (data.hasHelpfulVote) {
        await apiDelete(`/api/v1/price-reports/${data.id}/vote`);
      } else {
        await apiPost(`/api/v1/price-reports/${data.id}/vote`, {});
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vote");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!data) return;
    try {
      setActionLoading(true);
      await apiPost(`/api/v1/price-reports/${data.id}/verify`, {});
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComment = async () => {
    if (!data) return;
    const message = commentDraft.trim();
    if (!message) return;
    try {
      setActionLoading(true);
      await apiPost(`/api/v1/price-reports/${data.id}/comments`, { message });
      setCommentDraft("");
      setShowCommentInput(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to comment");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen pb-24 antialiased">
      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-8 relative bottom-nav-safe">
        <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 py-3 pb-4 border-b border-slate-200/50 flex items-center justify-between">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-soft hover:bg-slate-50 transition-colors text-slate-600" onClick={() => router.back()}>
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="flex-1 px-4 text-center">
            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Report Detail</h1>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">Community Submission</h2>
          </div>
          <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
            #{data?.id ?? "..."}
          </span>
        </header>

        {loading && <ReportDetailScreenSkeleton />}
        {error && <div className="mx-4 my-6 p-4 text-sm text-rose-500 bg-rose-50 rounded-xl border border-rose-100 text-center">{error}</div>}

        {data ? (
          <main className="px-4 py-6 space-y-5">
            <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-3xl">
                    {getItemIcon(data.itemName, data.itemCategory)}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-slate-900 leading-tight">{data.itemName}</p>
                    <p className="text-xs text-slate-500 font-medium">{data.itemCategory} • {data.defaultUnit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(data.price, data.currency)}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">per {data.defaultUnit}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs relative z-10 pt-2 border-t border-slate-50">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Reported {timeAgo(data.reportedAt)}
                </span>
                <span className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 border ${data.status === "verified" ? "text-primary-700 bg-primary-50 border-primary-100" :
                  data.status === "pending" ? "text-amber-700 bg-amber-50 border-amber-100" :
                    "text-rose-700 bg-rose-50 border-rose-100"
                  }`}>
                  {data.status === "verified" && <span className="material-symbols-outlined text-[14px]">verified</span>}
                  {data.status.toUpperCase()}
                </span>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Location</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-300">storefront</span>
                  <div>
                    <p className="font-bold text-slate-900">{data.marketName}</p>
                    <p className="text-xs text-slate-500">Market</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-300">location_on</span>
                  <div>
                    <p className="font-bold text-slate-900">{data.regionName}, {data.country}</p>
                    <p className="text-xs text-slate-500">Region</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Community Action</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleThumbsUp()}
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 border ${data.hasHelpfulVote
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      title={data.hasHelpfulVote ? "Remove Thumbs Up" : "Thumbs Up"}
                    >
                      <span className={`material-symbols-outlined text-[22px] ${data.hasHelpfulVote ? "fill-1" : ""}`}>thumb_up</span>
                      {data.helpfulCount > 0 && (
                        <span className={`absolute -top-2 -right-2 min-w-[20px] h-[20px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 shadow-sm ${data.hasHelpfulVote ? "bg-white text-emerald-600 border border-emerald-100" : "bg-slate-700 text-white border border-white"
                          }`}>
                          {data.helpfulCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={!data.actions.canComment || actionLoading}
                      onClick={() => setShowCommentInput((current) => !current)}
                      className="relative w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center disabled:opacity-50 hover:bg-slate-200 transition-colors active:scale-95"
                      title="Comment"
                    >
                      <span className="material-symbols-outlined">comment</span>
                      {(data.comments ?? []).length > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] rounded-full bg-slate-600 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-white">
                          {data.comments.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!data.actions.canVerify || actionLoading}
                    onClick={() => void handleVerify()}
                    className="h-12 px-6 rounded-xl bg-slate-900 text-white flex items-center gap-2 justify-center disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-lg active:scale-95 flex-1"
                    title="Verify"
                  >
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span className="text-sm font-bold">Verify Report</span>
                  </button>
                </div>

                {showCommentInput ? (
                  <div className="space-y-3 pt-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none bg-white font-medium text-slate-700"
                      placeholder="Add a helpful comment..."
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCommentInput(false)}
                        className="px-4 py-2 rounded-lg text-slate-500 text-sm font-bold hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleComment()}
                        disabled={actionLoading || !commentDraft.trim()}
                        className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-bold disabled:opacity-50 shadow-sm hover:bg-primary-700 transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Comments ({data.comments.length})</h3>
              {(data.comments ?? []).length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-500">No comments yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{(comment.userName ?? "Community User")}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Link href={`/price-index?itemId=${data.itemId}`} className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-between px-6 hover:bg-slate-800 transition-all active:scale-[0.99] group mt-2">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-0.5 group-hover:text-primary-300">Price history</span>
                <span className="text-lg font-bold">View Item Index</span>
              </div>
              <span className="material-symbols-outlined text-primary-400 group-hover:translate-x-1 transition-transform group-hover:text-primary-300">arrow_forward</span>
            </Link>
          </main>
        ) : null}
      </div>
    </div>
  );
};
