import tempfile
import torchaudio
import os
from typing import BinaryIO
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def convert_audio_to_wav_fileobj(audio_file: BinaryIO) -> str:
    """
    다양한 오디오 포맷을 WAV로 변환 (ffmpeg 없이 torchaudio 사용)

    Parameters:
        audio_file (BinaryIO): 오디오 파일 객체 (예: UploadFile.file)

    Returns:
        str: 변환된 WAV 파일 경로
    """
    try:
        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=".tmp") as tmp_input:
            tmp_input.write(audio_file.read())
            tmp_input_path = tmp_input.name

        # torchaudio로 로드 및 저장
        waveform, sample_rate = torchaudio.load(tmp_input_path)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
            wav_path = tmp_wav.name
            torchaudio.save(wav_path, waveform, sample_rate)

        os.remove(tmp_input_path)
        return wav_path

    except Exception as e:
        raise RuntimeError(f"[오디오 변환 오류] {e}")

def transcribe_audio_file(audio_file: BinaryIO) -> str:
    """
    오디오 파일 객체를 Whisper API에 적합하게 변환 후 전사

    Parameters:
        audio_file (BinaryIO): 오디오 파일 객체

    Returns:
        str: 인식된 텍스트
    """
    try:
        wav_path = convert_audio_to_wav_fileobj(audio_file)
        with open(wav_path, "rb") as wav_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=wav_file
            )
        os.remove(wav_path)
        return response.text
    except Exception as e:
        print("음성 인식 중 오류 발생:", e)
        return ""
