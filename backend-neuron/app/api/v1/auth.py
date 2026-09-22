from fastapi import APIRouter, Request
import requests
from fastapi.responses import RedirectResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User

from app.integrations.google.oauth import (
    get_google_authorization_url,
    create_google_flow,
)

router = APIRouter()


@router.get("/google/login")
def google_login(request: Request):
    authorization_url, state = get_google_authorization_url()

    request.session["oauth_state"] = state

    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
def google_callback(request: Request,db: Session = Depends(get_db)):
    flow = create_google_flow()

    flow.fetch_token(
        code=request.query_params.get("code")
    )

    credentials = flow.credentials
    response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {credentials.token}"}
    )
    
    user_info = response.json()
    
    user = User(
        google_id=user_info["id"],
        name=user_info["name"],
        email=user_info["email"],
        picture_url=user_info.get("picture")
    )
    
    
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User saved successfully",
        "name": user.name,
        "email": user.email,
        "picture_url": user.picture_url
    }