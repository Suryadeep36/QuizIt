import { create } from "zustand";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAccessToken } from "./store";

export const useWS = create((set) => ({
  client: null,
  isConnected: false,
  connect: () => {
    const token = getAccessToken();

    const socket = new SockJS(
      `${import.meta.env.VITE_API_BASE_URL}/quiz-websocket` ||
        "http://localhost:3000/quiz-websocket",
    );
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WS Connected");
        set({ isConnected: true });
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onDisconnect: () => {
        console.log("WS Disconnected");
        set({ isConnected: false });
      },
    });

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) client.deactivate();
    set({ client: null, isConnected: false });
  },

  reconnectWithFreshToken: () => {
    get().disconnect();
    setTimeout(() => get().connect(), 200);
  },
}));
