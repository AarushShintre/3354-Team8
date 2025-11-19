from __future__ import annotations

import itertools
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS


@dataclass
class UserProfile:
    id: int
    name: str
    bio: str = ""
    location: str = ""
    typical_driving_times: str = ""
    contact_info: str = ""
    parking_pass: str = ""
    major: str = ""
    extracurriculars: str = ""


@dataclass
class Rating:
    id: int
    from_user_id: int
    to_user_id: int
    role: str
    score: int
    comments: str = ""


@dataclass
class IssueReport:
    id: int
    user_id: int | None
    message: str
    category: str = "general"
    metadata: Dict[str, Any] = field(default_factory=dict)


app = Flask(__name__)
CORS(app)

_user_id_sequence = itertools.count(1)
_rating_id_sequence = itertools.count(1)
_issue_id_sequence = itertools.count(1)

USERS: Dict[int, UserProfile] = {}
RATINGS: List[Rating] = []
ISSUES: List[IssueReport] = []

TERMS_TEXT = (
    "By using the Campus Rideshare Companion you agree to be respectful, "
    "share accurate profile details, and follow all campus transportation policies. "
    "Payments, ride logistics, and safety checks occur between riders; the platform "
    "only facilitates coordination."
)


def _serialize_user(user: UserProfile) -> Dict[str, Any]:
    data = asdict(user)
    camel_case_map = {
        "typicalDrivingTimes": "typical_driving_times",
        "contactInfo": "contact_info",
        "parkingPass": "parking_pass",
    }
    for camel, snake in camel_case_map.items():
        data[camel] = data.pop(snake, "")
    return data


def _serialize_rating(rating: Rating) -> Dict[str, Any]:
    return asdict(rating)


def _serialize_issue(issue: IssueReport) -> Dict[str, Any]:
    return asdict(issue)


def compatibility_score(reference: UserProfile, candidate: UserProfile) -> int:
    """Basic matching heuristic for demo purposes."""
    score = 0
    if reference.location and reference.location == candidate.location:
        score += 3
    if reference.typical_driving_times and (
        reference.typical_driving_times == candidate.typical_driving_times
    ):
        score += 2
    if reference.major and reference.major == candidate.major:
        score += 2
    if reference.extracurriculars and reference.extracurriculars == candidate.extracurriculars:
        score += 1
    return score


def payment_suggestion(distance_miles: float, gas_price: float) -> float:
    """Simple estimate factoring gas consumption and a wear-and-tear buffer."""
    distance_miles = max(distance_miles, 0)
    gas_price = max(gas_price, 0)
    fuel_efficiency_mpg = 24
    base_fare = 2.5
    fuel_cost = (distance_miles / fuel_efficiency_mpg) * gas_price
    wear_buffer = distance_miles * 0.12
    suggested = round(base_fare + fuel_cost + wear_buffer, 2)
    return suggested


@app.get("/api/users")
def list_users():
    return jsonify([_serialize_user(user) for user in USERS.values()])


@app.post("/api/users")
def create_user():
    payload = request.get_json(force=True) or {}
    name = payload.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    user_id = next(_user_id_sequence)
    user = UserProfile(
        id=user_id,
        name=name,
        bio=payload.get("bio", "").strip(),
        location=payload.get("location", "").strip(),
        typical_driving_times=payload.get("typicalDrivingTimes", "").strip(),
        contact_info=payload.get("contactInfo", "").strip(),
        parking_pass=payload.get("parkingPass", "").strip(),
        major=payload.get("major", "").strip(),
        extracurriculars=payload.get("extracurriculars", "").strip(),
    )
    USERS[user_id] = user
    return jsonify(_serialize_user(user)), 201


@app.get("/api/users/<int:user_id>")
def get_user(user_id: int):
    user = USERS.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(_serialize_user(user))


@app.put("/api/users/<int:user_id>")
def update_user(user_id: int):
    user = USERS.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    payload = request.get_json(force=True) or {}
    for field_name, attr in (
        ("name", "name"),
        ("bio", "bio"),
        ("location", "location"),
        ("typicalDrivingTimes", "typical_driving_times"),
        ("contactInfo", "contact_info"),
        ("parkingPass", "parking_pass"),
        ("major", "major"),
        ("extracurriculars", "extracurriculars"),
    ):
        value = payload.get(field_name)
        if value is not None:
            setattr(user, attr, value.strip())

    return jsonify(_serialize_user(user))


@app.delete("/api/users/<int:user_id>")
def delete_user(user_id: int):
    user = USERS.pop(user_id, None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"status": "deleted", "id": user_id})


@app.get("/api/users/<int:user_id>/reviews")
def get_user_reviews(user_id: int):
    user_exists = user_id in USERS
    if not user_exists:
        return jsonify({"error": "User not found"}), 404
    user_reviews = [_serialize_rating(r) for r in RATINGS if r.to_user_id == user_id]
    return jsonify(user_reviews)


@app.get("/api/recommendations")
def get_recommendations():
    try:
        reference_user_id = int(request.args.get("userId", "0"))
    except ValueError:
        return jsonify({"error": "Invalid user id"}), 400

    reference_user = USERS.get(reference_user_id)
    if not reference_user:
        return jsonify({"error": "User not found"}), 404

    recommendations = []
    for candidate in USERS.values():
        if candidate.id == reference_user_id:
            continue
        score = compatibility_score(reference_user, candidate)
        recommendations.append({"user": _serialize_user(candidate), "score": score})

    recommendations.sort(key=lambda item: item["score"], reverse=True)
    limit = request.args.get("limit")
    if limit:
        try:
            limit_value = max(1, int(limit))
            recommendations = recommendations[:limit_value]
        except ValueError:
            return jsonify({"error": "Invalid limit"}), 400

    return jsonify(recommendations)


@app.post("/api/payments/suggestions")
def suggest_payment():
    payload = request.get_json(force=True) or {}
    try:
        distance = float(payload.get("distanceMiles", 0))
        gas_price = float(payload.get("gasPrice", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numeric values"}), 400

    suggestion = payment_suggestion(distance, gas_price)
    return jsonify({"suggestedAmount": suggestion})


@app.post("/api/ratings")
def submit_rating():
    payload = request.get_json(force=True) or {}
    try:
        score = int(payload.get("score", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Score must be an integer"}), 400

    for key in ("fromUserId", "toUserId"):
        if not isinstance(payload.get(key), int):
            return jsonify({"error": f"{key} must be an integer"}), 400

    if score < 1 or score > 5:
        return jsonify({"error": "Score must be between 1 and 5"}), 400

    rating = Rating(
        id=next(_rating_id_sequence),
        from_user_id=payload["fromUserId"],
        to_user_id=payload["toUserId"],
        role=(payload.get("role") or "driver").lower(),
        score=score,
        comments=payload.get("comments", "").strip(),
    )
    RATINGS.append(rating)
    return jsonify(_serialize_rating(rating)), 201


@app.get("/api/ratings")
def list_ratings():
    user_id = request.args.get("userId")
    if user_id:
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({"error": "Invalid user id"}), 400
        filtered = [_serialize_rating(r) for r in RATINGS if r.to_user_id == user_id]
        return jsonify(filtered)
    return jsonify([_serialize_rating(r) for r in RATINGS])


@app.get("/api/terms")
def get_terms():
    return jsonify({"terms": TERMS_TEXT})


@app.post("/api/issues")
def report_issue():
    payload = request.get_json(force=True) or {}
    message = payload.get("message", "").strip()
    if not message:
        return jsonify({"error": "Message is required"}), 400

    issue = IssueReport(
        id=next(_issue_id_sequence),
        user_id=payload.get("userId"),
        message=message,
        category=payload.get("category", "general"),
        metadata=payload.get("metadata", {}),
    )
    ISSUES.append(issue)
    return jsonify(_serialize_issue(issue)), 201


@app.get("/api/issues")
def list_issues():
    return jsonify([_serialize_issue(issue) for issue in ISSUES])


if __name__ == "__main__":
    app.run(debug=True)

