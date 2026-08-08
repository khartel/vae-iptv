import type {
  XtreamAuthResponse,
  XtreamCredentials,
  XtreamLiveCategory,
  XtreamLiveStream,
} from '../types/xtream'

export type XtreamErrorKind = 'network' | 'auth' | 'parse'

export class XtreamApiError extends Error {
  readonly kind: XtreamErrorKind

  constructor(
    kind: XtreamErrorKind,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options)
    this.name = 'XtreamApiError'
    this.kind = kind
  }
}

export function getEnvCredentials(): XtreamCredentials {
  return {
    serverUrl: import.meta.env.VITE_XTREAM_SERVER_URL,
    username: import.meta.env.VITE_XTREAM_USERNAME,
    password: import.meta.env.VITE_XTREAM_PASSWORD,
  }
}

function buildApiUrl(
  credentials: XtreamCredentials,
  extraParams: Record<string, string> = {},
): string {
  const params = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    ...extraParams,
  })
  return `${credentials.serverUrl}/player_api.php?${params.toString()}`
}

/** Fetches a player_api.php URL and parses the JSON body, wrapping network and parse failures. */
async function fetchXtreamJson(url: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url)
  } catch (error) {
    throw new XtreamApiError(
      'network',
      'Could not reach the IPTV server. Check the server URL and your network connection.',
      { cause: error },
    )
  }

  try {
    return await response.json()
  } catch (error) {
    throw new XtreamApiError(
      'parse',
      'The server returned a response that was not valid JSON.',
      { cause: error },
    )
  }
}

function hasUserInfo(
  data: unknown,
): data is { user_info: Record<string, unknown> } {
  if (typeof data !== 'object' || data === null) return false
  const { user_info } = data as Record<string, unknown>
  return (
    typeof user_info === 'object' && user_info !== null && 'auth' in user_info
  )
}

function isXtreamAuthResponse(data: unknown): data is XtreamAuthResponse {
  if (typeof data !== 'object' || data === null) return false
  const { user_info, server_info } = data as Record<string, unknown>
  if (typeof user_info !== 'object' || user_info === null) return false
  if (typeof server_info !== 'object' || server_info === null) return false
  return 'auth' in user_info && 'url' in server_info
}

/**
 * Authenticates against the Xtream Codes API and returns account + server info.
 * Throws XtreamApiError with a `kind` of 'network', 'parse', or 'auth' depending
 * on where the failure happened, so callers can show a targeted error message.
 */
export async function login(
  credentials: XtreamCredentials = getEnvCredentials(),
): Promise<XtreamAuthResponse> {
  const data = await fetchXtreamJson(buildApiUrl(credentials))

  // Check auth status before requiring the full response shape: this provider
  // (and Xtream panels generally) returns a bare `{"user_info":{"auth":0}}`
  // with no `server_info` at all for invalid credentials, so a strict shape
  // check would misreport a wrong password as a malformed response.
  if (!hasUserInfo(data)) {
    throw new XtreamApiError(
      'parse',
      'The server response was missing expected fields.',
    )
  }

  if (data.user_info.auth !== 1) {
    const message = data.user_info.message
    throw new XtreamApiError(
      'auth',
      typeof message === 'string' && message
        ? message
        : 'Authentication failed. Check your username and password.',
    )
  }

  if (!isXtreamAuthResponse(data)) {
    throw new XtreamApiError(
      'parse',
      'Authenticated, but the server response was missing expected account/server fields.',
    )
  }

  return data
}

export async function validateConnection(
  credentials?: XtreamCredentials,
): Promise<boolean> {
  try {
    await login(credentials)
    return true
  } catch {
    return false
  }
}

export async function getLiveCategories(
  credentials: XtreamCredentials = getEnvCredentials(),
): Promise<XtreamLiveCategory[]> {
  const url = buildApiUrl(credentials, { action: 'get_live_categories' })
  const data = await fetchXtreamJson(url)

  if (!Array.isArray(data)) {
    throw new XtreamApiError(
      'parse',
      'Expected a list of live categories but got something else.',
    )
  }

  return data as XtreamLiveCategory[]
}

/** Omit categoryId to fetch every live stream across all categories. */
export async function getLiveStreams(
  categoryId?: string,
  credentials: XtreamCredentials = getEnvCredentials(),
): Promise<XtreamLiveStream[]> {
  const url = buildApiUrl(credentials, {
    action: 'get_live_streams',
    ...(categoryId ? { category_id: categoryId } : {}),
  })
  const data = await fetchXtreamJson(url)

  if (!Array.isArray(data)) {
    throw new XtreamApiError(
      'parse',
      'Expected a list of live streams but got something else.',
    )
  }

  return data as XtreamLiveStream[]
}

/** Builds a playable stream URL for a live channel, per Xtream's URL convention. */
export function buildLiveStreamUrl(
  streamId: number,
  extension: 'm3u8' | 'ts',
  credentials: XtreamCredentials = getEnvCredentials(),
): string {
  return `${credentials.serverUrl}/live/${credentials.username}/${credentials.password}/${streamId}.${extension}`
}
