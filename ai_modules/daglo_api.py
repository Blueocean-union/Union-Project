import requests
import tempfile
import os
from typing import BinaryIO, Union, Dict
from dotenv import load_dotenv

load_dotenv("/etc/fastapi.env")

# Daglo API가 지원하는 오디오 확장자 목록
SUPPORTED_EXTENSIONS = {
    '.3gp', '.3gpp', '.ac3', '.aac', '.aiff', '.amr', '.au', 
    '.flac', '.m4a', '.mp3', '.mxf', '.opus', '.ra', '.wav', '.weba'
}

DAGLO_API_KEY = os.getenv("DAGLO_API_KEY")
DAGLO_UPLOAD_ENDPOINT = "https://apis.daglo.ai/stt/v1/async/transcripts"
DAGLO_RESULT_ENDPOINT = "https://apis.daglo.ai/stt/v1/async/transcripts/{rid}"

if not DAGLO_API_KEY:
    raise ValueError("DAGLO_API_KEY가 환경 변수에 설정되지 않았습니다.")

def get_file_extension(filename: str) -> str:
    """
    파일명에서 확장자를 추출하고 지원 여부를 확인
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"지원되지 않는 파일 확장자: {ext}. 지원 확장자: {', '.join(SUPPORTED_EXTENSIONS)}")
    return ext

def convert_audio_to_temp_file(audio_file: BinaryIO, filename: str) -> str:
    """
    오디오 파일을 임시 파일로 저장하고 경로 반환
    - audio_file (BinaryIO): 오디오 파일 객체
    - filename (str): 원본 파일명 (확장자 포함)
    """
    try:
        ext = get_file_extension(filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            tmp_file.write(audio_file.read())
            return tmp_file.name
    except Exception as e:
        raise RuntimeError(f"[오디오 저장 오류] {str(e)}")

def request_transcription(audio_file: BinaryIO, filename: str) -> Union[str, Dict[str, str]]:
    """
    다글로에 오디오 업로드하여 rid 반환
    - audio_file (BinaryIO): 업로드할 오디오 파일 객체
    - filename (str): 원본 파일명 (확장자 포함)
    """
    try:
        temp_path = convert_audio_to_temp_file(audio_file, filename)
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
        return {"error": f"전사 요청 실패: {str(e)}"}

def get_transcription_result(rid: str) -> Union[str, Dict[str, str]]:
    """
    rid를 이용해 전사 결과 조회
    """
    try:
        url = DAGLO_RESULT_ENDPOINT.format(rid=rid)
        headers = {"Authorization": f"Bearer {DAGLO_API_KEY}"}
        response = requests.get(url, headers=headers, timeout=10)  # 타임아웃 추가
        response.raise_for_status()
        result = response.json()
        if result.get("status") == "file_processing":
            return {"message": "아직 처리 중입니다. 잠시 후 다시 시도해주세요."}
        text = (
            result.get("data", {}).get("text") or
            result.get("text") or
            (result.get("sttResults") or [{}])[0].get("transcript")
        )
        if not text:
            raise ValueError("아직 텍스트가 준비되지 않았습니다.")
        return text.strip()
    except Exception as e:
        return {"error": f"전사 결과 조회 실패: {str(e)}"}