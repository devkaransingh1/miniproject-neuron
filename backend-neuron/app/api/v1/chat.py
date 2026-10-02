
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.agents.neuron_agent import create_neuron_agent

import json
import ast


router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None


@router.post("/chat")
def chat(
    request: ChatRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # FIND OR CREATE CONVERSATION
    # -----------------------------------------

    if request.conversation_id:

        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == user.id
        ).first()

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

    else:

        conversation = Conversation(
            user_id=user.id,
            title=request.message[:50]
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # -----------------------------------------
    # GET PREVIOUS MESSAGES
    # -----------------------------------------

    previous_messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(
        Message.created_at.asc()
    ).limit(6).all()

    # -----------------------------------------
    # BUILD AGENT HISTORY
    # -----------------------------------------

    agent_messages = []

    for msg in previous_messages:

        agent_messages.append({
            "role": "assistant" if msg.role == "assistant" else "user",
            "content": msg.content
        })

    agent_messages.append({
        "role": "user",
        "content": request.message
    })

    # -----------------------------------------
    # CREATE NEURON AGENT
    # -----------------------------------------

    agent = create_neuron_agent(user.id)

    # -----------------------------------------
    # RUN AGENT
    # -----------------------------------------

    agent_response = agent.invoke({
        "messages": agent_messages
    })

    # -----------------------------------------
    # FINAL ASSISTANT RESPONSE
    # -----------------------------------------

    response_text = agent_response["messages"][-1].content

    # -----------------------------------------
    # CHECK IF EMAIL KNOWLEDGE TOOL WAS USED
    # -----------------------------------------

    email_results = None

    for msg in agent_response["messages"]:

        if (
            getattr(msg, "type", None) == "tool"
            and getattr(msg, "name", None) == "email_knowledge"
        ):
            email_results = msg.content

    # -----------------------------------------
    # BUILD FRONTEND RESPONSE
    # -----------------------------------------

    if email_results is not None:

        try:

            emails = ast.literal_eval(email_results)

            response = {
                "type": "email",
                "content": response_text,
                "data": {
                    "emails": emails
                }
            }

        except (ValueError, SyntaxError):

            response = {
                "type": "email",
                "content": response_text,
                "data": {
                    "emails": []
                }
            }

    else:

        response = {
            "type": "text",
            "content": response_text,
            "data": None
        }

    # -----------------------------------------
    # SAVE USER MESSAGE
    # -----------------------------------------

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )

    db.add(user_message)
    db.commit()

    # -----------------------------------------
    # SAVE ASSISTANT RESPONSE
    # -----------------------------------------

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=json.dumps(
            response,
            ensure_ascii=False
        )
    )

    db.add(assistant_message)
    db.commit()

    # -----------------------------------------
    # RETURN RESPONSE
    # -----------------------------------------

    return {
        "conversation_id": conversation.id,
        "message": request.message,
        "response": response
    }

