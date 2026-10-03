from google_auth_oauthlib.flow import Flow  # type: ignore[import-not-found]

from app.integrations.google.token_manager import get_gmail_credentials
from googleapiclient.discovery import build
from app.core.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_GMAIL_REDIRECT_URI,
)

GOOGLE_LOGIN_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]


def create_google_flow():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uris": [GOOGLE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=GOOGLE_LOGIN_SCOPES,
        autogenerate_code_verifier=False,
    )

    flow.redirect_uri = GOOGLE_REDIRECT_URI

    return flow


def create_gmail_flow():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_GMAIL_REDIRECT_URI],
            }
        },
        scopes=GMAIL_SCOPES,
        autogenerate_code_verifier=False,
    )

    flow.redirect_uri = GOOGLE_GMAIL_REDIRECT_URI

    return flow

def get_google_authorization_url():
    flow = create_google_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
    )

    return authorization_url, state

def create_gmail_service(user):
    credentials = get_gmail_credentials(user)

    service = build(
        "gmail",
        "v1",
        credentials=credentials
    )

    return service