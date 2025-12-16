from flask import Blueprint, jsonify
from db import histories_collection

history_bp = Blueprint("history_bp", __name__)

@history_bp.route("/", methods=["GET"])
def get_histories():
    histories = list(histories_collection.find())
    for h in histories:
        h["_id"] = str(h["_id"])
    return jsonify(histories)
