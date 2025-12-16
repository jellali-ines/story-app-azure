from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from ocr import  img_to_text,extract_amounts,extract_dates,standardize_text
app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/payment', methods=['POST'])
def getInfoPayment():
    if "image" not in request.files:
        return jsonify({"error": "Aucun fichier trouvé"}), 400

    file = request.files["image"]

    # Fichier vide
    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        # Sauvegarde
        file.save(path)
        text=img_to_text(path)
        text = standardize_text(text)

        amounts = extract_amounts(text)
        dates = extract_dates(text)
        info ={"amount":amounts,"date":dates}
        # dt = datetime.strptime(date_str, "%d %b %Y %H:%M")
    return jsonify({"payment_info": info})


if __name__ == '__main__':
    app.run(debug=True)



