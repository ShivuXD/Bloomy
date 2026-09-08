/**
 * Phonics Speech Normalizer:
 * Converts child-facing phonics notations (e.g. /B/, /C/, /M/, [B], *B*)
 * into clean, natural spoken phrases for Inworld TTS.
 * Peco pronounces the target sound/letter naturally and NEVER pronounces
 * punctuation such as "slash", "bracket", "backslash", or "asterisk".
 * Natural punctuation (. , ! ? ' ") is preserved for prosody.
 */
export function normalizePhonicsForSpeech(text: string): string {
  if (!text) return '';

  let result = text;

  // 1. Replace phonetic slashes /X/ with letter/phoneme (e.g., /B/ -> B, /C/ -> C, /sh/ -> sh)
  result = result.replace(/\/([A-Za-z0-9\-_]+)\//g, '$1');

  // 2. Replace phonetic brackets/asterisks [X], (X), *X*, \X\ with letter
  result = result.replace(/\[([A-Za-z0-9\-_]+)\]/g, '$1');
  result = result.replace(/\\([A-Za-z0-9\-_]+)\\/g, '$1');
  result = result.replace(/\*([A-Za-z0-9\-_]+)\*/g, '$1');
  result = result.replace(/\(([A-Za-z0-9\-_])\)/g, '$1');

  // 3. Remove isolated forward/backward slashes next to letters e.g. "/B " or "with /B?"
  result = result.replace(/(?:^|\s)\/([A-Za-z])(?:\s|[.,!?]|$)/g, (match, letter) => {
    return match.replace(`/${letter}`, letter);
  });
  result = result.replace(/(?:^|\s)\\([A-Za-z])(?:\s|[.,!?]|$)/g, (match, letter) => {
    return match.replace(`\\${letter}`, letter);
  });

  // 4. Remove any stray slashes or asterisks that could be read by TTS
  result = result.replace(/[*\\\/]/g, ' ');

  // 5. Clean up redundant spaces while preserving sentence structure
  return result.replace(/\s+/g, ' ').trim();
}
