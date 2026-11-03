import { readingStatuses } from '../domain/reading-status.js'
import { escapeHtml } from './escape-html.js'
import { icon } from './icons.js'

export function filteredBooks(state) {
  const query = state.search.trim().toLocaleLowerCase('pt-BR')

  return state.books.filter((book) => {
    const status = book.status || 'to_read'
    const genreId = book.genre?.id ?? book.genre_id
    const matchesStatus = state.filter === 'all' || status === state.filter
    const matchesGenre = state.genreFilter === 'all' || String(genreId) === state.genreFilter
    const searchableText = [book.title, book.author, book.genre?.name]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('pt-BR')
    const matchesSearch = !query || searchableText.includes(query)

    return matchesStatus && matchesGenre && matchesSearch
  })
}

function renderRating(book) {
  if (book.status !== 'finished' || !book.rating) return ''

  const score = Number(book.rating)
  const fullStars = '★'.repeat(score)
  const emptyStars = '☆'.repeat(5 - score)

  return `
    <span class="book-rating" aria-label="Nota ${score} de 5">
      ${fullStars}<span>${emptyStars}</span>
    </span>`
}

function renderBookCard(book, index) {
  const status = readingStatuses[book.status] || readingStatuses.to_read
  const title = escapeHtml(book.title || 'Sem título')
  const author = escapeHtml(book.author || 'Autor desconhecido')
  const genre = escapeHtml(book.genre?.name || 'Sem categoria')
  const pageCount = book.pages ? `${escapeHtml(book.pages)} páginas` : 'Páginas não informadas'

  return `
    <article class="book-card">
      <div class="book-cover cover-${index % 5}">
        <span class="cover-mark">${icon('book', 24)}</span>
        <span class="cover-title">${title}</span>
        <span class="cover-author">${author}</span>
        <span class="cover-lines"></span>
      </div>

      <div class="book-card-body">
        <div class="book-card-topline">
          <span class="status-chip ${status.className}">
            <i></i>${status.label}
          </span>
          <span class="book-genre">${genre}</span>
        </div>

        <h3>${title}</h3>
        <p class="book-author">${author}</p>

        <div class="book-meta">
          <span>${icon('book', 15)} ${pageCount}</span>
          ${renderRating(book)}
        </div>

        <div class="book-actions">
          <button
            class="text-action"
            type="button"
            data-action="edit-book"
            data-id="${Number(book.id)}"
          >
            ${icon('edit', 15)} Editar
          </button>
          <button
            class="icon-button danger-action"
            type="button"
            aria-label="Excluir ${title}"
            title="Excluir livro"
            data-action="delete-book"
            data-id="${Number(book.id)}"
          >
            ${icon('trash', 17)}
          </button>
        </div>
      </div>
    </article>`
}

function renderEmptyLibrary() {
  return `
    <div class="empty-state">
      <div class="empty-illustration">${icon('book', 38)}</div>
      <span class="eyebrow">SUA JORNADA COMEÇA AGORA</span>
      <h3>Sua estante está esperando a primeira história.</h3>
      <p>Adicione um livro para organizar suas leituras e acompanhar cada página.</p>
      <button class="button button-primary" type="button" data-action="new-book">
        ${icon('plus', 18)} Adicionar primeiro livro
      </button>
    </div>`
}

function renderNoMatches() {
  return `
    <div class="empty-filter">
      <div class="empty-illustration small">${icon('search', 26)}</div>
      <h3>Nenhum livro encontrado</h3>
      <p>Tente mudar os filtros ou buscar por outro título.</p>
      <button class="text-action" type="button" data-action="clear-filters">
        Limpar filtros
      </button>
    </div>`
}

export function renderBookList(state) {
  const books = filteredBooks(state)

  if (!state.books.length) return renderEmptyLibrary()
  if (!books.length) return renderNoMatches()

  return `<div class="book-grid">${books.map(renderBookCard).join('')}</div>`
}
