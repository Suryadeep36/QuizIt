import { useWS } from "../stores/webSocketStore";

function getClient() {
  return useWS.getState().client;
}

export function startQuiz(sessionId) {
  const client = getClient();
  if (!client) return;
  client.publish({
    destination: `/app/quiz/start/${sessionId}`,
    body: "",
  });
}

export function nextQuestion(sessionId) {
  const client = getClient();
  if (!client) return;
  client.publish({
    destination: `/app/quiz/next/${sessionId}`,
    body: "",
  });
}

export function joinSession(sessionId, participantId) {
  const client = getClient();
  if (!client) return;
  client.publish({
    destination: `/app/quiz/join/${sessionId}/${participantId}`,
    body: "",
  });
}

export function endQuiz(sessionId) {
  const client = getClient();
  if (!client) return;
  client.publish({
    destination: `/app/quiz/end/${sessionId}`,
    body: "",
  });
}
