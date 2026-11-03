import { login } from '../../../api/auth/login.js'
import { completeAuthentication } from './complete.js'

export async function handleLoginSubmit(form, context) {
  if (form.id !== 'auth-form' || context.state.authMode !== 'login') return false

  const values = new FormData(form)
  const credentials = {
    email: String(values.get('email') || '').trim(),
    password: String(values.get('password') || ''),
  }

  await completeAuthentication(() => login(credentials), 'Entrando...', form, context)
  return true
}
