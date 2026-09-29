from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message


router = APIRouter()


@router.get("/conversations")
def get_conversations(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user.id
    ).order_by(
        Conversation.created_at.desc()
    ).all()

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at
        }
        for conversation in conversations
    ]
    
    
    
@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(
        Message.created_at.asc()
    ).all()

    return {
        "conversation_id": conversation.id,
        "messages": [
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at
            }
            for message in messages
        ]
    }