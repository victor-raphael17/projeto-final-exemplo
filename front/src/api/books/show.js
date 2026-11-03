import { api, resourceData } from '../http.js'

export async function getBook(id) {
  const response = await api(`/api/books/${Number(id)}`)
  return resourceData(response)
}
