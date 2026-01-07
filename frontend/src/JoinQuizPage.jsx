import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { createParticipant } from "./services/AuthService";
import toast from "react-hot-toast";
import useAuth, { useParticipant } from "./auth/store";
export default function JoinQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkLogin = useAuth((state)=>state.checkLogin);
  const participantCreation = useParticipant((state)=>state.participantCreation);
  const isParticipant= useParticipant((state)=>state.isParticipant);
  const participant = useParticipant((state)=>state.participant);
  const user = useAuth((state)=>state.user);
  const handleJoin = async () => {
    if (!name.trim()) return;

    let userId = null;
    

    if(checkLogin())
    {
        userId  = user.id;
    }
  
    if(isParticipant())
    {
       setJoined(true);
       navigate(`/quiz/${quizId}/quizroom`);
       return;
    }
    setLoading(true);
    try {
       const data= await participantCreation({participantName:name,quizId:quizId,status:"ACTIVE",userId:userId});
      //  console.log(participant); 
        navigate(`/quiz/${quizId}/quizroom`);
    } catch (err) {
      toast.error(  err.response?.data?.message || err.message || "Participant not crated!")
      console.error(err);
    } finally {
      setJoined(true);
      setLoading(false);
    }

  
  };

//   useEffect(() => {
//     socket.on("quiz-started", () => {
//       navigate(`/play/${quizId}`);
//     });

//     return () => {
//       socket.off("quiz-started");
//     };
//   }, [quizId]);

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
          <p className="text-gray-500 mt-2">
            Don’t refresh this page
          </p>
        </div>
      )}
    </div>
  );
}
