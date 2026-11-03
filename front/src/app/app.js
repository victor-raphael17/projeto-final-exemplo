import { getCurrentUser } from '../api/auth/me.js'
import { listBooks } from '../api/books/list.js'
import { listGenres } from '../api/genres/list.js'
import { getApiError } from '../api/http.js'
import { createInitialState } from './state.js'
import { handleAuthAction } from './handlers/auth/actions.js'
import { handleLoginSubmit } from './handlers/auth/login.js'
import { handleRegisterSubmit } from './handlers/auth/register.js'
import { handleBookAction } from './handlers/books/actions.js'
import { handleBookSubmit } from './handlers/books/save.js'
import { handleGenreAction } from './handlers/genres/actions.js'
import { handleGenreSubmit } from './handlers/genres/save.js'
import { handleLibraryChange, handleLibraryClick, handleLibraryInput } from './handlers/library.js'
import { renderApp } from '../ui/render.js'

export function startApp(root = document.querySelector('#app')) {
  const state = createInitialState()
  const render = () => renderApp(root, state)

  async function loadLibrary() {
    const [books, genres] = await Promise.all([listBooks(), listGenres()])
    state.books = books
    state.genres = genres
  }

  function showToast(message) {
    state.toast = message
    render()
    window.clearTimeout(showToast.timeout)
    showToast.timeout = window.setTimeout(() => {
      state.toast = ''
      render()
    }, 3000)
  }

  function showModalError(error) {
    const target = root.querySelector('.modal-error')
    if (target) target.textContent = getApiError(error)
  }

  const handlers = { state, render, loadLibrary, showToast, showModalError }

  root.addEventListener('click', async (event) => {
    const element = event.target.closest('[data-action], [data-filter]')
    if (!element) return

    if (await handleAuthAction(element.dataset.action, handlers)) return
    if (await handleBookAction(element.dataset.action, element, handlers)) return
    if (await handleGenreAction(element.dataset.action, element, handlers)) return
    handleLibraryClick(event, element, handlers)
  })

  root.addEventListener('input', (event) => {
    handleLibraryInput(event, root, state)
  })

  root.addEventListener('change', (event) => {
    handleLibraryChange(event, root, state)
  })

  root.addEventListener('submit', async (event) => {
    const form = event.target
    if (form.id === 'auth-form') {
      event.preventDefault()
      if (state.authMode === 'register') await handleRegisterSubmit(form, handlers)
      else await handleLoginSubmit(form, handlers)
      return
    }

    if (form.id === 'book-form') {
      event.preventDefault()
      await handleBookSubmit(form, handlers)
      return
    }

    if (form.id === 'genre-form') {
      event.preventDefault()
      await handleGenreSubmit(form, handlers)
    }
  })

  async function initialize() {
    try {
      state.user = await getCurrentUser()
      await loadLibrary()
    } catch (error) {
      if (error.status !== 401 && error.status !== 419) state.globalError = getApiError(error)
    }
    state.loading = false
    render()
  }

  render()
  initialize()
}
