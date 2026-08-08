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

/** get_vod_categories / get_series_categories return this same shape. */
export type XtreamCategory = XtreamLiveCategory

export interface XtreamVodStream {
  num: number
  name: string
  stream_type: string
  stream_id: number
  stream_icon: string
  rating: number | string
  rating_5based: number
  category_id: string
  container_extension: string
  custom_sid: string | null
  direct_source: string
}

export interface XtreamVodInfo {
  name: string
  cover_big: string
  movie_image: string
  releasedate: string
  description: string
  plot: string
  director: string
  cast: string
  genre: string
  duration: string
}

export interface XtreamVodData {
  stream_id: number
  name: string
  category_id: string
  container_extension: string
}

/** Full get_vod_info response. */
export interface XtreamVodDetails {
  info: XtreamVodInfo
  movie_data: XtreamVodData
}

export interface XtreamSeriesSeason {
  air_date: string
  episode_count: number
  id: number
  name: string
  overview: string
  season_number: number
  cover: string
  cover_big: string
}

export interface XtreamSeries {
  num: number
  name: string
  series_id: number
  cover: string
  plot: string
  cast: string
  director: string
  genre: string
  releaseDate: string
  rating: string
  rating_5based: number
  category_id: string
  seasons: XtreamSeriesSeason[]
}

export interface XtreamEpisode {
  id: number
  episode_num: number
  title: string
  container_extension: string
  season: number
  info: {
    plot?: string
    duration?: string
    movie_image?: string
    releasedate?: string
  }
}

/** Full get_series_info response — episodes are keyed by season number string. */
export interface XtreamSeriesInfo {
  seasons: XtreamSeriesSeason[]
  info: {
    name: string
    cover: string
    plot: string
    cast: string
    director: string
    genre: string
  }
  episodes: Record<string, XtreamEpisode[]>
}
