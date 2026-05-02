"""Backend regression tests for Digital Liberia API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://liberia-tech-future.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

EXPECTED_SLUGS = [
    "digital-economy", "digital-markets", "business-sme",
    "banking-fintech", "national-digital-id", "e-government",
]


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health & basic ----------
def test_health(session):
    r = session.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "time" in data


# ---------- Services ----------
def test_list_services(session):
    r = session.get(f"{API}/services", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 6
    slugs = [s["slug"] for s in data]
    for slug in EXPECTED_SLUGS:
        assert slug in slugs
    for s in data:
        assert {"slug", "title", "tagline", "sector", "icon"}.issubset(s.keys())


@pytest.mark.parametrize("slug", EXPECTED_SLUGS)
def test_service_detail(session, slug):
    r = session.get(f"{API}/services/{slug}", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["slug"] == slug
    assert d["overview"]
    assert isinstance(d["objectives"], list) and d["objectives"]
    assert isinstance(d["programmes"], list) and d["programmes"]
    assert isinstance(d["partners"], list) and d["partners"]


def test_service_detail_404(session):
    r = session.get(f"{API}/services/invalid-slug-xyz", timeout=15)
    assert r.status_code == 404


# ---------- Initiatives ----------
def test_list_initiatives(session):
    r = session.get(f"{API}/initiatives", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 12


def test_filter_by_sector(session):
    r = session.get(f"{API}/initiatives", params={"sector": "Markets"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(i["sector"] == "Markets" for i in data)


def test_filter_by_status(session):
    r = session.get(f"{API}/initiatives", params={"status": "active"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(i["status"] == "active" for i in data)


def test_filter_by_pillar(session):
    r = session.get(f"{API}/initiatives", params={"pillar": "national-digital-id"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(i["pillar_slug"] == "national-digital-id" for i in data)


# ---------- Stats ----------
def test_stats(session):
    r = session.get(f"{API}/stats", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["counties"] == 15
    assert data["pillars"] == 6
    assert data["initiatives_total"] == 12
    assert "contact_submissions" in data
    assert "newsletter_subscribers" in data


# ---------- Contact ----------
def test_contact_create_and_persist(session):
    unique = f"TEST_{uuid.uuid4().hex[:8]}"
    payload = {
        "name": f"TEST_User_{unique}",
        "email": f"test_{unique}@example.com",
        "organization": "TEST_Org",
        "sector": "Government",
        "message": "This is a sufficiently long test message for validation.",
    }
    r = session.post(f"{API}/contact", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert "id" in data
    assert "_id" not in data
    # email_sent acceptable either true or false (Resend test mode may reject)
    assert isinstance(data["email_sent"], bool)

    # Verify persisted via GET
    r2 = session.get(f"{API}/contact", timeout=15)
    assert r2.status_code == 200
    listed = r2.json()
    assert any(c["id"] == data["id"] for c in listed)
    # Ensure no _id leak
    for c in listed:
        assert "_id" not in c


def test_contact_invalid_email(session):
    payload = {"name": "Test User", "email": "not-an-email", "message": "Long enough message."}
    r = session.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 422


def test_contact_short_message(session):
    payload = {"name": "Test User", "email": "valid@example.com", "message": "short"}
    r = session.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 422


def test_contact_short_name(session):
    payload = {"name": "A", "email": "valid@example.com", "message": "Long enough message here."}
    r = session.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 422


# ---------- Newsletter ----------
def test_newsletter_subscribe_and_idempotent(session):
    unique = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = session.post(f"{API}/newsletter", json={"email": unique}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == unique
    assert "id" in data
    assert "_id" not in data
    first_id = data["id"]

    # Idempotent — second call should not create a duplicate
    r2 = session.post(f"{API}/newsletter", json={"email": unique}, timeout=30)
    assert r2.status_code == 200
    data2 = r2.json()
    assert data2["email"] == unique
    assert data2["id"] == first_id

    # GET list — no _id leak
    r3 = session.get(f"{API}/newsletter", timeout=15)
    assert r3.status_code == 200
    items = r3.json()
    for item in items:
        assert "_id" not in item
    assert sum(1 for i in items if i["email"] == unique) == 1


def test_newsletter_invalid_email(session):
    r = session.post(f"{API}/newsletter", json={"email": "not-an-email"}, timeout=15)
    assert r.status_code == 422
