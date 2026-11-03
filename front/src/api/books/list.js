import { api, resourceData } from '../http.js'

export async function listBooks() {
  const response = await api('/api/books')
  const books = resourceData(response)

  return Array.isArray(books) ? books : []
}
