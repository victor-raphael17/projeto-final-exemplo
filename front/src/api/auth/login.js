import { api } from '../http.js'

export function login(credentials) {
  return api('/api/login', {
    method: 'POST',
    body: credentials,
  })
}
