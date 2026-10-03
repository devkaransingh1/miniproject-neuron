
from datetime import datetime, timezone
import json

from langchain_core.tools import tool

from app.db.session import SessionLocal
from app.models.user import User

from app.rag.gmail_ingestion import (
    sync_new_gmail_messages,
    update_gmail_sync_time,
)

from app.rag.retriever import retrieve_relevant_emails


SYNC_INTERVAL_MINUTES = 30

# -----------------------------------------
# RAG CONTEXT LIMITS
# -----------------------------------------

MAX_TOTAL_CONTEXT_CHARS = 2500
MAX_EMAIL_CONTENT_CHARS = 500


def create_email_knowledge_tool(user_id: int):

    @tool
    def email_knowledge(query: str) -> str:
        """
        Search the authenticated user's historical email knowledge.

        Use this tool for semantic and historical questions such as:

        - internship history
        - job opportunities
        - recruiter conversations
        - historical email discussions
        - information spread across older emails
        - summaries of previous email conversations
        - patterns across email history

        Do NOT use this tool for simple live/latest Gmail lookups.
        """

        db = SessionLocal()

        try:
            # -----------------------------------------
            # GET AUTHENTICATED USER
            # -----------------------------------------

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

            # -----------------------------------------
            # CHECK RAG SYNC FRESHNESS
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

                now = datetime.now(
                    timezone.utc
                )

                elapsed_minutes = (
                    now - last_sync
                ).total_seconds() / 60

                if (
                    elapsed_minutes
                    >= SYNC_INTERVAL_MINUTES
                ):
                    sync_required = True

            # -----------------------------------------
            # INCREMENTAL GMAIL SYNC
            # -----------------------------------------

            if sync_required:

                print(
                    "🔄 Gmail RAG sync required"
                )

                sync_new_gmail_messages(
                    user
                )

                update_gmail_sync_time(
                    user,
                    db
                )

                print(
                    "✅ Gmail RAG sync completed"
                )

            else:

                print(
                    "⚡ Gmail RAG is fresh"
                )

            # -----------------------------------------
            # SEMANTIC RETRIEVAL
            # -----------------------------------------

            results = retrieve_relevant_emails(
                user_id=user_id,
                query=query,
                top_k=3
            )

            # -----------------------------------------
            # NO RESULTS
            # -----------------------------------------

            if not results:

                return json.dumps({
                    "count": 0,
                    "emails": []
                })

            # -----------------------------------------
            # LIMIT RAG CONTEXT
            # -----------------------------------------

            clean_results = []

            total_chars = 0

            for email in results:

                content = email.get(
                    "content",
                    ""
                )

                remaining_chars = (
                    MAX_TOTAL_CONTEXT_CHARS
                    - total_chars
                )

                if remaining_chars <= 0:
                    break

                content_limit = min(
                    MAX_EMAIL_CONTENT_CHARS,
                    remaining_chars
                )

                content = content[:content_limit]

                clean_results.append({
                    "message_id": email.get(
                        "message_id",
                        ""
                    ),
                    "thread_id": email.get(
                        "thread_id",
                        ""
                    ),
                    "content": content,
                    "subject": email.get(
                        "subject",
                        ""
                    ),
                    "sender": email.get(
                        "sender",
                        ""
                    ),
                    "recipient": email.get(
                        "recipient",
                        ""
                    ),
                    "date": email.get(
                        "date",
                        ""
                    ),
                    "distance": email.get(
                        "distance"
                    )
                })

                total_chars += len(content)

            # -----------------------------------------
            # RETURN STRUCTURED RESULT
            # -----------------------------------------

            return json.dumps({
                "count": len(clean_results),
                "emails": clean_results
            })

        except Exception as e:

            print(
                "❌ Email knowledge tool error:",
                str(e)
            )

            return json.dumps({
                "error": (
                    "I couldn't access the user's "
                    "email knowledge right now."
                )
            })

        finally:

            db.close()

    return email_knowledge

