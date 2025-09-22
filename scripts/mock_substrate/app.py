from fastapi import FastAPI
app = FastAPI()
@app.get("/health")
async def health():
    return {"status":"ok", "node":"mock-substrate"}
@app.get("/ws")
async def wsroot():
    return {"ws":"mock"}
