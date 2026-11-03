import { createGenre } from '../../../api/genres/create.js'
import { updateGenre } from '../../../api/genres/update.js'

export async function handleGenreSubmit(form, context) {
  if (form.id !== 'genre-form') return false

  const state = context.state
  const values = new FormData(form)
  const currentGenre = state.modal?.editGenre || {}
  const payload = {
    name: String(values.get('name') || '').trim(),
    description: String(values.get('description') || '').trim() || null,
  }
  const button = form.querySelector('[type="submit"]')
  button.disabled = true
  button.textContent = 'Salvando...'

  try {
    if (currentGenre.id) await updateGenre(currentGenre.id, payload)
    else await createGenre(payload)
    await context.loadLibrary()
    state.modal = { type: 'genres', editGenre: null }
    context.showToast(currentGenre.id ? 'Categoria atualizada.' : 'Categoria criada.')
  } catch (error) {
    button.disabled = false
    button.textContent = currentGenre.id ? 'Salvar categoria' : 'Criar categoria'
    context.showModalError(error)
  }

  return true
}
