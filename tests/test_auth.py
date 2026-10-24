"""
test_auth.py
------------
Unit tests for password hashing and JWT token life-cycle.
"""

from datetime import timedelta
import jwt
from backend.auth import hash_password, verify_password, create_access_token
from backend.config import SECRET_KEY, ALGORITHM


def test_password_hashing():
    """Verify that bcrypt hashes match plaintext and reject invalid passwords."""
    raw = "MySuperSecretPass123!"
    hashed = hash_password(raw)

    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_generation():
    """Verify that access tokens encode payload and decode properly."""
    data = {"sub": "42", "role": "admin"}
    token = create_access_token(data, expires_delta=timedelta(minutes=10))

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "42"
    assert payload["role"] == "admin"
    assert "exp" in payload
