import { api, resourceData } from '../http.js'

export async function getCurrentUser() {
  const response = await api('/api/me')
  return resourceData(response)
}
