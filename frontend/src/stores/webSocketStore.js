import { create } from "zustand";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const useWS = create((set) => ({
  client: null,
  isConnected: false,

  connect: () => {
    const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/quiz-websocket`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WS Connected");
        set({ isConnected: true });
      },
      onDisconnect: () => {
        console.log("WS Disconnected");
        set({ isConnected: false });
      },
    });

    client.activate();
    set({ client });
  }
}));
