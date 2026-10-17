from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

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
    """
    Get all conversations for the user, ordered by most recently updated/created.
    """
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user.id
    ).order_by(
        func.coalesce(Conversation.updated_at, Conversation.created_at).desc()
    ).all()

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at or conversation.created_at
        }
        for conversation in conversations
    ]


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all messages for a specific conversation.
    """
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


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a conversation and all its messages.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    db.delete(conversation)
    db.commit()

    return {
        "status": "success",
        "message": "Conversation deleted successfully",
        "deleted_id": conversation_id
    }