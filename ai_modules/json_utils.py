import json
import re

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


def save_problem_to_json(problem_text: str, output_path="problem.json"):
    try:
        # 각 항목 추출
        pattern = r"\[문제 유형\]:\s*(.*?)\n\[문제 설명\]:\s*(.*?)\n\[정답 또는 해설\]:\s*(.*)"
        match = re.search(pattern, problem_text, re.DOTALL)

        if not match:
            raise ValueError("문제 포맷이 맞지 않습니다.")

        problem_data = {
            "문제 유형": match.group(1).strip(),
            "문제 설명": match.group(2).strip(),
            "정답 또는 해설": match.group(3).strip()
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(problem_data, f, ensure_ascii=False, indent=4)

        print(f"문제 저장 완료: {output_path}")

    except Exception as e:
        print("문제 저장 오류:", e)

if __name__ == "__main__":
    # 요약 테스트
    test_summary = """
    자료구조는 데이터를 효율적으로 저장하고 처리하는 방법이다.
    예를 들어 배열은 고정된 메모리 공간에 데이터를 저장하며 빠른 접근이 가능하다.
    """
    save_summary_to_json(test_summary, "test_summary.json")

    # 문제 저장 테스트
    test_problem = """[문제 유형]: 단답형
[문제 설명]: 자바에서 클래스 상속 시 사용하는 키워드는 무엇인가?
[정답 또는 해설]: extends 키워드를 사용하여 클래스 상속을 구현한다.
"""
    save_problem_to_json(test_problem, "test_problem.json")
