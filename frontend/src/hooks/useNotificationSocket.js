import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { connectSocket } from "@/services/socket.service";
import { useNotificationStore } from "@/stores/useNotificationStore";

/**
 * useNotificationSocket
 * Mounts once inside AppLayout. Connects the Socket.io client,
 * emits 'authenticate' so the server joins the user-specific room,
 * then listens for all 'notification' events and stores them.
 */
const useNotificationSocket = () => {
  const { user, accessToken } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const initialized = useRef(false);

  useEffect(() => {
    if (!accessToken || !user?._id) return;
    // Only register listeners once per session
    if (initialized.current) return;
    initialized.current = true;

    const socket = connectSocket(accessToken);

    // Make sure the user room is joined even if backend JWT decode fails
    socket.emit("authenticate", { userId: user._id });

    const handleNotification = (data) => {
      const notif = {
        id: `${Date.now()}-${Math.random()}`,
        ...data,
        read: false,
      };

      addNotification(notif);

      // Toast per type
      if (data.type === "ticket_assigned") {
        const subject = data.data?.subject || data.data?.title || "Unknown";
        toast.info(`🎫 Ticket mới: ${subject}`, {
          description: data.message,
          duration: 6000,
          action: {
            label: "Xem ngay",
            onClick: () => (window.location.href = "/tickets"),
          },
        });
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      initialized.current = false;
    };
  }, [accessToken, user?._id]);
};

export default useNotificationSocket;
