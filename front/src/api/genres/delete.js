import { api } from '../http.js'

export function deleteGenre(id) {
  return api(`/api/genres/${Number(id)}`, {
    method: 'DELETE',
  })
}
