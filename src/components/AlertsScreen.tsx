"use client";

import { AppBottomNav } from "@/src/components/AppBottomNav";
import { DesktopHeader } from "@/src/components/DesktopHeader";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet, apiPatch } from "@/src/lib/api-client";

interface AlertsScreenProps {
  readonly className?: string;
}

type NotificationType =
  | "report_verified"
  | "report_commented"
  | "report_upvoted"
  | "new_follower_report"
  | "badge_earned"
  | "reputation_milestone";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPayload {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    limit: number;
    offset: number;
  };
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case "report_verified":
      return "verified";
    case "report_commented":
      return "chat";
    case "report_upvoted":
      return "thumb_up";
    case "badge_earned":
      return "military_tech";
    case "reputation_milestone":
      return "trending_up";
    case "new_follower_report":
      return "person_add";
    default:
      return "notifications";
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case "report_verified":
      return "bg-emerald-50 border-emerald-100 text-emerald-600";
    case "report_commented":
      return "bg-blue-50 border-blue-100 text-blue-600";
    case "report_upvoted":
      return "bg-amber-50 border-amber-100 text-amber-600";
    case "badge_earned":
      return "bg-purple-50 border-purple-100 text-purple-600";
    case "reputation_milestone":
      return "bg-rose-50 border-rose-100 text-rose-600";
    case "new_follower_report":
      return "bg-cyan-50 border-cyan-100 text-cyan-600";
    default:
      return "bg-slate-50 border-slate-100 text-slate-600";
  }
};

const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const notificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notificationDay.getTime() === today.getTime()) {
      groups.Today.push(notification);
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  });

  return groups;
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
};

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ className = "" }) => {
  const router = useRouter();
  const [data, setData] = useState<NotificationsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState<number | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiGet<NotificationsPayload>("/api/v1/notifications?limit=50");
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    setMarkingRead(notificationId);
    try {
      await apiPatch(`/api/v1/notifications/${notificationId}`, {});
      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        };
      });
    } catch {
      // Silently fail - the notification will still appear as unread
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await apiPatch("/api/v1/notifications", {});
      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      });
    } catch {
      // Silently fail
    } finally {
      setMarkingAllRead(false);
    }
  };

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(data?.notifications ?? []);
  }, [data?.notifications]);

  const unreadCount = data?.unreadCount ?? 0;
  const hasNotifications = (data?.notifications?.length ?? 0) > 0;

  return (
    <div className={`bg-slate-50 text-slate-900 antialiased min-h-screen ${className}`} style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <DesktopHeader activeNav="/alerts" />
      
      <div className="max-w-md mx-auto lg:max-w-7xl lg:px-6 min-h-screen flex flex-col relative">
        <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100 lg:mt-6 lg:overflow-hidden lg:min-h-[600px]">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-xl px-4 py-4 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Alerts</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllAsRead()}
                disabled={markingAllRead}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-primary-50"
              >
                {markingAllRead ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>
        </header>

        {/* Notifications List */}
        <div className="flex-1 px-4 py-4">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-100 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-rose-400 mb-2">error</span>
              <p className="text-sm text-rose-600 font-medium">{error}</p>
              <button
                type="button"
                onClick={() => void loadNotifications()}
                className="mt-3 text-xs font-bold text-primary-600 hover:text-primary-700"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && !hasNotifications && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No alerts yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-[240px]">
                We&apos;ll notify you when someone interacts with your price reports or when you earn badges.
              </p>
            </div>
          )}

          {!loading && !error && hasNotifications && (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([group, notifications]) =>
                notifications.length > 0 ? (
                  <section key={group}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
                      {group}
                    </h2>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => !notification.isRead && void handleMarkAsRead(notification.id)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                            notification.isRead
                              ? "bg-white border-slate-100 opacity-70"
                              : "bg-white border-slate-200 shadow-sm"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className={`text-sm font-bold ${notification.isRead ? "text-slate-600" : "text-slate-900"}`}>
                                {notification.title}
                              </h3>
                              {markingRead === notification.id ? (
                                <span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin shrink-0" />
                              ) : !notification.isRead ? (
                                <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">{formatTime(notification.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      <AppBottomNav />
    </div>
  );
};
