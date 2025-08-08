# https://platform.openai.com/api-keys
from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text, model="gpt-4o", max_tokens=4096):
    try:
        # 리스트인 경우: 각 조각을 개별 요약한 후, 종합 요약
        if isinstance(text, list):
            partial_summaries = []
            for i, chunk in enumerate(text):
                print(f"[요약 중] Chunk {i + 1} / {len(text)}")
                summary = summarize_text(chunk, model=model, max_tokens=max_tokens)
                partial_summaries.append(summary)
            merged = "\n".join(partial_summaries)
            return summarize_text(merged, model=model, max_tokens=max_tokens)

        # 문자열인 경우: 기존 방식대로 요약
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "너는 문서를 읽고 각 핵심 개념을 정리해주는 요약 전문가야. "
                        "사용자에게 보기 쉽게, 개념별로 분리해서 정리하되, 각 개념을 구체적으로 최대한 자세하게 설명해줘."
                    )
                },
                {
                    "role": "user",
                    "content": f"""다음 텍스트를 아래 형식에 맞춰 요약해줘:


[요약 조건]
- 각 개념을 제목처럼 시작하고, 그 아래에 핵심 내용을 정리할 것
- 반복적 표현은 생략할 것
- 핵심 개념마다 줄을 바꿔서 작성할 것
- 각 개념의 정의 또는 특징을 명확하게 서술할 것
- 반드시 "개념: 설명" 형태를 유지할 것
- 같은 개념이 반복되면 중복 없이 대표적인 정보만 남겨줘.

본문:
{text}
"""
                }
            ],
            temperature=0.5,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content

    except Exception as e:
        print("요약 중 오류 발생:", e)
        return "요약 실패"
