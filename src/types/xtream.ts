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

export interface XtreamLiveCategory {
  category_id: string
  category_name: string
  parent_id: number
}

export interface XtreamLiveStream {
  num: number
  name: string
  stream_type: string
  stream_id: number
  stream_icon: string
  epg_channel_id: string | null
  category_id: string
  custom_sid: string | null
  tv_archive: number
  direct_source: string
  tv_archive_duration: number
}

/** Raw get_short_epg entry — title/description are base64-encoded. */
export interface XtreamEpgListing {
  id: number
  epg_id: number
  title: string
  lang: string
  start: string
  end: string
  description: string
  channel_id: string
  start_timestamp: number
  stop_timestamp: number
}
