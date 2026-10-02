
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import json

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.agents.neuron_agent import create_neuron_agent


router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None


def parse_tool_result(content):
    """
    Convert a tool's JSON string response into a Python object.
    """

    if not content:
        return None

    if isinstance(content, (dict, list)):
        return content

    try:
        return json.loads(content)
    except (json.JSONDecodeError, TypeError):
        return None


def extract_assistant_text(content) -> str:
    """
    LangChain can return assistant content as either a string
    or a structured list of content blocks.
    """

    if isinstance(content, str):
        return content

    if isinstance(content, list):

        text_parts = []

        for block in content:

            if isinstance(block, str):
                text_parts.append(block)

            elif isinstance(block, dict):

                if block.get("type") == "text":
                    text_parts.append(
                        block.get("text", "")
                    )

        return "\n".join(
            part for part in text_parts if part
        )

    return str(content)


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

        content = msg.content

        # Previous assistant responses are stored as JSON.
        # Only send the human-readable content back to the agent.
        if msg.role == "assistant":

            try:
                stored_response = json.loads(content)

                if isinstance(stored_response, dict):
                    content = stored_response.get(
                        "content",
                        content
                    )

            except (json.JSONDecodeError, TypeError):
                pass

        agent_messages.append({
            "role": (
                "assistant"
                if msg.role == "assistant"
                else "user"
            ),
            "content": content
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

    messages = agent_response.get(
        "messages",
        []
    )

    if not messages:
        raise HTTPException(
            status_code=500,
            detail="Neuron agent returned no response"
        )

    # -----------------------------------------
    # FINAL ASSISTANT RESPONSE
    # -----------------------------------------

    final_message = messages[-1]

    response_text = extract_assistant_text(
        getattr(
            final_message,
            "content",
            ""
        )
    )

    # -----------------------------------------
    # CHECK TOOL RESULTS
    # -----------------------------------------

    email_results = []

    for msg in messages:

        if getattr(msg, "type", None) != "tool":
            continue

        tool_name = getattr(
            msg,
            "name",
            None
        )

        if tool_name not in {
            "gmail_search",
            "email_knowledge"
        }:
            continue

        parsed_result = parse_tool_result(
            getattr(msg, "content", None)
        )

        if not isinstance(parsed_result, dict):
            continue

        tool_emails = parsed_result.get(
            "emails",
            []
        )

        if isinstance(tool_emails, list):
            email_results.extend(
                tool_emails
            )

    # -----------------------------------------
    # BUILD FRONTEND RESPONSE
    # -----------------------------------------

    if email_results:

        response = {
            "type": "email",
            "content": response_text,
            "data": {
                "emails": email_results
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

