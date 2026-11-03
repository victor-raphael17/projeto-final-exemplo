import { renderLibraryList } from '../../ui/render.js'

export function handleLibraryClick(event, element, context) {
  const state = context.state
  const render = context.render

  if (element.dataset.filter) {
    state.filter = element.dataset.filter
    render()
    return true
  }

  if (element.dataset.action === 'close-modal') {
    state.modal = null
    render()
    return true
  }

  if (element.dataset.action === 'backdrop-close' && event.target === element) {
    state.modal = null
    render()
    return true
  }

  if (element.dataset.action === 'clear-filters') {
    state.filter = 'all'
    state.genreFilter = 'all'
    state.search = ''
    render()
    return true
  }

  return false
}

export function handleLibraryInput(event, root, state) {
  if (event.target.id !== 'search-input') return false
  state.search = event.target.value
  renderLibraryList(root, state)
  return true
}

export function handleLibraryChange(event, root, state) {
  if (event.target.id === 'genre-filter') {
    state.genreFilter = event.target.value
    renderLibraryList(root, state)
    return true
  }

  if (event.target.name === 'status' && state.modal?.type === 'book') {
    const ratingField = root.querySelector('.rating-field')
    if (ratingField) ratingField.hidden = event.target.value !== 'finished'
    return true
  }

  return false
}
