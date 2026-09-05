import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore.js";
import { toast } from "../stores/toastStore.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function useNotificationSocket() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return undefined;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("connect", () => socket.emit("identify", user.id));
    socket.on("notification:new", (notification) => {
      toast(notification.message, "default");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => socket.disconnect();
  }, [user?.id, queryClient]);
}
