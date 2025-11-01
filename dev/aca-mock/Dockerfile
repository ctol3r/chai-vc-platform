FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir flask

COPY aca_mock.py .

EXPOSE 8031

CMD ["python", "aca_mock.py"]
