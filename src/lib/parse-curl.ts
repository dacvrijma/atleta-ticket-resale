export interface ParsedCurl {
  url: string
  headers: Record<string, string>
  resaleUrl: string | null
}

export function parseCurl(curl: string): ParsedCurl {
  // Normalize: remove line continuations and collapse to single line
  const normalized = curl.replace(/\\\s*\n/g, " ").trim()

  // Extract URL — first quoted string after "curl"
  const urlMatch = normalized.match(/^curl\s+['"]([^'"]+)['"]/)
  const url = urlMatch ? urlMatch[1] : ""

  const headers: Record<string, string> = {}

  // Extract -H headers
  const headerRegex = /-H\s+'([^']+)'|-H\s+"([^"]+)"/g
  let match
  while ((match = headerRegex.exec(normalized)) !== null) {
    const headerStr = match[1] ?? match[2]
    const colonIndex = headerStr.indexOf(":")
    if (colonIndex !== -1) {
      const key = headerStr.slice(0, colonIndex).trim()
      const value = headerStr.slice(colonIndex + 1).trim()
      headers[key] = value
    }
  }

  // Extract --cookie as Cookie header
  const cookieMatch =
    normalized.match(/--cookie\s+'([^']+)'/) ??
    normalized.match(/--cookie\s+"([^"]+)"/)
  if (cookieMatch) {
    headers["Cookie"] = cookieMatch[1]
  }

  const resaleUrl = headers["Referer"] ?? null

  return { url, headers, resaleUrl }
}
