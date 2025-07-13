from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
import pytesseract
from ocr_utils import parse_credentials

app = FastAPI()

@app.post('/extract')
async def extract_credentials(image: UploadFile = File(...)):
    data = await image.read()
    img = Image.open(io.BytesIO(data))
    text = pytesseract.image_to_string(img)
    credentials = parse_credentials(text)
    return {'text': text, 'credentials': credentials}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
