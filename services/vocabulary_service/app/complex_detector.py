# complex_detector.py

import re
import pandas as pd
import torch
from wordfreq import word_frequency
from transformers import AutoTokenizer, AutoModelForMaskedLM
import spacy
from spacy.lang.en.stop_words import STOP_WORDS

# Charger spaCy
nlp = spacy.load("en_core_web_sm")

# Modèle léger DistilBERT (CPU OK)
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForMaskedLM.from_pretrained("distilbert-base-uncased")
model.eval()

COMMON_EASY_WORDS = set([
    "the", "a", "an", "and", "he", "she", "it", "they", "we", "i", "you",
    "is", "are", "was", "were", "to", "in", "on", "of", "for", "with",
    "at", "from", "as", "by", "that", "this", "these", "those"
])

def is_rare(word, threshold=1e-5):
    freq = word_frequency(word.lower(), "en")
    return freq < threshold


def lm_complexity(word, sentence):
    masked = sentence.replace(word, tokenizer.mask_token)
    inputs = tokenizer(masked, return_tensors="pt")

    with torch.no_grad():
        logits = model(**inputs).logits

    mask_index = (inputs["input_ids"][0] == tokenizer.mask_token_id).nonzero(as_tuple=True)[0]

    probs = torch.softmax(logits[0, mask_index], dim=-1)
    token_id = tokenizer.encode(word, add_special_tokens=False)

    if len(token_id) != 1:
        return 0

    return 1 - probs[0, token_id[0]].item()


def is_complex_word(word, freq_complex, lm_score):
    if re.match(r"^[A-Z][a-z]+$", word):
        return False

    word_lower = word.lower()

    if word_lower in STOP_WORDS or word_lower in COMMON_EASY_WORDS:
        return False

    if len(word_lower) >= 8:
        return True

    if freq_complex:
        return True

    if lm_score > 0.97:
        return True

    return False


def detect_complex_words(text):
    doc = nlp(text)
    complex_words = []

    for token in doc:
        if not token.is_alpha:
            continue

        word = token.text
        sentence = token.sent.text

        freq_complex = is_rare(word)
        lm_score = lm_complexity(word, sentence)

        if is_complex_word(word, freq_complex, lm_score):
            complex_words.append(word)

    return complex_words
