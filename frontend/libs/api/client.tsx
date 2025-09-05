// frontend/libs/api/client.ts
// 공통 API 클라이언트 (fetch 기반). baseURL은 .env 또는 EXPO_PUBLIC_API_BASE_URL 사용.
const DEFAULT_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  // 필요시 로컬 개발용 기본값
  'http://localhost:8080';

export const BASE_URL = DEFAULT_BASE.replace(/\/$/, '');

type Json = Record<string, any>;

export async function http<T = any>(
  path: string,
  init: RequestInit & { query?: Record<string, string | number | boolean | undefined> } = {}
): Promise<T> {
  const { query, headers, ...rest } = init;
  const qs = query
    ? '?' +
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';

  const res = await fetch(`${BASE_URL}${path}${qs}`, {
    headers: {
      Accept: 'application/json',
      ...(headers || {}),
    },
    ...rest,
  });

  const text = await res.text();
  if (!res.ok) {
    let body: any = text;
    try {
      body = JSON.parse(text);
    } catch {}
    const msg = (body && (body.message || body.error)) || res.statusText || 'Request failed';
    throw new Error(`${res.status} ${msg}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function postForm<T = any>(
  path: string,
  form: FormData,
  query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  return http<T>(path, {
    method: 'POST',
    body: form,
    // RN fetch는 boundary 헤더를 스스로 붙임. Content-Type 수동 지정 금지!
    query,
  });
}
