from sqlalchemy import Column, Integer, String, Boolean, Text , DateTime

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    picture_url = Column(String, nullable=True)
    
    # gmail integration 
    is_gmail_connected = Column(Boolean,default=False,nullable=False)
    gmail_access_token = Column(Text,nullable=True)
    gmail_refresh_token = Column(Text,nullable=True)
    gmail_token_expiry = Column(DateTime,nullable=True)
    
    