import { useState, useEffect } from "react";
import AudioRecorder from "./components/AudioRecorder";

function App() {
  const [question, setQuestion] = useState("Click 'Start' to get your question.");
  const [responseText, setResponseText] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);

  const fetchQuestion = async () => {
    const response = await fetch("http://localhost:10000/ask");
    const data = await response.json();
    setQuestion(data.question);
  };

  useEffect(() => { fetchQuestion(); }, []);

  const handleUpload = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "response.wav");
    const response = await fetch("http://localhost:10000/respond", { method: "POST", body: formData });
    const data = await response.json();
    setResponseText(data.transcribed_response);
    setNextQuestion(data.next_question);
  };

  return (
    <div>
      <h1>Mock Interview</h1>
      <p>{question}</p>
      <AudioRecorder onUpload={handleUpload} />
      {responseText && (
        <div>
          <p><strong>Your Answer:</strong> {responseText}</p>
          <p><strong>Next Question:</strong> {nextQuestion}</p>
        </div>
      )}
    </div>
  );
}
export default App;