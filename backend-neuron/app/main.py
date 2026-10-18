import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI
import os
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.gmail import router as gmail_router
from app.api.v1.rag import router as rag_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.gmail_reconnect import router as gmail_reconnect_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.calendar import router as calendar_router
from app.api.v1.github import router as github_router
from starlette.middleware.sessions import SessionMiddleware

from app.db.base import Base
from app.db.session import engine
from app.models import User, Conversation, Message
from fastapi.middleware.cors import CORSMiddleware
from app.models.neuron_vector import NeuronVector



app = FastAPI()

Base.metadata.create_all(bind=engine)


app.include_router(auth_router,prefix='/api/v1/auth')

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    max_age=60 * 60 * 24 * 7,
    same_site="none",
    https_only=True,
)

app.include_router(gmail_router, prefix="/api/v1")

app.include_router(chat_router, prefix="/api/v1")

app.include_router(conversations_router,prefix="/api/v1")

app.include_router(rag_router, prefix="/api/v1")

#will remove it once the app will be in production in cloud console

app.include_router(
    gmail_reconnect_router,
    prefix="/api/v1/auth"
)
# till here


app.include_router(
    integrations_router,
    prefix="/api/v1"
)

app.include_router(
    calendar_router,
    prefix="/api/v1"
)

app.include_router(
    github_router,
    prefix="/api/v1"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://neuron-71tk.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

