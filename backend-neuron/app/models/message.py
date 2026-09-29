from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime, timezone

from app.db.base import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )

    role = Column(String, nullable=False)

    content = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )