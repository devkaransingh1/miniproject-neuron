
from app.db.session import SessionLocal
from app.models.user import User


def run_initial_gmail_sync(user_id: int):
    """
    Run the initial Gmail → RAG sync in the background.

    The OAuth callback returns to the frontend immediately.
    This function continues the Gmail indexing separately.
    """

    db = SessionLocal()

    try:
        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            print(
                f"❌ Initial Gmail RAG sync failed: "
                f"user {user_id} not found"
            )
            return

        # Prevent duplicate initial syncs.
        if user.gmail_initial_sync_completed:
            print(
                f"ℹ️ Gmail RAG sync already completed "
                f"for user {user_id}"
            )
            return

        # ----------------------------------------------------
        # SYNC STARTED
        # ----------------------------------------------------

        user.gmail_sync_status = "syncing"

        db.add(user)
        db.commit()
        db.refresh(user)

        print(
            f"🔄 Starting initial Gmail RAG sync "
            f"for user {user_id}..."
        )

        from app.rag.gmail_ingestion import (
            ingest_gmail_messages,
            update_gmail_sync_time,
        )

        # ----------------------------------------------------
        # INDEX LATEST 50 EMAILS
        # ----------------------------------------------------

        ingest_gmail_messages(
            user,
            max_results=50
        )

        # ----------------------------------------------------
        # UPDATE SYNC TIME
        # ----------------------------------------------------

        update_gmail_sync_time(
            user,
            db
        )

        # ----------------------------------------------------
        # SYNC COMPLETED
        # ----------------------------------------------------

        user.gmail_initial_sync_completed = True
        user.gmail_sync_status = "completed"

        db.add(user)
        db.commit()
        db.refresh(user)

        print(
            f"✅ Initial Gmail RAG sync completed "
            f"for user {user_id}"
        )

    except Exception as e:

        db.rollback()

        print(
            f"❌ Initial Gmail RAG sync failed "
            f"for user {user_id}: {str(e)}"
        )

        # ----------------------------------------------------
        # MARK SYNC AS FAILED
        # ----------------------------------------------------

        try:

            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if user:

                user.gmail_sync_status = "failed"

                db.add(user)
                db.commit()

        except Exception as status_error:

            db.rollback()

            print(
                f"❌ Failed to update Gmail sync status: "
                f"{str(status_error)}"
            )

    finally:

        db.close()

