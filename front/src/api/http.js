import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const http = axios.create({
  baseURL: API_BASE,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

let csrfCookieRequest = null
let csrfCookieReady = false

async function ensureCsrfCookie() {
  if (csrfCookieReady) return

  if (!csrfCookieRequest) {
    csrfCookieRequest = http
      .get('/sanctum/csrf-cookie')
      .then(() => {
        csrfCookieReady = true
      })
      .catch(() => {
        throw new Error(
          'Não foi possível iniciar uma sessão segura. Verifique se a API está disponível.',
        )
      })
      .finally(() => {
        csrfCookieRequest = null
      })
  }

  await csrfCookieRequest
}

function normalizeError(error) {
  if (!axios.isAxiosError(error)) return error

  const status = error.response?.status
  const data = error.response?.data
  const message =
    data?.message ||
    (status
      ? `A solicitação falhou (${status}).`
      : 'Não foi possível conectar à API. Confira se o servidor está em execução.')

  const normalized = new Error(message)
  normalized.status = status
  normalized.data = data
  return normalized
}

export async function api(path, options = {}) {
  const method = options.method ?? 'GET'
  const body = options.body
  const headers = options.headers ?? {}
  const upperMethod = method.toUpperCase()
  const requestHeaders = { ...headers }

  await ensureCsrfCookie()

  try {
    const response = await http.request({
      url: path,
      method: upperMethod,
      data: body,
      headers: requestHeaders,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export function resourceData(response) {
  return response?.data ?? response
}

export function getApiError(error) {
  const errors = error?.data?.errors
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors).flat().filter(Boolean)
    if (messages.length) return messages.join(' ')
  }
  return error?.message || 'Algo deu errado. Tente novamente.'
}
