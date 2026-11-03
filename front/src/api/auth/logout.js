import { api } from '../http.js'

export function logout() {
  return api('/api/logout', {
    method: 'POST',
  })
}
