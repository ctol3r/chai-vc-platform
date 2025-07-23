from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import threading
import time
import random

app = FastAPI()

metrics = {
    "accuracy": 0.95,
    "false_positive_rate": 0.05,
    "decision_latency": 100.0
}

def update_metrics():
    while True:
        metrics["accuracy"] = max(0.0, min(1.0, metrics["accuracy"] + random.uniform(-0.01, 0.01)))
        metrics["false_positive_rate"] = max(0.0, min(1.0, metrics["false_positive_rate"] + random.uniform(-0.01, 0.01)))
        metrics["decision_latency"] = max(0.0, metrics["decision_latency"] + random.uniform(-5, 5))
        time.sleep(1)

threading.Thread(target=update_metrics, daemon=True).start()

@app.get("/metrics")
def get_metrics():
    return metrics

@app.get("/", response_class=HTMLResponse)
def dashboard():
    with open("monitoring_dashboard/static/dashboard.html") as f:
        return f.read()
