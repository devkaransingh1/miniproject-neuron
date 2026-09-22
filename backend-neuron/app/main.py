from fastapi import FastAPI
from pydantic import BaseModel
from app.api.v1.auth import router as auth_router
from starlette.middleware.sessions import SessionMiddleware


app = FastAPI()

app.include_router(auth_router,prefix='/api/v1/auth')
app.add_middleware(
    SessionMiddleware,
    secret_key="mysecretkey",
)


