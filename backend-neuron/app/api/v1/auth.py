from fastapi import FastAPI, APIRouter
from fastapi.responses import RedirectResponse
from app.integrations.google.oauth import get_google_authorization_url

router = APIRouter()


#google authentication endpoint 
@router.get('/google/login')
def google_login():

    authorization_url, state = get_google_authorization_url()
    return RedirectResponse(url=authorization_url)

@router.get('/google/callback')
def google_callback():
    return {
        "message":"if you are here then it means you have succesfully reached the custom callback endpoint"
    }