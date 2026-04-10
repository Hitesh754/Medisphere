import { useState, useEffect, useCallback } from "react";
import { User, Bell, Sun, Moon, FileText, Check, Download, Loader as Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  type AppNotification,
} from "@/lib/notificationStore";
import { generatePortfolioPDF } from "@/lib/generatePortfolio";
import { toast } from "sonner";

const mockUser = { name: "John" };

export default function ProfileMenu() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const reload = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener("notifications-updated", reload);
    return () => window.removeEventListener("notifications-updated", reload);
  }, [reload]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    reload();
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    reload();
  };

  const handleDownloadPortfolio = async () => {
    setGeneratingPDF(true);
    try {
      await generatePortfolioPDF();
      toast.success("Portfolio PDF opened in new tab!");
    } catch (e) {
      toast.error("Failed to generate portfolio PDF");
      console.error(e);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center hover:from-primary/20 hover:to-primary/10 transition-all duration-300 shadow-sm hover:shadow-md">
          <User size={20} className="text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden">
        
        
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <p className="text-sm font-bold text-foreground">{mockUser.name}</p>
          <p className="text-xs text-muted-foreground">Patient Profile</p>
        </div>

        
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dark ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
            <span className="text-sm font-medium text-foreground">{dark ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-10 h-6 rounded-full flex items-center transition-all duration-300 px-0.5 ${
              dark ? "bg-primary justify-end" : "bg-muted justify-start"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-card shadow-sm transition-all" />
          </button>
        </div>

        
        <div className="px-4 py-3 border-b border-border">
          <button
            onClick={handleDownloadPortfolio}
            disabled={generatingPDF}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all disabled:opacity-50"
          >
            {generatingPDF ? (
              <Loader2 size={18} className="text-primary animate-spin" />
            ) : (
              <FileText size={18} className="text-primary" />
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Patient Portfolio</p>
              <p className="text-[10px] text-muted-foreground">
                {generatingPDF ? "Generating PDF..." : "Download as PDF"}
              </p>
            </div>
            <Download size={16} className="text-muted-foreground" />
          </button>
        </div>

        
        <div className="px-4 py-2 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-1.5">
            <Bell size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-[10px] text-primary font-semibold hover:underline">
              Mark all read
            </button>
          )}
        </div>

        
        <div className="max-h-56 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell size={20} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-border/50 flex items-start gap-3 ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.timestamp)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
