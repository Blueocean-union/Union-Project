import os
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_quiz(text_chunks: list[str], model="gpt-4o-mini", max_tokens=8192) -> str:
    """
    텍스트 조각들을 바탕으로 객관식 퀴즈 생성 요청

    Parameters:
        text_chunks (list[str]): 분할된 텍스트 리스트
        model (str): 사용할 OpenAI 모델
        max_tokens (int): 최대 응답 토큰 수

    Returns:
        str: 퀴즈 결과 텍스트
    """
    try:
        merged_text = "\n".join(text_chunks)

        messages = [
            {
                "role": "system",
                "content": (
                    "다음 텍스트를 바탕으로 객관식 형식의 문제들을 만들어줘.\n"
                    "핵심 개념 위주로 10개의 문제를 만들어야해.\n"
                    "각 문제마다 난이도를 5점 만점 기준으로 나타내줘."
                    "형식은 반드시 아래와 같이 맞춰줘.\n"
                    "[문제]:\n"
                    "[난이도]: "
                    "[보기1]: ...\n"
                    "[보기2]: ...\n"
                    "[보기3]: ...\n"
                    "[보기4]: ...\n"
                    "[정답과 해설]: ...\n"
                    "답은 반드시 한글로 해줘."
                )
            },
            {
                "role": "user",
                "content": merged_text[:8192]  # 토큰 제한 고려
            }
        ]

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.5,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content

    except Exception as e:
        print("[퀴즈 생성 실패]", e)
        return "[퀴즈 생성 실패]"
