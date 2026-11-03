import { api, resourceData } from '../http.js'

export async function listGenres() {
  const response = await api('/api/genres')
  const genres = resourceData(response)

  return Array.isArray(genres) ? genres : []
}
