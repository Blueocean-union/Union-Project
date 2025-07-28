import json

def save_summary_to_json(summary_text, output_path="summary.json"):
    """
    summary_text 전체를 형식 가공 없이 저장
    - summary_text (str): 전체 요약 텍스트
    - output_path (str): 저장할 JSON 파일 경로
    """
    try:
        summary_dict = {
            "summary": summary_text.strip()
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(summary_dict, f, ensure_ascii=False, indent=4)

        print(f"요약 저장: {output_path}")

    except Exception as e:
        print("JSON 저장 중 오류 발생:", e)

if __name__ == "__main__":
    # 요약 테스트
    test_summary = """
    자료구조는 데이터를 효율적으로 저장하고 처리하는 방법이다.
    예를 들어 배열은 고정된 메모리 공간에 데이터를 저장하며 빠른 접근이 가능하다.
    """
    save_summary_to_json(test_summary, "test_summary.json")
