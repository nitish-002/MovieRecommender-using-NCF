from datetime import datetime, timedelta, timezone
from jose import jwt
import pytest

from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    SECRET_KEY,
    ALGORITHM,
)


def test_hash_password_structure():
    """Verify hash_password generates a valid bcrypt salted hash."""
    raw = "SecureP@ssw0rd123"
    hashed = hash_password(raw)

    assert isinstance(hashed, str)
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert hashed != raw


def test_verify_password_success_and_failure():
    """Verify verify_password succeeds on match and fails on incorrect password."""
    password = "MySecretPassword"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    assert verify_password("", hashed) is False


def test_password_boundary_72_bytes():
    """Verify password length boundary: raises ValueError when >72 UTF-8 bytes."""
    valid_72 = "a" * 72
    hashed = hash_password(valid_72)
    assert verify_password(valid_72, hashed) is True

    too_long = "a" * 73
    with pytest.raises(ValueError, match="72 UTF-8 bytes"):
        hash_password(too_long)

    assert verify_password(too_long, hashed) is False


def test_create_and_decode_access_token():
    """Verify create_access_token produces a decodable JWT with user claims."""
    user_id = 42
    email = "testuser@example.com"

    token = create_access_token(user_id=user_id, email=email)
    assert isinstance(token, str)

    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["email"] == email
    assert "exp" in payload


def test_decode_tampered_token():
    """Verify decode_token rejects tampered JWT tokens gracefully."""
    token = create_access_token(user_id=1, email="legit@example.com")
    tampered = token[:-4] + "fake"

    payload = decode_token(tampered)
    assert payload is None


def test_decode_expired_token():
    """Verify decode_token rejects expired JWT tokens."""
    expired_time = datetime.now(timezone.utc) - timedelta(hours=1)
    payload = {
        "sub": "1",
        "email": "user@example.com",
        "exp": expired_time,
    }
    expired_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    assert decode_token(expired_token) is None

