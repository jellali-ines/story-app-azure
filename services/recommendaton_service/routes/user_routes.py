from flask import Blueprint, jsonify
from db import users_collection

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/", methods=["GET"])
def get_users():
    users = list(users_collection.find())
    for u in users:
        u["_id"] = str(u["_id"])
    return jsonify(users)
