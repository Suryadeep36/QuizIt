import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/quiz-websocket` || 'http://localhost:3000/quiz-websocket');

const client = Stomp.over(socket);

client.reconnect_delay = 5000;

const sessionId = "217ad90b-dbf0-4275-a5df-7bdc501e764d";
const participantId = "e0ceb70f-101e-4535-b38c-dc9036c76a73";
client.connect(
  {},
  () => {
    console.log("Connected!");

    client.subscribe(`/topic/quiz/${sessionId}`, (message) => {
      const session = JSON.parse(message.body);
      console.log("Session updated:", session);
    });

    // joinParticipant(client);
    // nextQuestion(client)
    // startQuiz(client);
  },
  (error) => {
    console.error("Error connecting:", error);
  }
);


function startQuiz(client) {
  client.publish({
    destination: `/app/quiz/start/${sessionId}`,
    body: JSON.stringify({}),
  });
}

function nextQuestion(client) {
  client.publish({
    destination: `/app/quiz/next/${sessionId}`,
    body: JSON.stringify({}), 
  });
}

function endQuiz(client, sessionId) {
  client.publish({
    destination: `/app/quiz/end/${sessionId}`,
    body: JSON.stringify({}), 
  });
  console.log(`End quiz request sent: session=${sessionId}`);
}


function joinParticipant(client) {
  client.publish({
    destination: `/app/quiz/join/${sessionId}/${participantId}`,
    body: JSON.stringify({}),
  });
}
