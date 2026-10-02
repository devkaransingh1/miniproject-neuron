
from datetime import datetime, timezone

from langchain_core.tools import tool

from app.db.session import SessionLocal
from app.models.user import User

from app.rag.gmail_ingestion import (
    sync_new_gmail_messages,
    update_gmail_sync_time,
)

from app.rag.retriever import retrieve_relevant_emails


SYNC_INTERVAL_MINUTES = 30


def create_email_knowledge_tool(user_id: int):

    @tool
    def email_knowledge(query: str) -> str:
        """
        Search the authenticated user's email knowledge.

        Use this tool whenever the user asks about their emails,
        inbox, recent emails, senders, subjects, internship emails,
        job emails, or information contained in their emails.

        The tool automatically keeps the email knowledge up to date
        before retrieving relevant information.
        """

        db = SessionLocal()

        try:
            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if not user:
                return "Authenticated user not found."

            if not user.is_gmail_connected:
                return "Gmail is not connected."

            # -----------------------------------------
            # CHECK SYNC FRESHNESS
            # -----------------------------------------

            sync_required = False

            if not user.gmail_last_sync_at:

                sync_required = True

            else:

                last_sync = user.gmail_last_sync_at

                if last_sync.tzinfo is None:
                    last_sync = last_sync.replace(
                        tzinfo=timezone.utc
                    )

                now = datetime.now(timezone.utc)

                elapsed_minutes = (
                    now - last_sync
                ).total_seconds() / 60

                if elapsed_minutes >= SYNC_INTERVAL_MINUTES:
                    sync_required = True

            # -----------------------------------------
            # INCREMENTAL GMAIL SYNC
            # -----------------------------------------

            if sync_required:

                print("🔄 Gmail RAG sync required")

                sync_new_gmail_messages(user)

                update_gmail_sync_time(
                    user,
                    db
                )

                print("✅ Gmail RAG sync completed")

            else:

                print("⚡ Gmail RAG is fresh")

            # -----------------------------------------
            # RAG RETRIEVAL
            # -----------------------------------------

            results = retrieve_relevant_emails(
                user_id=user_id,
                query=query,
                top_k=5
            )

            if not results:
                return "No relevant emails found."

            return str(results)

        except Exception as e:

            print(
                "❌ Email knowledge tool error:",
                str(e)
            )

            return (
                "I couldn't access the user's email knowledge "
                "right now."
            )

        finally:

            db.close()

    return email_knowledge

