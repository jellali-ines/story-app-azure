from pymongo import MongoClient

# 🔹 Adapter à ton environnement local
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "storyApp"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
stories_collection = db["Story"]
users_collection = db["User"]
histories_collection = db["History"]
