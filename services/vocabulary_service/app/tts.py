# tts.py

import pyttsx3
import base64
import tempfile

def word_to_speech_base64(word):
    engine = pyttsx3.init()
    engine.setProperty("rate", 150)
    engine.setProperty("volume", 1.0)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp_path = tmp.name

    engine.save_to_file(word, tmp_path)
    engine.runAndWait()

    with open(tmp_path, "rb") as f:
        audio_base64 = base64.b64encode(f.read()).decode("utf-8")

    return audio_base64
