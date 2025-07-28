from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from pdf_utils import extract_texts_from_multiple_pdfs, split_text_by_tokens
from daglo_api import request_transcription, get_transcription_result
from openai_api import summarize_text
from prompt import run_prompt
from json_utils import save_summary_to_json
from quiz import generate_quiz

import uvicorn


app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/pdfs/summary")
async def summarize_multiple_pdfs(files: list[UploadFile] = File(...)):
    try:
        file_objs = [file.file for file in files]
        chunks = extract_texts_from_multiple_pdfs(file_objs)
        summary = summarize_text(chunks)
        return {"summary": summary}
    except Exception as e:
        return {"error": str(e)}




@app.post("/audio/request")
async def upload_audio(file: UploadFile = File(...)):
    rid = request_transcription(file.file)
    if rid:
        return {"rid": rid}
    return JSONResponse(status_code=500, content={"error": "전사 요청 실패"})


@app.get("/audio/result/{rid}")
async def get_audio_result(rid: str):
    text = get_transcription_result(rid)

    if text:
        # 저장 경로: transcript_{rid}.json
        filename = f"transcript_{rid}.json"
        save_summary_to_json(text, output_path=filename)

        return {"text": text, "json_saved": filename}

    return JSONResponse(
        status_code=202,
        content={"message": "아직 처리 중입니다. 잠시 후 다시 시도해주세요."}
    )



@app.post("/prompt")
async def run_prompt_endpoint(
    prompt: str = Form(None),
    file: UploadFile = File(None),
    request: Request = None
):
    try:
        text = prompt if prompt else None
        image = file.file if file else None
        result = run_prompt(text=text, image=image)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}


@app.post("/pdfs/quiz")
async def generate_quiz_from_pdfs(files: list[UploadFile] = File(...)):
    try:
        file_objs = [file.file for file in files]
        text_chunks = extract_texts_from_multiple_pdfs(file_objs)

        if not text_chunks:
            return {"error": "PDF에서 텍스트를 추출하지 못했습니다."}

        merged_text = "\n".join(text_chunks)
        split_chunks = split_text_by_tokens(merged_text, max_tokens=8192)

        quizzes = []
        for idx, chunk in enumerate(split_chunks):
            quiz_text = generate_quiz([chunk])
            quizzes.append({
                "part": idx + 1,
                "quiz": quiz_text
            })

        return {"quizzes": quizzes}

    except Exception as e:
        return {"error": f"퀴즈 생성 중 오류 발생: {str(e)}"}
    

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
