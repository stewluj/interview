import { useState, useRef } from "react";

export default function AudioRecorder({ onUpload }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        onUpload(audioBlob); // Send the audio file to the backend
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording} style={{ margin: "10px", padding: "10px" }}>
        🎤 Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording} style={{ margin: "10px", padding: "10px" }}>
        ⏹️ Stop Recording
      </button>

      {audioURL && (
        <div>
          <h3>Recorded Audio:</h3>
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
}
