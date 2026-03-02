import { createStore } from "@/stores/createStore";
import ticketService from "@/services/ticket.service";

/**
 * Notification store
 * Stores real-time notifications pushed from the backend via Socket.io.
 * Each notification: { id, type, message, data, timestamp, read }
 *
 * Key types:
 *   'ticket_assigned' — a ticket has been assigned to the current user
 */
export const useNotificationStore = createStore("notificationStore", (set, get) => ({
  notifications: [],

  // ─── Derived counts ───────────────────────────────────────────────────────
  // unread tickets that haven't been accepted or dismissed yet
  unreadTicketCount: () =>
    get().notifications.filter((n) => !n.read && n.type === "ticket_assigned").length,

  // ─── Mutations ────────────────────────────────────────────────────────────
  addNotification: (notif) => {
    // Deduplicate: if same ticketId already exists unread, skip
    const ticketId = notif.data?.ticketId || notif.data?._id;
    const duplicate = ticketId
      ? get().notifications.some(
          (n) => !n.read && (n.data?.ticketId === ticketId || n.data?._id === ticketId)
        )
      : false;

    if (!duplicate) {
      set({
        notifications: [
          { ...notif, id: notif.id ?? `${Date.now()}-${Math.random()}`, read: false },
          ...get().notifications,
        ],
      });
    }
  },

  markAsRead: (id) => {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    });
  },

  markAllRead: () => {
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
  },

  removeNotification: (id) => {
    set({ notifications: get().notifications.filter((n) => n.id !== id) });
  },

  clearAll: () => set({ notifications: [] }),

  // ─── Actions ──────────────────────────────────────────────────────────────
  /**
   * Accept a ticket assignment:
   *   • Updates ticket status to 'in_progress'
   *   • Marks the corresponding notification as read
   * Returns the updated ticket data.
   */
  acceptTicket: async (ticketId, notifId) => {
    const res = await ticketService.updateTicket(ticketId, { status: "in_progress" });
    if (notifId) get().markAsRead(notifId);
    return res.data?.data;
  },

  /**
   * Dismiss a ticket notification without accepting (ticket stays as-is).
   */
  dismissTicket: (notifId) => {
    get().markAsRead(notifId);
  },
}));
