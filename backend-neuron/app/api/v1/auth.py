
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import requests

from app.db.session import get_db
from app.models.user import User

from app.integrations.google.oauth import (
    get_google_authorization_url,
    create_google_flow,
)


router = APIRouter()


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="no user found, unauthorized"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="user not found"
        )

    return user


# ============================================================
# GOOGLE LOGIN
# ============================================================

@router.get("/google/login")
def google_login(request: Request):

    user_id = request.session.get("user_id")

    # Already logged in
    if user_id:
        return RedirectResponse(
            url="/api/v1/auth/me"
        )

    authorization_url, state = get_google_authorization_url()

    request.session["oauth_state"] = state

    return RedirectResponse(
        url=authorization_url
    )


# ============================================================
# GOOGLE CALLBACK
# ============================================================

@router.get("/google/callback")
def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    code = request.query_params.get("code")

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Google authorization code missing"
        )

    flow = create_google_flow()

    flow.fetch_token(
        code=code
    )

    credentials = flow.credentials

    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={
            "Authorization": f"Bearer {credentials.token}"
        }
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Failed to fetch Google user information"
        )

    user_info = response.json()

    # --------------------------------------------------------
    # CHECK IF USER ALREADY EXISTS
    # --------------------------------------------------------

    user = db.query(User).filter(
        User.google_id == user_info["id"]
    ).first()

    if user:

        request.session["user_id"] = user.id

        return RedirectResponse(
            url="/api/v1/auth/me"
        )

    # --------------------------------------------------------
    # CREATE NEW USER
    # --------------------------------------------------------

    user = User(
        google_id=user_info["id"],
        name=user_info["name"],
        email=user_info["email"],
        picture_url=user_info.get("picture")
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id

    return RedirectResponse(
        url="/api/v1/auth/me"
    )


# ============================================================
# CURRENT USER PROFILE
# ============================================================

@router.get("/me")
def me(
    request: Request,
    user=Depends(get_current_user)
):
    print("SESSION:", request.session)

    return {
        "message": "profile accessed",
        "name": user.name,
        "email": user.email
    }


# ============================================================
# LOGOUT
# ============================================================

@router.get("/logout")
def logout(request: Request):

    request.session.clear()

    return {
        "message": "user logged out successfully"
    }

