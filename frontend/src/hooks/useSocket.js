import { connectSocket } from "@/services/socket.service";
import { useEffect, useRef, useCallback } from "react";

const useSocket = ({ token, events = {}, autoConnect = true }) => {
  const socketRef = useRef(null);
  const eventsRef = useRef(events);

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!token || !autoConnect) return;

    try {
      // Connect socket
      socketRef.current = connectSocket(token);
      const socket = socketRef.current;

      // Register event listeners
      Object.entries(eventsRef.current).forEach(([eventName, eventHandler]) => {
        if (typeof eventHandler === 'function') {
          socket.on(eventName, eventHandler);
          console.log(`🔔 Registered listener: ${eventName}`);
        }
      });

      // Cleanup function
      return () => {
        if (socket) {
          // Remove event listeners
          Object.entries(eventsRef.current).forEach(([eventName, eventHandler]) => {
            if (typeof eventHandler === 'function') {
              socket.off(eventName, eventHandler);
              console.log(` Removed listener: ${eventName}`);
            }
          });
        }
      };
    } catch (error) {
      console.error(' Socket setup error:', error);
    }
  }, [token, autoConnect]);

  // Provide socket instance for manual operations
  const getSocket = useCallback(() => socketRef.current, []);

  return { getSocket };
};

export default useSocket;
