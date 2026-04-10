export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NOTIF_KEY = "clearscript_notifications";

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addNotification(message: string) {
  const notifs = getNotifications();
  notifs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  });
  // Keep last 50
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs.slice(0, 50)));
  window.dispatchEvent(new Event("notifications-updated"));
}

export function markNotificationRead(id: string) {
  const notifs = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event("notifications-updated"));
}

export function markAllNotificationsRead() {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event("notifications-updated"));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}