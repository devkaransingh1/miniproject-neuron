from fastapi import APIRouter
from pydantic import BaseModel

from app.integrations.llm.service import send_to_gemini

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest):

    response = send_to_gemini(request.message)

    return {
        "message": request.message,
        "response": response
    }