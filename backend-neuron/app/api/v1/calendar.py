
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
import os
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.config import (
    FRONTEND_URL,
)
from app.db.session import get_db
from app.integrations.google.oauth import create_calendar_flow


router = APIRouter()


@router.get("/connect/calendar")
def connect_calendar(
    user=Depends(get_current_user)
):
    flow = create_calendar_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        login_hint=user.email,
    )

    return RedirectResponse(
        authorization_url
    )


@router.get("/connect/calendar/callback")
def calendar_callback(
    code: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    flow = create_calendar_flow()
    os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
    flow.fetch_token(
        code=code
    )

    credentials = flow.credentials

    user.calendar_access_token = credentials.token
    if credentials.refresh_token:
        user.calendar_refresh_token = credentials.refresh_token

    if credentials.expiry:
        user.calendar_token_expiry = credentials.expiry

    user.is_calendar_connected = True
    db.commit()

    return RedirectResponse(
        f"{FRONTEND_URL}/chat"
    )
