import { useWS } from "../stores/webSocketStore";

const [client] = useWS();

export function startQuiz(sessionId) {
  client.publish({
    destination: `/app/quiz/start/${sessionId}`,
    body: "",
  });
}

export function nextQuestion(sessionId) {
  client.publish({
    destination: `/app/quiz/next/${sessionId}`,
    body: "",
  });
}

export function joinSession(sessionId, participantId) {
  client.publish({
    destination: `/app/quiz/join/${sessionId}/${participantId}`,
    body: "",
  });
}

export function endQuiz(sessionId) {
  client.publish({
    destination: `/app/quiz/end/${sessionId}`,
    body: "",
  });
}
