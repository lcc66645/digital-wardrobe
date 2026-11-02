/**
 * 敏感词校验（占位实现，真实可运行）。
 * 内置最小词库，后续可替换为远程词库/审核服务，调用方无需改动。
 */
const SENSITIVE_WORDS: readonly string[] = [
  '违禁',
  '色情',
  '暴力',
  '赌博',
  '诈骗',
];

/** 判断文本是否包含敏感词（忽略大小写） */
export function containsSensitive(text: string): boolean {
  const lower = text.toLowerCase();
  return SENSITIVE_WORDS.some((word) => lower.includes(word.toLowerCase()));
}
