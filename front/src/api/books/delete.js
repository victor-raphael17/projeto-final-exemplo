import { api } from '../http.js'

export function deleteBook(id) {
  return api(`/api/books/${Number(id)}`, {
    method: 'DELETE',
  })
}
