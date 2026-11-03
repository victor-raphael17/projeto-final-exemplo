import { api } from '../http.js'

export function createGenre(genre) {
  return api('/api/genres', {
    method: 'POST',
    body: genre,
  })
}
