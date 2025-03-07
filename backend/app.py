import os
import speech_recognition as sr
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
client = OpenAI(api_key="your_openai_api_key")  # Replace with your OpenAI key

questions = ["Should AI be allowed in schools? Why or why not?"]

def generate_followup_question(response_text):
    prompt = f"Analyze this response and generate a follow-up question: {response_text}"
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an AI debate instructor."},
            {"role": "user", "content": prompt}
        ]
    )
    return completion.choices[0].message['content']

@app.route('/ask', methods=['GET'])
def ask_question():
    return jsonify({"question": questions[-1]})

@app.route('/respond', methods=['POST'])
def receive_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file uploaded."}), 400
    
    audio_file = request.files['audio']
    audio_path = "temp_audio.wav"
    audio_file.save(audio_path)
    
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio_data = recognizer.record(source)
    
    try:
        response_text = recognizer.recognize_google(audio_data)
    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand the audio."}), 400
    except sr.RequestError:
        return jsonify({"error": "Speech recognition service unavailable."}), 500
    
    os.remove(audio_path)
    next_question = generate_followup_question(response_text)
    questions.append(next_question)
    return jsonify({"transcribed_response": response_text, "next_question": next_question})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)