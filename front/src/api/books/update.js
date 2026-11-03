import { api } from '../http.js'

export function updateBook(id, book) {
  return api(`/api/books/${Number(id)}`, {
    method: 'PUT',
    body: book,
  })
}
