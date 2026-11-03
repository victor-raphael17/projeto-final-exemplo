import { api } from '../http.js'

export function createBook(book) {
  return api('/api/books', {
    method: 'POST',
    body: book,
  })
}
