from typing import Optional, BinaryIO
import base64
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run_prompt(
    text: Optional[str] = None,
    image: Optional[BinaryIO] = None,
    model: str = "gpt-4o-mini",
    max_tokens: int = 8192
) -> str:
    """
    텍스트, 이미지, 또는 둘 다 기반으로 텍스트를 생성합니다.

    Parameters:
        text (str): 텍스트 생성에 활용할 텍스트 프롬프트 (optional)
        image (BinaryIO): 텍스트 생성에 활용할 이미지 파일 객체 (optional)
        model (str): 사용할 OpenAI 모델
        max_tokens (int): 최대 토큰 수

    Returns:
        str: 생성된 텍스트
    """
    try:
        if not text and not image:
            raise ValueError("text 또는 image 중 적어도 하나는 제공되어야 합니다.")

        system_prompt = "너는 주어진 텍스트나 이미지를 분석해서 간결하고 정확하게 답변하는 도우미야. 그리고 답은 한글로 해줘."

        base64_image = None
        if image:
            image_bytes = image.read()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

        if text and base64_image:
            messages = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"다음 텍스트와 이미지를 참고해서 답을 해줘:\n\n{text}"},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ]

        elif text:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ]

        elif base64_image:
            messages = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 이미지를 분석하고 그에 대해 간단히 설명해줘."},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ]

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"[오류] 텍스트 생성 실패: {e}"

