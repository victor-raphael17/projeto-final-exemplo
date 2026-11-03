import { register } from '../../../api/auth/register.js'
import { completeAuthentication } from './complete.js'

export async function handleRegisterSubmit(form, context) {
  if (form.id !== 'auth-form' || context.state.authMode !== 'register') return false

  const values = new FormData(form)
  const account = {
    name: String(values.get('name') || '').trim(),
    email: String(values.get('email') || '').trim(),
    password: String(values.get('password') || ''),
    password_confirmation: String(values.get('password_confirmation') || ''),
  }

  await completeAuthentication(() => register(account), 'Criando sua conta...', form, context)
  return true
}
