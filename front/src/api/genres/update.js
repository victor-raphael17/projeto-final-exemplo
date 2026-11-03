import { api } from '../http.js'

export function updateGenre(id, genre) {
  return api(`/api/genres/${Number(id)}`, {
    method: 'PUT',
    body: genre,
  })
}
