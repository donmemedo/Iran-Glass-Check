import base64
import hmac
import time
from hashlib import sha256

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session, select

from .database import get_session
from .models import Organization

SECRET = b"iranglasscheck-demo-secret"
TTL_SECONDS = 60 * 60 * 12


def _sign(payload: str) -> str:
    digest = hmac.new(SECRET, payload.encode(), sha256).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def issue_token(org_id: int) -> str:
    payload = f"{org_id}.{int(time.time()) + TTL_SECONDS}"
    return f"{base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')}.{_sign(payload)}"


def _decode(token: str) -> int:
    try:
        raw, signature = token.rsplit(".", 1)
        payload = base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4)).decode()
        org_id, expiry = payload.split(".")
        if not hmac.compare_digest(signature, _sign(payload)):
            raise ValueError("bad signature")
        if int(expiry) < time.time():
            raise ValueError("expired")
        return int(org_id)
    except Exception as exc:  # noqa: BLE001 - any malformed token is simply unauthorised
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid_token") from exc


def current_org(
    authorization: str = Header(default=""),
    session: Session = Depends(get_session),
) -> Organization:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing_token")
    org_id = _decode(authorization.split(" ", 1)[1].strip())
    org = session.exec(select(Organization).where(Organization.id == org_id)).first()
    if not org:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "unknown_org")
    return org
