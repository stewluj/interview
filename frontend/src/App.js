import { useState, useEffect } from "react";
import AudioRecorder from "./components/AudioRecorder";

const BACKEND_URL = "https://interview-2-x3za.onrender.com"; // Replace with your Render backend URL

function App() {
  const [question, setQuestion] = useState("Click 'Start' to get your question.");
  const [responseText, setResponseText] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch a new question from the backend
  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/ask`);
      if (!response.ok) throw new Error("Failed to fetch question.");
      const data = await response.json();
      setQuestion(data.question);
      setLoading(false);
    } catch (err) {
      setError("Error fetching question. Check backend.");
      setLoading(false);
    }
  };

  // Fetch initial question on page load
  useEffect(() => {
    fetchQuestion();
  }, []);

  // Function to handle audio upload and receive AI-generated follow-up question
  const handleUpload = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "response.wav");

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/respond`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send audio.");
      const data = await response.json();
      setResponseText(data.transcribed_response);
      setNextQuestion(data.next_question);
      setLoading(false);
    } catch (err) {
      setError("Error sending response. Check backend.");
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>AI Interview App</h1>

      {loading ? <p>Loading...</p> : <p><strong>Question:</strong> {question}</p>}

      <AudioRecorder onUpload={handleUpload} />

      {responseText && (
        <div>
          <h3>Your Answer:</h3>
          <p>{responseText}</p>
          <h3>Next Question:</h3>
          <p>{nextQuestion}</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={fetchQuestion} style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}>
        Get New Question
      </button>
    </div>
  );
}

export default App;
