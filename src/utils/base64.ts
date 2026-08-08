/** Decodes a base64 string that may contain UTF-8 (e.g. accented EPG text). */
export function decodeBase64Utf8(value: string): string {
  try {
    const binary = atob(value)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return value
  }
}
