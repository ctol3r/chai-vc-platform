from fastapi import FastAPI
app = FastAPI()
@app.get("/api/health")
async def health():
    return {"status":"ok"}
@app.get("/")
async def index():
    return {"app":"mock-frontend"}
