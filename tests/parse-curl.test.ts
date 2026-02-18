import { describe, it, expect } from "vitest"
import { parseCurl } from "@/lib/parse-curl"

describe("parseCurl", () => {
  it("extracts the URL from a single-line curl command", () => {
    const result = parseCurl("curl 'https://atleta.cc/api/graphql' -X POST")
    expect(result.url).toBe("https://atleta.cc/api/graphql")
  })

  it("extracts the URL from a multi-line curl command", () => {
    const result = parseCurl(
      "curl 'https://atleta.cc/api/graphql' \\\n-X POST \\\n-H 'Host: atleta.cc'"
    )
    expect(result.url).toBe("https://atleta.cc/api/graphql")
  })

  it("extracts all -H headers into a key-value record", () => {
    const result = parseCurl(
      "curl 'https://example.com' -H 'Host: atleta.cc' -H 'Content-Type: application/json' -H 'Accept: */*'"
    )
    expect(result.headers["Host"]).toBe("atleta.cc")
    expect(result.headers["Content-Type"]).toBe("application/json")
    expect(result.headers["Accept"]).toBe("*/*")
  })

  it("extracts --cookie as a Cookie header", () => {
    const result = parseCurl(
      "curl 'https://example.com' --cookie 'session=abc123; token=xyz'"
    )
    expect(result.headers["Cookie"]).toBe("session=abc123; token=xyz")
  })

  it("returns the Referer header value as resaleUrl", () => {
    const result = parseCurl(
      "curl 'https://example.com' -H 'Referer: https://atleta.cc/e/SdUE6lPR70dK/resale/SdUEqREcGTHk'"
    )
    expect(result.resaleUrl).toBe(
      "https://atleta.cc/e/SdUE6lPR70dK/resale/SdUEqREcGTHk"
    )
  })

  it("returns null for resaleUrl when no Referer header is present", () => {
    const result = parseCurl(
      "curl 'https://example.com' -H 'Host: example.com'"
    )
    expect(result.resaleUrl).toBeNull()
  })

  it("handles double-quoted header values", () => {
    const result = parseCurl(
      'curl "https://example.com" -H "Host: atleta.cc" -H "Accept: */*"'
    )
    expect(result.url).toBe("https://example.com")
    expect(result.headers["Host"]).toBe("atleta.cc")
  })

  it("handles headers with colons in the value", () => {
    const result = parseCurl(
      "curl 'https://example.com' -H 'x-xsrf-token: abc:def:ghi'"
    )
    expect(result.headers["x-xsrf-token"]).toBe("abc:def:ghi")
  })
})
