
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.auth.exceptions import RefreshError

from app.core.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
)

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]


class GmailReconnectRequired(Exception):
    """
    Raised when the stored Gmail refresh token is no longer valid.

    The user must reconnect Gmail through the OAuth flow.
    """

    pass


def get_gmail_credentials(user):
    """
    Return valid Gmail OAuth credentials for the given user.

    If the access token is expired, Google will be contacted using
    the stored refresh token to obtain a new access token.

    The refreshed token information is also updated on the user object.
    """

    if not user.gmail_refresh_token:
        raise GmailReconnectRequired(
            "Gmail is not connected or the refresh token is missing."
        )

    credentials = Credentials(
        token=user.gmail_access_token,
        refresh_token=user.gmail_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=GMAIL_SCOPES,
    )

    # Access token is missing or expired.
    if not credentials.valid:
        try:
            credentials.refresh(Request())

        except RefreshError as exc:
            error_message = str(exc)

            if "invalid_grant" in error_message:
                raise GmailReconnectRequired(
                    "Gmail authorization has expired or been revoked. "
                    "The user must reconnect Gmail."
                ) from exc

            raise

    # Store the refreshed access token on the user object.
    if credentials.token:
        user.gmail_access_token = credentials.token

    # Google normally keeps the same refresh token, but if a new one
    # is returned, store it as well.
    if credentials.refresh_token:
        user.gmail_refresh_token = credentials.refresh_token

    # Store the new expiry time.
    if credentials.expiry:
        user.gmail_token_expiry = credentials.expiry

    return credentials

