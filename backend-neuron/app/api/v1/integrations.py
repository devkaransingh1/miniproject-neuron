
from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user


router = APIRouter()


@router.get("/integrations/status")
def get_integrations_status(
    user=Depends(get_current_user)
):
    return {
        "gmail": {
            "connected": user.is_gmail_connected
        },
        "calendar": {
            "connected": False
        },
        "github": {
            "connected": False
        }
    }

