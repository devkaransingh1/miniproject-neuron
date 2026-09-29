from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user
from app.rag.gmail_ingestion import ingest_gmail_messages


router = APIRouter()


@router.post("/rag/sync-gmail")
def sync_gmail(
    user=Depends(get_current_user)
):
    results = ingest_gmail_messages(
        user,
        max_results=10
    )

    return {
        "status": "success",
        "indexed_count": len(results),
        "emails": results
    }