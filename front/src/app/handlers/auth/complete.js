import { getApiError } from '../../../api/http.js'
import { getCurrentUser } from '../../../api/auth/me.js'

export async function completeAuthentication(request, loadingText, form, context) {
  const state = context.state
  const button = form.querySelector('[type="submit"]')
  button.disabled = true
  button.textContent = loadingText
  state.authError = ''

  try {
    await request()
    state.user = await getCurrentUser()
    state.globalError = ''
    await context.loadLibrary()
    state.loading = false
    context.render()
  } catch (error) {
    if (state.user) {
      state.globalError = getApiError(error)
      state.loading = false
      context.render()
    } else {
      state.authError = getApiError(error)
      button.disabled = false
      context.render()
    }
  }
}
