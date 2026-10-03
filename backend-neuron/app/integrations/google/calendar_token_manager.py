
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.auth.exceptions import RefreshError
from googleapiclient.discovery import build



from app.core.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
)


CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
]


class CalendarReconnectRequired(Exception):
    pass



def get_calendar_credentials(user):
    if not user.calendar_refresh_token:
        raise CalendarReconnectRequired(
            "Google Calendar is not connected or the refresh token is missing."
        )

    credentials = Credentials(
        token=user.calendar_access_token,
        refresh_token=user.calendar_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=CALENDAR_SCOPES,
    )
    
    if not credentials.valid:
        try:
            credentials.refresh(Request())

        except RefreshError as exc:
            error_message = str(exc)

            if "invalid_grant" in error_message:
                raise CalendarReconnectRequired(
                    "Google Calendar authorization has expired or been revoked. "
                    "The user must reconnect Calendar."
                ) from exc

            raise
    
    
    if credentials.token:
        user.calendar_access_token = credentials.token

    if credentials.refresh_token:
        user.calendar_refresh_token = credentials.refresh_token

    if credentials.expiry:
        user.calendar_token_expiry = credentials.expiry

    return credentials



def create_calendar_service(user):
    credentials = get_calendar_credentials(user)

    service = build(
        "calendar",
        "v3",
        credentials=credentials,
    )

    return service





