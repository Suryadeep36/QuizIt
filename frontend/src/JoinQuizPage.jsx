import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { createParticipant } from "./services/AuthService";
import toast from "react-hot-toast";
import useAuth, { useParticipant } from "./auth/store";
export default function JoinQuizPage() {
  const { quizId, sessionId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkLogin = useAuth((state) => state.checkLogin);
  const participantCreation = useParticipant(
    (state) => state.participantCreation
  );
  const isParticipant = useParticipant((state) => state.isParticipant);
  const participant = useParticipant((state) => state.participant);
  const user = useAuth((state) => state.user);
  const handleJoin = async () => {
    if (!name.trim()) return;

    let userId = null;

    if (checkLogin()) {
      userId = user.id;
    }

    // Already joined? just redirect
    if (isParticipant() && participant?.quizId === quizId) {
      setJoined(true);
      console.log(sessionId);
      navigate(`/quiz/${sessionId}/quizroom`);
      return;
    }

    setLoading(true);
    try {
      const newParticipant = await participantCreation({
        participantName: name,
        quizId,
        status: "ACTIVE",
        userId,
      });

      useParticipant.getState().setParticipant(newParticipant);

      setJoined(true);
      console.log(sessionId);
      navigate(`/quiz/${sessionId}/quizroom`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Participant not created!"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {!joined ? (
        <>
          <h2 className="text-2xl mb-4">Join Quiz</h2>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-4 py-2 mb-4"
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="bg-cyan-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Joining..." : "Join Quiz"}
          </button>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl">Waiting for host to start…</h2>
          <p className="text-gray-500 mt-2">Don’t refresh this page</p>
        </div>
      )}
    </div>
  );
}
