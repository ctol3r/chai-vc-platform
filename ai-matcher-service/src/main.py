from fastapi import FastAPI
from routes.intake_assistant import router as intake_router

app = FastAPI()
app.include_router(intake_router)

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}
