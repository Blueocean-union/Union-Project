import requests
import tempfile
import os
from typing import BinaryIO
from dotenv import load_dotenv
load_dotenv()

DAGLO_API_KEY = os.getenv("DAGLO_API_KEY")
DAGLO_UPLOAD_ENDPOINT = "https://apis.daglo.ai/stt/v1/async/transcripts"
DAGLO_RESULT_ENDPOINT = "https://apis.daglo.ai/stt/v1/async/transcripts/{rid}"

def convert_audio_to_temp_file(audio_file: BinaryIO, suffix=".mp3") -> str:
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(audio_file.read())
            return tmp_file.name
    except Exception as e:
        raise RuntimeError(f"[오디오 저장 오류] {e}")

def request_transcription(audio_file: BinaryIO) -> str:
    """
    다글로에 오디오 업로드하여 rid 반환
    """
    try:
        temp_path = convert_audio_to_temp_file(audio_file)

        with open(temp_path, "rb") as f:
            files = {"file": f}
            headers = {"Authorization": f"Bearer {DAGLO_API_KEY}"}

            response = requests.post(DAGLO_UPLOAD_ENDPOINT, headers=headers, files=files)
            response.raise_for_status()
            result = response.json()

            rid = result.get("data", {}).get("rid") or result.get("rid")
            if not rid:
                raise ValueError("응답에서 rid를 찾을 수 없습니다.")

        os.remove(temp_path)
        return rid

    except Exception as e:
        print("[업로드 실패]", e)
        return ""

def get_transcription_result(rid: str) -> str:
    """
    rid를 이용해 전사 결과 조회
    """
    try:
        url = DAGLO_RESULT_ENDPOINT.format(rid=rid)
        headers = {"Authorization": f"Bearer {DAGLO_API_KEY}"}

        response = requests.get(url, headers=headers)
        response.raise_for_status()
        result = response.json()

        # 여러 fallback 케이스를 고려한 텍스트 추출
        text = (
            result.get("data", {}).get("text") or
            result.get("text") or
            (result.get("sttResults") or [{}])[0].get("transcript")
        )

        if not text:
            print("[디버그] fallback 실패. 전체 응답:", result)
            raise ValueError("아직 텍스트가 준비되지 않았습니다.")

        return text.strip()

    except Exception as e:
        print("[결과 조회 실패]", e)
        return ""
