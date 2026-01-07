import { create } from "zustand";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const useWS = create((set) => ({
  client: null,

  connect: () => {
    const socket = new SockJS("http://localhost:3000/quiz-websocket");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000
    });
    client.activate();
    set({ client });
  }
}));