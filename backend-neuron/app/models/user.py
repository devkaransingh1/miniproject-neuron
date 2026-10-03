
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    picture_url = Column(String, nullable=True)

    # Gmail integration
    is_gmail_connected = Column(Boolean, default=False, nullable=False)
    gmail_access_token = Column(Text, nullable=True)
    gmail_refresh_token = Column(Text, nullable=True)
    gmail_token_expiry = Column(DateTime, nullable=True)

    # Gmail → RAG synchronization
    gmail_initial_sync_completed = Column(
        Boolean,
        default=False,
        nullable=False
    )

    gmail_last_sync_at = Column(
        DateTime,
        nullable=True
    )
    
    gmail_sync_status = Column( String, default="not_started", nullable=False )

    # Conversations
    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan"
    )

