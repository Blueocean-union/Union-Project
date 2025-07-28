# https://platform.openai.com/api-keys
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text, model="gpt-4o-mini", max_tokens=8192):
    try:
        if isinstance(text, list):
            partial_summaries = []
            for i, chunk in enumerate(text):
                print(f"[요약 중] Chunk {i + 1} / {len(text)}")
                summary = summarize_text(chunk, model=model, max_tokens=max_tokens)
                partial_summaries.append(summary)

            if len(partial_summaries) >= 5:
                merged = "\n".join(partial_summaries)
                return summarize_text(merged, model=model, max_tokens=max_tokens)
            else:
                return "\n".join(partial_summaries)

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "너는 문서를 읽고 각 핵심 개념을 아주 자세하게 정리해주는 요약 전문가야.\n"
                        "반복적 표현은 생략할 것\n"
                        "같은 개념이 반복되면 대표적인 정보만 남겨 정리할 것\n"
                        "답은 한글로 해줘."
                    )
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature=0.5,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content

    except Exception as e:
        print("요약 중 오류 발생:", e)
        return "요약 실패"
