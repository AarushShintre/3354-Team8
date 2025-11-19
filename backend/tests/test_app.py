from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend import app as flask_app
from backend.app import (
    ISSUES,
    RATINGS,
    USERS,
    UserProfile,
    compatibility_score,
    payment_suggestion,
)


@pytest.fixture(autouse=True)
def reset_state():
    USERS.clear()
    RATINGS.clear()
    ISSUES.clear()
    yield


@pytest.fixture
def client():
    with flask_app.test_client() as client:
        yield client


def test_create_and_fetch_user(client):
    response = client.post(
        "/api/users",
        json={
            "name": "Jordan",
            "location": "Campus Village",
            "typicalDrivingTimes": "7am-9am",
        },
    )
    assert response.status_code == 201
    user_id = response.get_json()["id"]

    fetch_response = client.get(f"/api/users/{user_id}")
    payload = fetch_response.get_json()
    assert fetch_response.status_code == 200
    assert payload["name"] == "Jordan"
    assert payload["location"] == "Campus Village"
    assert payload["typicalDrivingTimes"] == "7am-9am"


def test_update_user_profile(client):
    created = client.post("/api/users", json={"name": "Alex"}).get_json()
    user_id = created["id"]

    update_response = client.put(
        f"/api/users/{user_id}",
        json={"bio": "Night commuter", "extracurriculars": "Robotics"},
    )
    assert update_response.status_code == 200
    updated = update_response.get_json()
    assert updated["bio"] == "Night commuter"
    assert updated["extracurriculars"] == "Robotics"


def test_recommendations_with_scoring(client):
    first = client.post(
        "/api/users",
        json={
            "name": "Primary",
            "location": "North",
            "typicalDrivingTimes": "Morning",
            "major": "Chemistry",
            "extracurriculars": "Band",
        },
    ).get_json()
    second = client.post(
        "/api/users",
        json={
            "name": "Match",
            "location": "North",
            "typicalDrivingTimes": "Morning",
            "major": "Chemistry",
            "extracurriculars": "Band",
        },
    ).get_json()
    third = client.post(
        "/api/users",
        json={
            "name": "Different",
            "location": "South",
            "typicalDrivingTimes": "Evening",
            "major": "History",
        },
    ).get_json()

    response = client.get(f"/api/recommendations?userId={first['id']}")
    assert response.status_code == 200
    data = response.get_json()
    assert data[0]["user"]["id"] == second["id"]
    assert data[0]["score"] >= data[1]["score"]


def test_payment_suggestion_endpoint(client):
    payload = {"distanceMiles": 10, "gasPrice": 3.5}
    response = client.post("/api/payments/suggestions", json=payload)
    assert response.status_code == 200
    suggested = response.get_json()["suggestedAmount"]
    assert suggested == payment_suggestion(10, 3.5)


def test_report_issue_flow(client):
    response = client.post(
        "/api/issues",
        json={"message": "Schedule is incorrect", "category": "bug"},
    )
    assert response.status_code == 201
    issue_id = response.get_json()["id"]
    all_issues = client.get("/api/issues").get_json()
    assert any(issue["id"] == issue_id for issue in all_issues)


def test_compatibility_score_rewards_overlap():
    reference = UserProfile(
        id=1,
        name="Morgan",
        location="North",
        typical_driving_times="AM",
        contact_info="",
        parking_pass="",
        major="Biology",
        extracurriculars="Tennis",
        bio="",
    )
    candidate = UserProfile(
        id=2,
        name="Jamie",
        location="North",
        typical_driving_times="AM",
        contact_info="",
        parking_pass="",
        major="Biology",
        extracurriculars="Tennis",
        bio="",
    )
    assert compatibility_score(reference, candidate) > 0

