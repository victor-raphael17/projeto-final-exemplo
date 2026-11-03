import { escapeHtml } from './escape-html.js'
import { icon } from './icons.js'
import { filteredBooks, renderBookList } from './book-list-view.js'
import { renderModal } from './modal-view.js'

function countBooksByStatus(books) {
  return {
    all: books.length,
    to_read: books.filter((book) => (book.status || 'to_read') === 'to_read').length,
    reading: books.filter((book) => book.status === 'reading').length,
    finished: books.filter((book) => book.status === 'finished').length,
  }
}

function renderTopbar(firstName) {
  const initial = firstName.charAt(0).toLocaleUpperCase('pt-BR')

  return `
    <header class="topbar">
      <a class="brand" href="#" aria-label="Estante, início">
        <span class="brand-mark">${icon('book', 22)}</span>
        <span>estante<span class="brand-dot">.</span></span>
      </a>

      <div class="topbar-right">
        <button
          class="button button-soft genre-manage"
          type="button"
          data-action="open-genres"
        >
          ${icon('layers', 17)}
          <span>Gerenciar categorias</span>
        </button>
        <span class="topbar-divider"></span>
        <div class="user-chip">
          <span class="user-avatar">${initial}</span>
          <span class="user-name">${firstName}</span>
        </div>
        <button
          class="icon-button logout-button"
          type="button"
          data-action="logout"
          aria-label="Sair"
          title="Sair"
        >
          ${icon('logout', 18)}
        </button>
      </div>
    </header>`
}

function renderStatCard(className, iconName, label, value, caption) {
  return `
    <article class="stat-card ${className}">
      <div class="stat-icon">${icon(iconName, 20)}</div>
      <div>
        <span class="stat-label">${label}</span>
        <strong>${value}</strong>
        <span class="stat-caption">${caption}</span>
      </div>
    </article>`
}

function renderStatistics(state, counts) {
  const bookCaption = counts.all === 1 ? 'livro cadastrado' : 'livros cadastrados'
  const readingCaption = counts.reading === 1 ? 'história em andamento' : 'histórias em andamento'
  const finishedCaption = counts.finished === 1 ? 'jornada finalizada' : 'jornadas finalizadas'
  const genreCaption = state.genres.length === 1 ? 'tema na sua estante' : 'temas na sua estante'

  return `
    <section class="stats-grid" aria-label="Resumo da biblioteca">
      ${renderStatCard('stat-total', 'grid', 'Na estante', counts.all, bookCaption)}
      ${renderStatCard('stat-reading', 'book', 'Em leitura', counts.reading, readingCaption)}
      ${renderStatCard('stat-finished', 'sparkle', 'Concluídos', counts.finished, finishedCaption)}
      ${renderStatCard('stat-genres', 'layers', 'Categorias', state.genres.length, genreCaption)}
    </section>`
}

function renderStatusFilters(state, counts) {
  const filters = [
    { id: 'all', label: 'Todos', count: counts.all },
    { id: 'to_read', label: 'Quero ler', count: counts.to_read },
    { id: 'reading', label: 'Lendo', count: counts.reading },
    { id: 'finished', label: 'Lidos', count: counts.finished },
  ]

  return filters
    .map((filter) => {
      const activeClass = state.filter === filter.id ? 'active' : ''
      return `
        <button
          type="button"
          class="filter-tab ${activeClass}"
          data-filter="${filter.id}"
        >
          ${filter.label} <span>${filter.count}</span>
        </button>`
    })
    .join('')
}

function renderGenreOptions(genres, selectedGenreId) {
  return genres
    .map((genre) => {
      const selected = String(genre.id) === selectedGenreId ? 'selected' : ''
      return `<option value="${Number(genre.id)}" ${selected}>${escapeHtml(genre.name)}</option>`
    })
    .join('')
}

function renderLibraryToolbar(state, counts) {
  return `
    <div class="library-toolbar">
      <div class="filter-tabs" role="group" aria-label="Filtrar por status">
        ${renderStatusFilters(state, counts)}
      </div>

      <div class="toolbar-controls">
        <label class="search-box">
          ${icon('search', 18)}
          <input
            id="search-input"
            type="search"
            placeholder="Buscar livro ou autor"
            value="${escapeHtml(state.search)}"
            aria-label="Buscar livro ou autor"
          />
        </label>

        <label class="select-wrap">
          <span class="sr-only">Filtrar por categoria</span>
          <select id="genre-filter" aria-label="Filtrar por categoria">
            <option value="all">Todas as categorias</option>
            ${renderGenreOptions(state.genres, state.genreFilter)}
          </select>
        </label>
      </div>
    </div>`
}

function renderLibrary(state, counts) {
  const matchingBookCount = filteredBooks(state).length
  const countLabel = matchingBookCount === 1 ? 'livro' : 'livros'

  return `
    <section class="library-section">
      <div class="library-heading">
        <div>
          <span class="eyebrow">SEU ACERVO</span>
          <h2>Minha estante</h2>
        </div>
        <span class="results-count" id="results-count">
          ${matchingBookCount} ${countLabel}
        </span>
      </div>

      ${renderLibraryToolbar(state, counts)}

      <div id="books-content" class="books-content">
        ${renderBookList(state)}
      </div>
    </section>`
}

function renderWelcome(firstName) {
  return `
    <section class="welcome-row">
      <div>
        <span class="eyebrow">SUA BIBLIOTECA PESSOAL</span>
        <h1>Olá, ${firstName}<span class="heading-period">.</span></h1>
        <p class="welcome-subtitle">
          Toda leitura deixa um pedacinho de história com você.
        </p>
      </div>
      <button
        class="button button-primary add-book-button"
        type="button"
        data-action="new-book"
      >
        ${icon('plus', 19)} Novo livro
      </button>
    </section>`
}

function renderPageError(message) {
  if (!message) return ''

  return `
    <div class="inline-alert page-alert" role="alert">
      ${escapeHtml(message)}
    </div>`
}

function renderFooter() {
  return `
    <footer class="dashboard-footer">
      <span>feito para acompanhar boas histórias</span>
      <span>${icon('sparkle', 15)} boas leituras!</span>
    </footer>`
}

export function renderDashboardView(state) {
  const counts = countBooksByStatus(state.books)
  const firstName = escapeHtml((state.user?.name || 'Leitor').trim().split(/\s+/)[0])

  return `
    <div class="app-shell">
      ${renderTopbar(firstName)}

      <main class="dashboard">
        ${renderPageError(state.globalError)}
        ${renderWelcome(firstName)}
        ${renderStatistics(state, counts)}
        ${renderLibrary(state, counts)}
        ${renderFooter()}
      </main>

      ${renderToast(state.toast)}
      ${renderModal(state)}
    </div>`
}

function renderToast(message) {
  if (!message) return ''

  return `
    <div class="toast" role="status">
      ${icon('sparkle', 17)} ${escapeHtml(message)}
    </div>`
}
