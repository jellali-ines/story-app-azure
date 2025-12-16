# word_info.py

import emoji
import spacy
from nltk.corpus import wordnet as wn
from .complex_detector import is_rare, lm_complexity, is_complex_word
from .tts import word_to_speech_base64


nlp = spacy.load("en_core_web_sm")


def get_word_type(word):
    doc = nlp(word)
    pos = doc[0].pos_
    return pos


def get_definition(word):
    synsets = wn.synsets(word)
    if not synsets:
        return None
    return synsets[0].definition()


def get_emoji(word):
    em = emoji.emojize(f":{word}:", language="en")
    return em if em != f":{word}:" else None


def get_complexity(word):
    dummy_sentence = f"This is {word} in a sentence."
    freq_complex = is_rare(word)
    lm_score = lm_complexity(word, dummy_sentence)
    return is_complex_word(word, freq_complex, lm_score)

def get_audio_base64(word):
    return word_to_speech_base64(word)

def get_word_info(word):
    return {
        "word": word,
        "type": get_word_type(word),
        "definition": get_definition(word),
        "emoji": get_emoji(word),
        "is_complex": get_complexity(word),
        "audio": get_audio_base64(word)
    }
