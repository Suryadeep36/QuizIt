import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useParticipant } from "./auth/store";
import { useWS } from "./stores/webSocketStore";
import { joinSession } from "./services/stompService";

export default function QuizRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [hasJoined, setHasJoined] = useState(false);

  const participant = useParticipant((s) => s.participant);
  const { client, isConnected, connect } = useWS();

  // Debug logging
  useEffect(() => {
    console.log("QuizRoom State:", {
      isConnected,
      clientConnected: client?.connected,
      participantId: participant?.id,
      sessionId,
      hasJoined,
      fullParticipant: participant
    });
  }, [isConnected, client, participant, sessionId, hasJoined]);

  // Connect on mount
  useEffect(() => {
    console.log("Connecting WebSocket...");
    connect();
    
    return () => {
      console.log("Disconnecting WebSocket...");
    };
  }, [connect]);

  useEffect(() => {
    console.log("Join Effect - Checking conditions:", {
      isConnected,
      clientConnected: client?.connected,
      participantId: participant?.id,
      sessionId,
      hasJoined
    });

    if (!isConnected) {
      console.log("Not connected yet");
      return;
    }

    if (!client?.connected) {
      console.log("Client not connected");
      return;
    }

    if (!participant?.id) {
      console.log("No participant ID");
      return;
    }

    if (!sessionId) {
      console.log("No session ID");
      return;
    }

    if (hasJoined) {
      console.log("Already joined");
      return;
    }

    console.log("✅ All conditions met - Joining session!", {
      sessionId,
      participantId: participant.id
    });

    joinSession(sessionId, participant.id);
    setHasJoined(true);
  }, [isConnected, client?.connected, participant?.id, sessionId, hasJoined]);


  if (!participant?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-red-500">No participant data</h2>
        <p className="mt-2 text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold">Waiting for host to start…</h2>
      <p className="mt-2 text-gray-600">
        Joined as <b>{participant?.name}</b>
      </p>
      <p className="mt-4 text-sm text-gray-400">
        {isConnected ? "✓ Connected" : "⏳ Connecting..."}
      </p>
      {hasJoined && (
        <p className="mt-1 text-sm text-green-500">✓ Joined session</p>
      )}
      <p className="mt-1 text-sm text-gray-400">Please don't refresh</p>
      
      {/* Debug info - remove in production */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
        <p>Participant ID: {participant?.id}</p>
        <p>Session ID: {sessionId}</p>
        <p>Connected: {isConnected ? "Yes" : "No"}</p>
        <p>Has Joined: {hasJoined ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}