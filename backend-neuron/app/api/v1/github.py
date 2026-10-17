from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.config import FRONTEND_URL
from app.db.session import get_db
from app.integrations.github.oauth import (
    GitHubOAuthError,
    exchange_github_code_for_token,
    fetch_github_user_profile,
    get_github_authorization_url,
)

router = APIRouter()


@router.get("/connect/github")
def connect_github(
    request: Request,
    user=Depends(get_current_user),
):
    """
    Redirect the user to GitHub's OAuth authorization flow.
    """
    try:
        auth_url = get_github_authorization_url()
        return RedirectResponse(auth_url)
    except GitHubOAuthError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"GitHub integration configuration error: {str(exc)}",
        )


@router.get("/connect/github/callback")
def github_callback(
    code: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GitHub OAuth callback endpoint.
    Exchanges code for access token, saves GitHub profile, and redirects to chat.
    """
    if error:
        detail = error_description or error
        return RedirectResponse(f"{FRONTEND_URL}/chat?github_error={detail}")

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Missing GitHub authorization code.",
        )

    try:
        access_token = exchange_github_code_for_token(code)
        profile = fetch_github_user_profile(access_token)

        user.is_github_connected = True
        user.github_access_token = access_token
        user.github_username = profile.get("login")
        user.github_user_id = str(profile.get("id")) if profile.get("id") else None

        db.commit()

        return RedirectResponse(f"{FRONTEND_URL}/chat")

    except GitHubOAuthError as exc:
        return RedirectResponse(f"{FRONTEND_URL}/chat?github_error={str(exc)}")
    except Exception as exc:
        return RedirectResponse(f"{FRONTEND_URL}/chat?github_error=InternalError")


@router.post("/connect/github/disconnect")
@router.get("/connect/github/disconnect")
def disconnect_github(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Disconnect GitHub integration for the current user.
    """
    user.is_github_connected = False
    user.github_access_token = None
    user.github_username = None
    user.github_user_id = None

    db.commit()

    return {
        "status": "success",
        "message": "GitHub disconnected successfully.",
    }
