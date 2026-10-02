from langchain_core.tools import tool

from app.api.v1.gmail import search_gmail_messages
from app.db.session import SessionLocal
from app.models.user import User


def create_gmail_tools(user_id: int):

    @tool
    def search_gmail(query: str) -> str:
        
        """
        Search the authenticated user's Gmail.

        Use this for questions about emails, inbox messages,
        internship emails, job emails, senders, subjects,
        recent emails, or latest emails.
        """
        print("🔥 GMAIL TOOL CALLED")
        print("QUERY RECEIVED:", query)
        db = SessionLocal()

        try:
            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                return "Authenticated user not found."

            # Make "latest/recent" requests explicitly search the inbox.
            lowered_query = query.lower()

            if (
                "latest" in lowered_query
                or "recent" in lowered_query
                or "newest" in lowered_query
                or "most recent" in lowered_query
            ):
                query = "in:inbox"

            results = search_gmail_messages(
                user,
                query,
                max_results=20
            )
            print("USER ID:", user_id)
            print("GMAIL QUERY:", query)
            print("GMAIL RESULTS:", results[:3])
            

            if not results:
                return "No matching emails found."

            return str(results)

        finally:
            db.close()

    return [search_gmail]