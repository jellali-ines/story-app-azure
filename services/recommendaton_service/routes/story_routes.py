from flask import Blueprint, jsonify, request
from db import stories_collection

story_bp = Blueprint("story_bp", __name__)

@story_bp.route("/", methods=["GET"])
def get_stories():
    """Retourne toutes les stories avec pagination"""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))
    skip = (page - 1) * limit

    total = stories_collection.count_documents({})
    stories = list(stories_collection.find().skip(skip).limit(limit))

    # Conversion ObjectId -> string
    for story in stories:
        story["_id"] = str(story["_id"])

    return jsonify({
        "stories": stories,
        "total": total,
        "totalPages": (total + limit - 1) // limit,
        "currentPage": page
    })

@story_bp.route("/<story_id>", methods=["GET"])
def get_story(story_id):
    """Retourne une story spécifique"""
    story = stories_collection.find_one({"story_id": story_id})
    if not story:
        return jsonify({"error": "Story non trouvée"}), 404

    story["_id"] = str(story["_id"])
    return jsonify(story)
