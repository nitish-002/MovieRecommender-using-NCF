from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
import bcrypt

from app.config import settings

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password must be 72 UTF-8 bytes or fewer")
    password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=12))
    return password_hash.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")
    if len(password_bytes) > 72:
        return False
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except (TypeError, ValueError):
        return False


def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
