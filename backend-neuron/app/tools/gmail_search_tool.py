
import json

from langchain_core.tools import tool

from app.db.session import SessionLocal
from app.models.user import User
from app.api.v1.gmail import search_gmail_messages


def create_gmail_search_tool(user_id: int):

    @tool
    def gmail_search(
        query: str,
        max_results: int = 5,
    ) -> str:
        """
        Search the authenticated user's Gmail inbox in real time.

        CRITICAL: DO NOT CALL THIS TOOL FOR GREETINGS, 'HI', 'HELLO', OR CASUAL CONVERSATION.
        Only call this tool when the user EXPLICITLY asks to search, check, or view their emails or inbox.

        Args:
            query: The Gmail search query (e.g. 'placement cell', 'interview', 'from:sender@example.com', 'is:unread', or '' for recent emails).
            max_results: The number of emails to return (default: 5).
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

            max_results = max(
                1,
                min(int(max_results), 100)
            )

            emails = search_gmail_messages(
                user=user,
                query=query or "",
                max_results=max_results,
            )

            clean_emails = []

            for email in emails:
                clean_emails.append({
                    "id": email["id"],
                    "thread_id": email["thread_id"],
                    "sender": email["sender"],
                    "recipient": email["recipient"],
                    "subject": email["subject"],
                    "date": email["date"],
                    "snippet": email["snippet"],
                })

            return json.dumps({
                "count": len(clean_emails),
                "emails": clean_emails,
            })

        except Exception as e:
            print(
                "❌ Gmail search tool error:",
                str(e)
            )

            return json.dumps({
                "error": "I couldn't access Gmail right now."
            })

        finally:
            db.close()

    return gmail_search

