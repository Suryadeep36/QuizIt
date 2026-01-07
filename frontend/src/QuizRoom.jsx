import { useParams, Navigate, useNavigate } from "react-router";
import { useParticipant } from "./auth/store";
import { useEffect } from "react";

export default function QuizRoom() {
  const { quizId } = useParams();
  const participant = useParticipant((state) => state.participant);
  const isParticipant = useParticipant((state) => state.isParticipant);
  const navigate= useNavigate();
  // if (!isParticipant()) {
  //   navigate(`/quiz/${quizId}/join`)
  //   return
  // }
  useEffect(() => {
  if (!isParticipant()) {
    navigate(`/quiz/${quizId}/join`, { replace: true });
  }
}, [isParticipant, quizId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold">
        Waiting for host to start…
      </h2>

      <p className="mt-2 text-gray-600">
        Joined as <b>{participant.name}</b>
      </p>

      <p className="mt-4 text-sm text-gray-400">
        Please don’t refresh
      </p>
    </div>
  );
}
