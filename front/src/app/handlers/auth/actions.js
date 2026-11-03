import { getApiError } from '../../../api/http.js'
import { logout } from '../../../api/auth/logout.js'

export async function handleAuthAction(action, context) {
  const state = context.state
  const render = context.render

  if (action === 'auth-toggle') {
    state.authMode = state.authMode === 'login' ? 'register' : 'login'
    state.authError = ''
    state.globalError = ''
    render()
    return true
  }

  if (action !== 'logout') return false

  try {
    await logout()
  } catch (error) {
    if (error.status !== 401) state.globalError = getApiError(error)
  }

  state.user = null
  state.books = []
  state.genres = []
  state.modal = null
  state.authMode = 'login'
  render()
  return true
}
