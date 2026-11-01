/**
 * JSON 文本字段工具
 * SQLite 不支持数组/Json 类型，seasons、tags 等以 String 存储 JSON 文本，
 * 由 service 层在写入前 stringify、读取后 parse，对外仍呈现数组，
 * 切换 PostgreSQL 时该序列化逻辑无需改动。
 */

/** 将数组序列化为 JSON 文本；空值安全返回 "[]" */
export function stringifyArray(value: unknown[] | null | undefined): string {
  if (!Array.isArray(value)) {
    return '[]';
  }
  return JSON.stringify(value);
}

/** 将 JSON 文本解析为数组；任何非法内容或非数组均安全回退为 [] */
export function parseArray<T>(raw: string | null | undefined): T[] {
  if (typeof raw !== 'string' || raw.length === 0) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
