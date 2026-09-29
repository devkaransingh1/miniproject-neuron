from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.gmail import router as gmail_router
from app.api.v1.rag import router as rag_router
from app.api.v1.conversations import router as conversations_router
from starlette.middleware.sessions import SessionMiddleware

from app.db.base import Base
from app.db.session import engine
from app.models import User, Conversation, Message



app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router,prefix='/api/v1/auth')

app.add_middleware(SessionMiddleware,secret_key="mysecretkey",)

app.include_router(gmail_router, prefix="/api/v1/auth")

app.include_router(chat_router, prefix="/api/v1")

app.include_router(conversations_router,prefix="/api/v1")

app.include_router(rag_router, prefix="/api/v1")

