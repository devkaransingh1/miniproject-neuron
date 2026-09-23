from fastapi import APIRouter, Request, HTTPException
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


def get_current_user(request:Request,db:Session=Depends(get_db)):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401,detail="no user found, unauthorized")
    
    user = db.query(User).filter(User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=401,detail="user not found")
    return user


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
    
    user = db.query(User).filter(User.google_id==user_info['id']).first()
    
    if user:
        request.session['user_id']=user.id
        return RedirectResponse(url='/api/v1/auth/me')
    
    user = User(
        google_id=user_info["id"],
        name=user_info["name"],
        email=user_info["email"],
        picture_url=user_info.get("picture")
    )
    
    request.session['user_id']=user.id
    
    db.add(user)
    db.commit()
    db.refresh(user)

    return RedirectResponse(url='/api/v1/auth/me')
    
    
@router.get('/me')
def me(user=Depends(get_current_user)):
    return {
        "message":"profile accessed",
        "name":user.name,
        "email":user.email
    }
    
@router.post('/logout')
def logout(request:Request):
    request.session.clear()
    return {
        "message":"user logged out successfully"
    }
    
    
    
    