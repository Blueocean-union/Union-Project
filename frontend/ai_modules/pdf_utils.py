import pdfplumber
from typing import Union, IO
import logging
import re
import tiktoken

logging.getLogger("pdfminer").setLevel(logging.ERROR)

def split_text_by_tokens(text: str, max_tokens: int = 8192, model: str = "gpt-4o-mini") -> list[str]:
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

        if token_count > max_tokens and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = ""
        current_chunk += sentence + " "

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

def extract_texts_from_multiple_pdfs(pdf_inputs: list[Union[str, IO]], max_tokens_per_chunk: int = 8192, model: str = "gpt-4o-mini") -> list[str]:
    """
    여러 개의 PDF 파일에서 텍스트를 추출하고, 토큰 기준으로 분할한 전체 조각 리스트를 반환
    """
    all_chunks = []

    for pdf_input in pdf_inputs:
        try:
            with pdfplumber.open(pdf_input) as pdf:
                full_text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"

            chunks = split_text_by_tokens(full_text, max_tokens=max_tokens_per_chunk, model=model)
            all_chunks.extend(chunks)

        except Exception as e:
            print(f"PDF 처리 중 오류 발생: {e}")

    return all_chunks