from openai import OpenAI
from keybert import KeyBERT
from dotenv import load_dotenv
import os

kw_model = KeyBERT(model="all-MiniLM-L6-v2")

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_topic_keywords(prompt: str, top_n: int = 3) -> list[str]:
    """
    KeyBERT를 활용해 프롬프트에서 핵심 키워드 여러 개 추출
    """
    keywords = kw_model.extract_keywords(
        prompt,
        keyphrase_ngram_range=(1, 2),
        stop_words='english',
        top_n=top_n
    )
    return [kw for kw, _ in keywords] if keywords else ["일반 학습"]

def recommend_advertisement(prompt: str, model: str = "gpt-4o", max_tokens: int = 256) -> str:
    """
    사용자의 학습 프롬프트를 기반으로 관련된 추천 광고 문구를 생성
    """
    try:
        keywords = extract_topic_keywords(prompt)
        keyword_str = ", ".join(keywords)

        messages = [
            {
                "role": "system",
                "content": (
                    "너는 사용자의 학습 주제 키워드를 기반으로 적절한 강의나 교재를 추천하는 마케터야.\n"
                    "광고는 반드시 인프런 강의를 위주로 추천해줘.\n"
                    "형식은 반드시 아래와 같아야 해.:\n\n"
                    "[강의 or 교재 이름]: ...\n"
                    "[구매 링크]: "
                    "설명: ... (3줄 이내)"
                )
            },
            {
                "role": "user",
                "content": (
                    f"다음 키워드에 적합한 강의 또는 교재를 추천해줘:\n\n"
                    f"{keyword_str}"
                )
            }
        ]

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.7
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"[광고 추천 실패] {e}"
