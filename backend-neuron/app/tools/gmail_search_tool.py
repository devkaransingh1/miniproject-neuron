
import json

from langchain_core.tools import tool

from app.db.session import SessionLocal
from app.models.user import User
from app.api.v1.gmail import search_gmail_messages


def create_gmail_search_tool(user_id: int):

    @tool
    def gmail_search(
        query: str = "",
        max_results: int = 1,
    ) -> str:
        """
        Search the authenticated user's Gmail inbox in real time.

        Use this tool for current or recent email questions, including:
        latest email, latest N emails, emails from a sender, emails
        matching a Gmail search query, and other live inbox lookups.

        query must be a valid Gmail search query. For the latest emails,
        use an empty query. max_results controls the exact number of
        emails requested, up to Gmail's supported limit.
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

