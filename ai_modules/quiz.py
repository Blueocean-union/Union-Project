from openai import OpenAI
import re
from typing import Dict, List
from dotenv import load_dotenv
import os

load_dotenv("/etc/fastapi.env")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY가 환경 변수에 설정되지 않았습니다.")

def parse_quiz_block(block: str) -> Dict[str, str]:
    """
    단일 퀴즈 블록을 파싱하여 JSON 객체로 변환
    """
    quiz: Dict[str, str] = {
        "question": "",
        "difficulty": "",
        "option1": "",
        "option2": "",
        "option3": "",
        "option4": "",
        "answer_explanation": ""
    }
    
    # 블록 전처리: 마크다운 헤더(###) 제거
    block = re.sub(r'^###.*\n', '', block, flags=re.MULTILINE).strip()

    # 전체 블록을 정규식으로 파싱
    pattern = (
        r"\[문제\]:\s*(.*?)\n"
        r"\[난이도\]:\s*(.*?)\n"
        r"\[보기1\]:\s*(.*?)\n"
        r"\[보기2\]:\s*(.*?)\n"
        r"\[보기3\]:\s*(.*?)\n"
        r"\[보기4\]:\s*(.*?)\n"
        r"\[정답과 해설\]:\s*((?:.*\n)*?.*?)(?=\[문제\]|$)"
    )
    match = re.search(pattern, block, re.DOTALL)
    
    if match:
        quiz["question"] = match.group(1).strip()
        quiz["difficulty"] = match.group(2).strip()
        quiz["option1"] = match.group(3).strip()
        quiz["option2"] = match.group(4).strip()
        quiz["option3"] = match.group(5).strip()
        quiz["option4"] = match.group(6).strip()
        quiz["answer_explanation"] = match.group(7).strip()
    else:
        return {"error": "퀴즈 블록 파싱 실패: 형식이 맞지 않습니다."}
    
    # 유효성 검증
    if not all(quiz[key] for key in quiz if key != "error"):
        return {"error": "퀴즈 블록 파싱 실패: 일부 필드가 누락되었습니다."}
    
    return quiz

def generate_quiz(text_chunks: list[str], model="gpt-4o-mini", max_tokens=8192) -> List[Dict[str, str]]:
    """
    텍스트 조각들을 바탕으로 객관식 퀴즈를 JSON 형식으로 생성
    """
    try:
        merged_text = "\n".join(text_chunks)[:8192]

        messages = [
            {
                "role": "system",
                "content": (
                    "다음 텍스트를 바탕으로 객관식 형식의 문제들을 반드시 10개 만들어줘.\n"
                    "형식은 엄격히 아래를 따라야 하며, 다른 형식은 허용되지 않음:\n"
                    "[문제]: ...\n[난이도]: 1/5에서 5/5 사이의 숫자 (예: 3/5)\n[보기1]: ...\n[보기2]: ...\n[보기3]: ...\n[보기4]: ...\n[정답과 해설]: ...\n"
                    "문제들의 난이도는 1~5를 적절히 분배해줘."
                    "각 필드는 반드시 채워져야 하며, 한글로 작성해.\n"
                    "마크다운 헤더(###)나 추가 텍스트는 절대 포함시키지 마."
                )
            },
            {"role": "user", "content": merged_text}
        ]

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.5,
            max_tokens=max_tokens
        )

        quiz_text = response.choices[0].message.content

        # 퀴즈 블록 분리
        quiz_blocks = re.split(r"(?=\[문제\]:)", quiz_text)[1:]  # [문제]:로 시작하는 블록만
        quizzes = [parse_quiz_block(block) for block in quiz_blocks]
        valid_quizzes = [q for q in quizzes if "error" not in q]

        if not valid_quizzes:
            return [{"error": "퀴즈를 생성하지 못했습니다."}]

        return valid_quizzes

    except Exception as e:
        return [{"error": f"퀴즈 생성 실패: {str(e)}"}]