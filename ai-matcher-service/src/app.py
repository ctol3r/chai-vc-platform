from fastapi import FastAPI
from .routes.match import router as match_router

app = FastAPI(title="AI Matcher Service")
app.include_router(match_router)
