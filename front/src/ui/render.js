import { renderAuthView, renderLoadingView } from './auth-view.js'
import { renderDashboardView } from './dashboard-view.js'
import { filteredBooks, renderBookList } from './book-list-view.js'

export function renderApp(root, state) {
  if (state.loading) {
    root.innerHTML = renderLoadingView()
  } else if (!state.user) {
    root.innerHTML = renderAuthView(state)
  } else {
    root.innerHTML = renderDashboardView(state)
  }
}

export function renderLibraryList(root, state) {
  const content = root.querySelector('#books-content')
  if (!content) return
  content.innerHTML = renderBookList(state)

  const count = root.querySelector('#results-count')
  const total = filteredBooks(state).length
  if (count) count.textContent = `${total} ${total === 1 ? 'livro' : 'livros'}`
}
