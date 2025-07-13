from fastapi import FastAPI
from .routes.match import router as match_router

app = FastAPI(title="AI Matcher Service")
app.include_router(match_router)

# For uvicorn entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
