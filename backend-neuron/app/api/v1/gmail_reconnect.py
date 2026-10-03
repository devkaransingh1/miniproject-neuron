
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse

from app.api.v1.auth import get_current_user
from app.integrations.google.oauth import create_gmail_flow


router = APIRouter()


# ============================================================
# TEMPORARY GMAIL RECONNECT
# ============================================================
#
# This endpoint is ONLY for development/testing.
#
# It forces a fresh Gmail OAuth authorization even when
# the user is already marked as connected.
#
# Remove this file and its router registration before
# moving Neuron to production.
# ============================================================

@router.get("/gmail/reconnect")
def gmail_reconnect(
    request: Request,
    user=Depends(get_current_user)
):
    flow = create_gmail_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
    )

    request.session["gmail_oauth_state"] = state

    return RedirectResponse(
        url=authorization_url
    )

