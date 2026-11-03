import { api, resourceData } from '../http.js'

export async function getGenre(id) {
  const response = await api(`/api/genres/${Number(id)}`)
  return resourceData(response)
}
