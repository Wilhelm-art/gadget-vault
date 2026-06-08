"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Calendar, ShoppingBag, Coins, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NotificationsClientProps {
  initialNotifications: any[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkRead = async (id: string, referenceId: string | null, type: string) => {
    try {
      // Mark as read in DB
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }

    // Redirect user to the corresponding transaction page
    if (referenceId) {
      if (type === "kyc") {
        router.push("/kyc");
      } else if (type === "rental" || type === "deposit") {
        router.push(`/transaksi/${referenceId}?type=sewa`);
      } else if (type === "purchase") {
        router.push(`/transaksi/${referenceId}?type=beli`);
      } else if (type === "sell") {
        router.push(`/transaksi/${referenceId}?type=jual`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Semua notifikasi ditandai dibaca.");
        router.refresh();
      } else {
        toast.error("Gagal memperbarui notifikasi.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "rental":
        return <Calendar className="w-5 h-5 text-accent-gold" />;
      case "purchase":
        return <ShoppingBag className="w-5 h-5 text-accent-gold" />;
      case "sell":
        return <Coins className="w-5 h-5 text-accent-gold" />;
      case "deposit":
        return <Coins className="w-5 h-5 text-accent-gold" />;
      default:
        return <Bell className="w-5 h-5 text-accent-gold" />;
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Mark All Read Button */}
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            onClick={handleMarkAllRead}
            variant="ghost"
            className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover hover:bg-accent-gold-light/40 border border-accent-gold/10 px-3.5 py-1.5 rounded-lg"
          >
            <Check className="w-4 h-4 mr-1" />
            Tandai Semua Dibaca
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-2xl p-6">
            <Bell className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-text-primary mb-1">Belum Ada Notifikasi</h3>
            <p className="text-xs text-text-secondary">
              Anda tidak memiliki pemberitahuan atau pesan baru saat ini.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id, n.referenceId, n.type)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 text-left relative ${
                n.isRead
                  ? "bg-white border-border hover:border-text-secondary"
                  : "bg-accent-gold-light/20 border-accent-gold/20 hover:border-accent-gold/40 shadow-sm"
              }`}
            >
              {/* Unread indicator dot */}
              {!n.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent-gold-hover" />
              )}

              <div className="p-2.5 bg-white border border-border rounded-xl shrink-0 h-fit">
                {getNotifIcon(n.type)}
              </div>

              <div className="min-w-0 pr-4">
                <h4 className={`text-xs font-bold text-text-primary ${!n.isRead ? "font-extrabold" : ""}`}>
                  {n.title}
                </h4>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[9px] text-text-muted block mt-2">
                  {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                  {" · "}
                  {new Date(n.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
