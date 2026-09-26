from fastapi import FastAPI
from pydantic import BaseModel
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from starlette.middleware.sessions import SessionMiddleware
from app.api.v1.gmail import router as gmail_router




app = FastAPI()

app.include_router(auth_router,prefix='/api/v1/auth')

app.add_middleware(SessionMiddleware,secret_key="mysecretkey",)

app.include_router(gmail_router, prefix="/api/v1/auth")

app.include_router(chat_router, prefix="/api/v1")


