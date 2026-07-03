"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Bell, CheckCircle2, Clock, Users, Wallet, Trophy,
  Trash2, CheckCheck, BellOff, Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type FilterId = "all" | "unread" | "payment" | "draw" | "member";

interface Notification {
  id: string;
  title: string;
  description: string;
  unread: boolean;
  created_at: string;
}

interface NotifMeta {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
}

function inferMeta(title: string): NotifMeta {
  const t = title.toLowerCase();
  if (t.includes("cotis") || t.includes("paiement") || t.includes("réuss") || t.includes("pot")) {
    return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Paiement" };
  }
  if (t.includes("rappel") || t.includes("retard") || t.includes("delai")) {
    return { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Rappel" };
  }
  if (t.includes("tirage") || t.includes("gagnant") || t.includes("draw")) {
    return { icon: Trophy, color: "text-primary", bg: "bg-primaryLight", label: "Tirage" };
  }
  if (t.includes("membre") || t.includes("adhés") || t.includes("rejoint") || t.includes("exclu") || t.includes("invit")) {
    return { icon: Users, color: "text-textSecondary", bg: "bg-gray-100", label: "Membre" };
  }
  if (t.includes("démarr") || t.includes("cycle") || t.includes("cercle")) {
    return { icon: Bell, color: "text-primary", bg: "bg-primaryLight", label: "Cercle" };
  }
  if (t.includes("portefeuille") || t.includes("recharge") || t.includes("retrait") || t.includes("solde")) {
    return { icon: Wallet, color: "text-primary", bg: "bg-primaryLight", label: "Portefeuille" };
  }
  return { icon: Bell, color: "text-textSecondary", bg: "bg-gray-100", label: "Info" };
}

function isPayment(title: string) {
  const t = title.toLowerCase();
  return t.includes("cotis") || t.includes("paiement") || t.includes("réuss") || t.includes("pot") || t.includes("portefeuille") || t.includes("recharge") || t.includes("retrait");
}
function isDraw(title: string) {
  const t = title.toLowerCase();
  return t.includes("tirage") || t.includes("gagnant");
}
function isMember(title: string) {
  const t = title.toLowerCase();
  return t.includes("membre") || t.includes("adhés") || t.includes("rejoint") || t.includes("exclu") || t.includes("invit");
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all",     label: "Toutes" },
  { id: "unread",  label: "Non lues" },
  { id: "payment", label: "Paiements" },
  { id: "draw",    label: "Tirages" },
  { id: "member",  label: "Membres" },
];

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
}

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("all");
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, title, description, unread, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data as Notification[]);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("notif_page_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, fetchNotifications)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, supabase]);

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ unread: false }).eq("user_id", user.id);
  };

  const markOneRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    await supabase.from("notifications").update({ unread: false }).eq("id", id);
  };

  const deleteOne = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const deleteAll = async () => {
    setIsDeletingAll(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsDeletingAll(false); return; }
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    setIsDeletingAll(false);
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread")  return n.unread;
    if (filter === "payment") return isPayment(n.title);
    if (filter === "draw")    return isDraw(n.title);
    if (filter === "member")  return isMember(n.title);
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight flex items-center gap-3">
            <Bell className="text-primary" size={28} />
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-primary text-white text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </h1>
          <p className="text-textSecondary text-sm mt-1">
            {notifications.length === 0
              ? "Aucune notification"
              : `${notifications.length} notification${notifications.length > 1 ? "s" : ""}${unreadCount > 0 ? ` · ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : ""}`}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-textSecondary hover:text-primary hover:border-primary transition-all"
              >
                <CheckCheck size={16} />
                Tout lire
              </button>
            )}
            <button
              onClick={deleteAll}
              disabled={isDeletingAll}
              className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 rounded-xl text-sm font-bold text-danger hover:bg-danger/20 transition-all disabled:opacity-60"
            >
              {isDeletingAll ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Tout effacer
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => {
          const cnt = f.id === "unread" ? unreadCount
            : f.id === "payment" ? notifications.filter(n => isPayment(n.title)).length
            : f.id === "draw"    ? notifications.filter(n => isDraw(n.title)).length
            : f.id === "member"  ? notifications.filter(n => isMember(n.title)).length
            : notifications.length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                filter === f.id
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-surface text-textSecondary border-border hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
              {cnt > 0 && f.id !== "all" && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-bold ${
                  filter === f.id ? "bg-white/30 text-white" : "bg-gray-100 text-textSecondary"
                }`}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="w-2/3 h-4 bg-gray-100 rounded-lg" />
                  <div className="w-full h-3 bg-gray-100 rounded-lg" />
                  <div className="w-1/4 h-3 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-border">
              <BellOff size={40} className="text-textSecondary opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-textPrimary mb-2">
              {filter === "unread" ? "Tout est lu !" : "Aucune notification"}
            </h3>
            <p className="text-textSecondary text-sm max-w-xs leading-relaxed">
              {filter === "unread"
                ? "Vous n'avez aucune notification non lue pour le moment."
                : filter === "all"
                ? "Vos notifications apparaîtront ici dès qu'une activité aura lieu dans vos cercles."
                : `Aucune notification de type "${FILTERS.find(f => f.id === filter)?.label ?? filter}" pour le moment.`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(n => {
              const meta = inferMeta(n.title);
              const Icon = meta.icon;
              const isDeleting = deletingIds.has(n.id);

              return (
                <li
                  key={n.id}
                  onClick={() => n.unread && markOneRead(n.id)}
                  className={`group relative flex items-start gap-4 p-5 transition-colors cursor-pointer ${
                    n.unread ? "bg-primaryLight/20" : "hover:bg-gray-50/50"
                  } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                >
                  {/* Unread indicator bar */}
                  {n.unread && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color} shadow-sm`}>
                    <Icon size={22} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold mb-0.5 ${n.unread ? "text-textPrimary" : "text-textSecondary"}`}>
                          {n.title}
                          {n.unread && (
                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary align-middle" />
                          )}
                        </p>
                        <p className="text-xs text-textSecondary leading-relaxed line-clamp-2">
                          {n.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} border-current/20`}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-textSecondary">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-danger/10 text-textSecondary hover:text-danger shrink-0"
                        title="Supprimer cette notification"
                      >
                        {isDeleting
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
