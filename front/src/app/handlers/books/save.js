import { createBook } from '../../../api/books/create.js'
import { updateBook } from '../../../api/books/update.js'

export async function handleBookSubmit(form, context) {
  if (form.id !== 'book-form') return false

  const state = context.state
  const values = new FormData(form)
  const currentBook = state.modal?.book || {}
  const status = String(values.get('status') || 'to_read')
  const payload = {
    title: String(values.get('title') || '').trim(),
    author: String(values.get('author') || '').trim(),
    genre_id: Number(values.get('genre_id')),
    pages: values.get('pages') ? Number(values.get('pages')) : null,
    status,
    rating: status === 'finished' && values.get('rating') ? Number(values.get('rating')) : null,
  }

  const button = form.querySelector('[type="submit"]')
  button.disabled = true
  button.textContent = 'Salvando...'

  try {
    if (currentBook.id) await updateBook(currentBook.id, payload)
    else await createBook(payload)
    await context.loadLibrary()
    state.modal = null
    context.showToast(currentBook.id ? 'Livro atualizado.' : 'Livro adicionado à estante.')
  } catch (error) {
    button.disabled = false
    button.textContent = currentBook.id ? 'Salvar alterações' : 'Adicionar à estante'
    context.showModalError(error)
  }

  return true
}
