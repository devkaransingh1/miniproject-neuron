
import json

from langchain_core.tools import tool

from app.db.session import SessionLocal
from app.models.user import User
from app.api.v1.gmail import get_gmail_message


def create_gmail_message_tool(user_id: int):

    @tool
    def gmail_get_message(message_id: str) -> str:
        """
        Get the complete content of a specific Gmail message.

        Use this tool after gmail_search when the user asks about
        the actual content, details, or full body of an email.

        message_id must be the Gmail message ID returned by gmail_search.
        """

        db = SessionLocal()

        try:
            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if not user:
                return json.dumps({
                    "error": "Authenticated user not found."
                })

            if not user.is_gmail_connected:
                return json.dumps({
                    "error": "Gmail is not connected."
                })

            if not message_id:
                return json.dumps({
                    "error": "Gmail message ID is required."
                })

            email = get_gmail_message(
                user=user,
                message_id=message_id,
            )

            if not email:
                return json.dumps({
                    "error": "Email not found."
                })

            return json.dumps({
                "id": email["id"],
                "thread_id": email.get("thread_id"),
                "sender": email.get("sender"),
                "recipient": email.get("recipient"),
                "subject": email.get("subject"),
                "date": email.get("date"),
                "body": email.get("body", ""),
            })

        except Exception as e:
            print(
                "❌ Gmail message tool error:",
                str(e)
            )

            return json.dumps({
                "error": "I couldn't retrieve the full Gmail message."
            })

        finally:
            db.close()

    return gmail_get_message

