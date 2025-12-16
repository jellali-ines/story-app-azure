from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from app.complex_detector import detect_complex_words
from app.word_info import get_word_info

app = FastAPI()

# Autoriser ton frontend
origins = [
    "http://localhost:5173",  # adresse du frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ou ["*"] pour tout autoriser (à éviter en prod)
    allow_credentials=True,
    allow_methods=["*"],     # GET, POST, PUT, DELETE
    allow_headers=["*"],     # Autoriser tous les headers
)

class TextRequest(BaseModel):
    text: str

@app.post("/detect_complex_words")
def detect_complex(req: TextRequest):
    result = detect_complex_words(req.text)  # déjà liste de dicts
    return {"complex_words": result}

@app.get("/word_info/{word}")
def word_information(word: str):
    """
    Retourne type, définition, emoji, complexité
    pour un mot donné.
    """
    info = get_word_info(word)

    # Cast pour FastAPI / JSON
    info["is_complex"] = bool(info["is_complex"])
    return info
