from typing import Optional, BinaryIO
import base64
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_problem(
    text: Optional[str] = None,
    image: Optional[BinaryIO] = None,
    model: str = "gpt-4o",
    max_tokens: int = 4096
) -> str:
    """
    텍스트, 이미지, 또는 둘 다 기반으로 문제를 생성합니다.

    Parameters:
        text (str): 문제 생성에 활용할 텍스트 프롬프트 (optional)
        image (BinaryIO): 문제 생성에 활용할 이미지 파일 객체 (optional)
        model (str): 사용할 OpenAI 모델
        max_tokens (int): 최대 토큰 수

    Returns:
        str: 생성된 문제 텍스트
    """
    try:
        if text and image:
            # 텍스트 + 이미지 기반 문제 생성
            base64_image = base64.b64encode(image.read()).decode("utf-8")
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"다음 텍스트와 이미지를 기반으로 문제를 생성해줘:\n\n{text}\n\n"
                                "[문제 유형]:\n[문제 설명]:\n[정답 또는 해설]:\n\n"
                                "형식은 절대로 바꾸지 말고, 항목 이름은 그대로 출력해."
                            )
                        },
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ]

        elif text:
            # 텍스트만 기반 문제 생성
            messages = [
                {
                    "role": "system",
                    "content": (
                        "너는 문제를 잘 만드는 출제자야. "
                        "아래의 형식에 맞춰 출력해:\n\n"
                        "[문제 유형]:\n[문제 설명]:\n[정답 또는 해설]:\n\n"
                        "형식은 절대로 바꾸지 말고, 항목 이름은 그대로 출력해."
                    )
                },
                {
                    "role": "user",
                    "content": text
                }
            ]

        elif image:
            # 이미지만 기반 문제 생성
            base64_image = base64.b64encode(image.read()).decode("utf-8")
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "이미지를 분석한 후 아래 형식 그대로 비슷한 유형의 문제를 만들어줘:\n\n"
                                "[문제 유형]:\n[문제 설명]:\n[정답 또는 해설]:\n\n"
                                "형식은 절대로 바꾸지 말고, 항목 이름은 그대로 출력해."
                            )
                        },
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ]

        else:
            raise ValueError("text 또는 image 중 적어도 하나는 제공되어야 합니다.")

        # GPT 호출
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"[오류] 문제 생성 실패: {e}"
