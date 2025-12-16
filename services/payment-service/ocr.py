import pytesseract
import cv2
import re

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# -----------------------------
# 1️⃣ Extraction texte OCR
# -----------------------------
def img_to_text(img_path):
    image = cv2.imread(img_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Optionnel : amélioration du contraste
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    text = pytesseract.image_to_string(gray, lang="fra")
    return text

# -----------------------------
# 2️⃣ Nettoyage et standardisation
# -----------------------------
def standardize_text(text):
    print("text non standariséeeeeeeeeeeeeeeeeeeeeeeeeeee ",text)
    # Retirer symboles inutiles
    text = re.sub(r'[\*\#_~©®«»]+', ' ', text)
    # Remplacer plusieurs espaces par un seul
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r',', '.', text)
    # Normaliser mois FR → EN majuscule
    mois_mapping = {
        'janv\.?': 'JAN', 'févr\.?': 'FEB', 'mars': 'MAR', 'avril': 'APR',
        'mai': 'MAY', 'juin': 'JUN', 'juil\.?': 'JUL', 'août': 'AUG',
        'sept\.?': 'SEP', 'oct\.?': 'OCT', 'nov\.?': 'NOV', 'déc\.?': 'DEC'
    }
    for k, v in mois_mapping.items():
        text = re.sub(k, v, text, flags=re.IGNORECASE)
    # Ajouter espace avant TND, EUR, etc.
    text = re.sub(r'(\d)(TND|EUR|USD|DT)', r'\1 \2', text, flags=re.IGNORECASE)
    # Standardiser les séparateurs de milliers
    #text = re.sub(r'(\d)[\.,](\d{3})', r'\1 \2', text)
    print(text)
    return text.strip()

# -----------------------------
# 3️⃣ Extraction des montants
# -----------------------------
def extract_amounts(text):
    # Montants : 100.000 TND, 80.000 TND, 2700.0000 TND
    pattern = r'\b\d{1,4}\.\d+\b'
    return re.findall(pattern, text, flags=re.IGNORECASE)


# -----------------------------
# 4️⃣ Extraction des dates
# -----------------------------
def extract_dates(text):
    # Dates possibles : 17 JUL 2025 11:39:10, 12/12/2025 14:30, 12-12-2025 14:30
    pattern = r'\b\d{1,2}[ /.-](?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{1,2})[ /.-]\d{4}(?: \d{1,2}:\d{2}(?::\d{2})?)?\b'
    return re.findall(pattern, text, flags=re.IGNORECASE)

# -----------------------------
# 5️⃣ Exemple d'utilisation
# -----------------------------

