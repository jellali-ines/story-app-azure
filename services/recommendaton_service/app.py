from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from recommendation_system import StoryRecommendationSystem
from db import stories_collection, users_collection, histories_collection
from routes.story_routes import story_bp
from routes.user_routes import user_bp
from routes.history_routes import history_bp

app = Flask(__name__)
CORS(app)

# 🔹 Enregistrement des routes classiques
app.register_blueprint(story_bp, url_prefix="/api/stories")
app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(history_bp, url_prefix="/api/histories")


@app.route("/")
def home():
    return jsonify({"message": "Flask API pour StoryApp fonctionne !"})

# ======================================================
# 🧠 Initialisation du système de recommandation
# ======================================================

def load_data_from_mongo():
    """Charge les collections MongoDB en DataFrames pandas"""
    stories = pd.DataFrame(list(stories_collection.find()))
    users = pd.DataFrame(list(users_collection.find()))
    history = pd.DataFrame(list(histories_collection.find()))
    return stories, users, history

try:
    stories, users, history = load_data_from_mongo()
    rec_system = StoryRecommendationSystem(stories, users, history)
    print("✅ Système de recommandation initialisé avec succès.")
except Exception as e:
    print("❌ Erreur d’initialisation du système :", e)
    rec_system = None

# ======================================================
# 🎯 Routes pour les recommandations
# ======================================================

@app.route("/api/recommend/<user_id>", methods=["GET"])
def recommend(user_id):
    """Recommande des stories personnalisées pour un utilisateur donné"""
    if rec_system is None:
        return jsonify({"error": "Le système de recommandation n'est pas initialisé."}), 500
    try:
        n = int(request.args.get("n", 10))
        exclude_read = request.args.get("exclude_read", "true").lower() == "true"
        recs = rec_system.recommend_stories(user_id, n_recommendations=n, exclude_read=exclude_read)
        return jsonify(recs.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/similar/<story_id>", methods=["GET"])
def similar_stories(story_id):
    try:
        n = int(request.args.get("n", 10))
        recs = rec_system.recommend_similar_stories(story_id, n_recommendations=n)
        return jsonify(recs.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# 🚀 Démarrage du serveur Flask
# ======================================================

if __name__ == "__main__":
    app.run(debug=True, port=5001)
