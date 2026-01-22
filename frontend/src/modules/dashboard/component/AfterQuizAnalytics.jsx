import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { useParticipant } from "../../../stores/store";

export default function AfterQuizAnalytics() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const participantId = useParticipant((state) => state.participant?.id);

  useEffect(() => {
    if (!quizId) return;

    // Wait until participantId is available in store
    if (!participantId) return;

    navigate(`/quizAnalytics/${quizId}/participant/${participantId}`, { replace: true });
  }, [quizId, participantId, navigate]);

  return (
    <div className="min-h-screen bg-[#4a9cb0] flex flex-col items-center justify-center text-white p-6">
      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#f5a65b]" />
      <p className="font-bold tracking-widest uppercase text-xs text-center">
        Redirecting to Analytics...
      </p>
    </div>
  );
}
