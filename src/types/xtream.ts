export interface XtreamUserInfo {
  username: string
  password: string
  message: string
  auth: 0 | 1
  status: string
  exp_date: string | null
  is_trial: '0' | '1'
  active_cons: string
  created_at: string
  max_connections: string
  allowed_output_formats: string[]
}

export interface XtreamServerInfo {
  url: string
  port: string
  https_port: string
  server_protocol: string
  rtmp_port: string
  timezone: string
  timestamp_now: number
  time_now: string
}

export interface XtreamAuthResponse {
  user_info: XtreamUserInfo
  server_info: XtreamServerInfo
}

export interface XtreamCredentials {
  serverUrl: string
  username: string
  password: string
}
