const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrfCookie() {
  let response
  try {
    response = await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o servidor está em execução.')
  }

  if (!response.ok) {
    throw new Error('Não foi possível iniciar uma sessão segura. Verifique se a API está disponível.')
  }
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const upperMethod = method.toUpperCase()
  const requestHeaders = { Accept: 'application/json', ...headers }
  const options = {
    method: upperMethod,
    credentials: 'include',
    headers: requestHeaders,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(upperMethod)) {
    await ensureCsrfCookie()
    const token = readCookie('XSRF-TOKEN')
    if (token) requestHeaders['X-XSRF-TOKEN'] = token
    requestHeaders['X-Requested-With'] = 'XMLHttpRequest'
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o servidor está em execução.')
  }

  const responseText = await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || `A solicitação falhou (${response.status}).`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export function resourceData(response) {
  return response?.data ?? response
}
