import { getApiError } from '../../../api/http.js'
import { deleteGenre } from '../../../api/genres/delete.js'
import { getGenre } from '../../../api/genres/show.js'

export async function handleGenreAction(action, element, context) {
  const state = context.state
  const render = context.render

  if (action === 'open-genres') {
    state.modal = { type: 'genres', editGenre: null }
    render()
    return true
  }

  if (action === 'new-genre') {
    state.modal = { type: 'genres', editGenre: { name: '', description: '' } }
    render()
    return true
  }

  if (action === 'edit-genre') {
    element.disabled = true
    try {
      state.modal = { type: 'genres', editGenre: await getGenre(element.dataset.id) }
      render()
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
    return true
  }

  if (action === 'delete-genre') {
    const genre = state.genres.find((item) => Number(item.id) === Number(element.dataset.id))
    if (!genre) return true

    const count = state.books.filter(
      (book) => String(book.genre?.id ?? book.genre_id) === String(genre.id),
    ).length
    const consequence = count
      ? ` Isso também excluirá ${count} ${count === 1 ? 'livro associado' : 'livros associados'}.`
      : ''
    if (!window.confirm(`Excluir a categoria “${genre.name}”?${consequence}`)) return true
    element.disabled = true

    try {
      await deleteGenre(genre.id)
      if (state.genreFilter === String(genre.id)) state.genreFilter = 'all'
      await context.loadLibrary()
      state.modal = { type: 'genres', editGenre: null }
      context.showToast('Categoria removida.')
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
    return true
  }

  if (action === 'cancel-genre-edit') {
    state.modal = { type: 'genres', editGenre: null }
    render()
    return true
  }

  return false
}
