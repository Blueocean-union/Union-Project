from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
import json

from pdf_utils import extract_texts_from_multiple_pdfs, split_text_by_tokens
from daglo_api import request_transcription, get_transcription_result
from openai_api import summarize_text
from prompt import run_prompt
from quiz import generate_quiz

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
    try:
        result = request_transcription(file.file, filename=file.filename)
        if isinstance(result, dict) and "error" in result:
            return JSONResponse(status_code=500, content=result)
        return {"rid": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"오디오 업로드 중 오류: {str(e)}"})

@app.get("/audio/result/{rid}")
async def get_audio_result(rid: str):
    try:
        result = get_transcription_result(rid)
        if isinstance(result, dict):
            if "error" in result:
                return JSONResponse(status_code=500, content=result)
            return JSONResponse(status_code=202, content=result)
        if result:
            return {"text": result}
        return JSONResponse(
            status_code=202,
            content={"message": "아직 처리 중입니다. 잠시 후 다시 시도해주세요."}
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"전사 결과 조회 중 오류: {str(e)}"})

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
async def generate_quiz_from_pdfs(
    files: list[UploadFile] = File(...),
    key_names: str = Form('{"list_key": "quizzes", "question_key": "question", "difficulty_key": "difficulty", "option1_key": "option1", "option2_key": "option2", "option3_key": "option3", "option4_key": "option4", "answer_explanation_key": "answer_explanation"}')
):
    try:
        # key_names 파싱
        try:
            key_config = json.loads(key_names)
            list_key = key_config.get("list_key", "quizzes")
            question_key = key_config.get("question_key", "question")
            difficulty_key = key_config.get("difficulty_key", "difficulty")
            option1_key = key_config.get("option1_key", "option1")
            option2_key = key_config.get("option2_key", "option2")
            option3_key = key_config.get("option3_key", "option3")
            option4_key = key_config.get("option4_key", "option4")
            answer_explanation_key = key_config.get("answer_explanation_key", "answer_explanation")
            
            # 키 이름 유효성 검증
            for key in [list_key, question_key, difficulty_key, option1_key, option2_key, option3_key, option4_key, answer_explanation_key]:
                if not isinstance(key, str) or not key.strip() or " " in key:
                    return {"error": "키 이름은 공백 없는 문자열이어야 합니다."}
        except json.JSONDecodeError:
            return {"error": "key_names는 유효한 JSON 문자열이어야 합니다."}

        file_objs = [file.file for file in files]
        text_chunks = extract_texts_from_multiple_pdfs(file_objs)

        if not text_chunks:
            return {"error": "PDF에서 텍스트를 추출하지 못했습니다."}

        merged_text = "\n".join(text_chunks)
        split_chunks = split_text_by_tokens(merged_text, max_tokens=8192)

        result_list = []
        for chunk in split_chunks:
            quizzes = generate_quiz([chunk])
            if "error" in quizzes[0]:
                return {"error": quizzes[0]["error"]}
            for quiz in quizzes:
                formatted_quiz = {
                    question_key: quiz["question"],
                    difficulty_key: quiz["difficulty"],
                    option1_key: quiz["option1"],
                    option2_key: quiz["option2"],
                    option3_key: quiz["option3"],
                    option4_key: quiz["option4"],
                    answer_explanation_key: quiz["answer_explanation"]
                }
                result_list.append(formatted_quiz)

        return {list_key: result_list}

    except Exception as e:
        return {"error": f"퀴즈 생성 중 오류 발생: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)