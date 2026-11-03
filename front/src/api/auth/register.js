import { api } from '../http.js'

export function register(account) {
  return api('/api/register', {
    method: 'POST',
    body: account,
  })
}
