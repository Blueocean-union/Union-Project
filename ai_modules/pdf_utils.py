import pdfplumber
from typing import Union, IO
import logging
import re
import tiktoken


logging.getLogger("pdfminer").setLevel(logging.ERROR)

def split_text_by_tokens(text: str, max_tokens: int = 3500, model: str = "gpt-3.5-turbo") -> list[str]:
    """
    텍스트를 문장 단위로 분할하고, max_tokens 이하로 묶어서 리스트 반환
    """
    encoding = tiktoken.encoding_for_model(model)
    sentences = re.split(r'(?<=[.?!])\s+', text.strip())

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        new_chunk = current_chunk + sentence + " "
        token_count = len(encoding.encode(new_chunk))

        if token_count > max_tokens:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
        current_chunk += sentence + " "

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

def extract_text_from_pdf(pdf_input: Union[str, IO], max_tokens_per_chunk: int = 3500) -> list[str]:
    """
    PDF 파일에서 텍스트를 추출하고, 토큰 수 기준으로 문장 단위 분할하여 리스트로 반환
    """
    try:
        with pdfplumber.open(pdf_input) as pdf:
            full_text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"

        return split_text_by_tokens(full_text, max_tokens=max_tokens_per_chunk)

    except Exception as e:
        print("PDF 텍스트 추출 중 오류 발생:", e)
        return []
    
if __name__ == "__main__":
    # 테스트 실행
    with open("C:/Users/SSO/OneDrive/바탕 화면/ModelTest/Chapter12.pdf", "rb") as file_obj:
        chunks = extract_text_from_pdf(file_obj)
        print("문장 단위로 토큰 기준 분할된 텍스트 조각 수:", len(chunks))
        for i, chunk in enumerate(chunks):
            print(f"\n[Chunk {i+1}]\n{chunk[:100000]}...\n")
