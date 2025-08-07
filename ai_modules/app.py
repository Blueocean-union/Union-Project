from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from pdf_utils import extract_text_from_pdf
from whisper_api import transcribe_audio_file
from openai_api import summarize_text
from problem import generate_problem
from ad_recommender import recommend_advertisement


import uvicorn
import os
import tempfile

user_usage_count = {}
MAX_USES_BEFORE_AD = 5

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/pdf/summary")
async def summarize_pdf(file: UploadFile = File(...)):
    try:
        chunks = extract_text_from_pdf(file.file)
        summary = summarize_text(chunks)
        return {"summary": summary}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/audio/summary")
async def summarize_audio(file: UploadFile = File(...)):
    try:
        # Whisper API 기반 전사
        transcript = transcribe_audio_file(file.file)

        # 요약
        summary = summarize_text(transcript)

        return {"transcript": transcript, "summary": summary}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/problem")
async def handle_problem(prompt: str = Form(None), file: UploadFile = File(None), request: Request = None):
    try:
        text = prompt if prompt else None
        image = file.file if file else None

        # 사용자 ID 추적
        user_id = request.client.host
        user_usage_count[user_id] = user_usage_count.get(user_id, 0) + 1

        # 문제 생성
        result = generate_problem(text=text, image=image)

        # 광고 추천
        ad_message = None
        if user_usage_count[user_id] >= MAX_USES_BEFORE_AD:
            # 텍스트가 없으면 result에서 [문제 설명] 추출
            base_for_ad = text if text else result
            ad_message = recommend_advertisement(prompt=base_for_ad)

        return {"problem": result, "ad": ad_message}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})




if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
