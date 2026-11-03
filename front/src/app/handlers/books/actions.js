import { getApiError } from '../../../api/http.js'
import { deleteBook } from '../../../api/books/delete.js'
import { getBook } from '../../../api/books/show.js'

export async function handleBookAction(action, element, context) {
  const state = context.state
  const render = context.render

  if (action === 'new-book') {
    state.modal = { type: 'book', book: {} }
    render()
    return true
  }

  if (action === 'edit-book') {
    element.disabled = true
    try {
      state.modal = { type: 'book', book: await getBook(element.dataset.id) }
      render()
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
    return true
  }

  if (action !== 'delete-book') return false

  const book = state.books.find((item) => Number(item.id) === Number(element.dataset.id))
  if (!book || !window.confirm(`Excluir “${book.title}” da sua estante?`)) return true
  element.disabled = true

  try {
    await deleteBook(book.id)
    await context.loadLibrary()
    context.showToast('Livro removido da estante.')
  } catch (error) {
    state.globalError = getApiError(error)
    render()
  }
  return true
}
