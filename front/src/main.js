import './style.css'
import { api, resourceData } from './api.js'

const app = document.querySelector('#app')

const state = {
  loading: true,
  user: null,
  books: [],
  genres: [],
  authMode: 'login',
  authError: '',
  globalError: '',
  filter: 'all',
  genreFilter: 'all',
  search: '',
  modal: null,
  toast: '',
}

const statuses = {
  to_read: { label: 'Quero ler', short: 'Na fila', className: 'to-read' },
  reading: { label: 'Lendo', short: 'Em leitura', className: 'reading' },
  finished: { label: 'Lido', short: 'Concluído', className: 'finished' },
}

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]))

const icon = (name, size = 20) => {
  const paths = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3M21 4v16"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3ZM19 14l1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/>',
    quote: '<path d="M10 11H5a2 2 0 0 0-2 2v5h7v-5H6c0-3 1-5 4-7M21 11h-5a2 2 0 0 0-2 2v5h7v-5h-4c0-3 1-5 4-7"/>',
  }
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`
}

function getApiError(error) {
  const errors = error?.data?.errors
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors).flat().filter(Boolean)
    if (messages.length) return messages.join(' ')
  }
  return error?.message || 'Algo deu errado. Tente novamente.'
}

function renderLoading() {
  app.innerHTML = `
    <main class="loading-screen" aria-live="polite">
      <div class="brand-mark">${icon('book', 24)}</div>
      <span class="spinner"></span>
      <p>Preparando sua estante...</p>
    </main>`
}

function renderAuth() {
  const registering = state.authMode === 'register'
  app.innerHTML = `
    <main class="auth-layout">
      <section class="auth-story">
        <a class="brand" href="#" aria-label="Estante, início">
          <span class="brand-mark">${icon('book', 23)}</span>
          <span>estante<span class="brand-dot">.</span></span>
        </a>
        <div class="story-copy">
          <span class="eyebrow light-eyebrow">SEU PRÓXIMO CAPÍTULO COMEÇA AQUI</span>
          <h1>Histórias boas merecem um lugar especial.</h1>
          <p>Organize o que você já leu, acompanhe sua leitura e guarde os livros que ainda quer descobrir.</p>
          <div class="story-note">
            <span class="note-icon">${icon('quote', 21)}</span>
            <span>“Uma casa sem livros é como um corpo sem alma.”<small>— Cícero</small></span>
          </div>
        </div>
        <div class="story-footer">Um cantinho só seu para cada grande história.</div>
        <div class="story-orb orb-one"></div><div class="story-orb orb-two"></div>
      </section>
      <section class="auth-panel">
        <div class="auth-card">
          <span class="eyebrow">BEM-VINDO À ESTANTE</span>
          <h2>${registering ? 'Crie sua conta' : 'Que bom ter você de volta'}</h2>
          <p class="auth-subtitle">${registering ? 'Sua biblioteca pessoal começa com um cadastro rápido.' : 'Entre para continuar de onde sua última leitura parou.'}</p>
          ${state.globalError ? `<div class="inline-alert" role="alert">${escapeHtml(state.globalError)}</div>` : ''}
          ${state.authError ? `<div class="inline-alert" role="alert">${escapeHtml(state.authError)}</div>` : ''}
          <form id="auth-form" class="form-stack">
            ${registering ? `<label class="field"><span>Nome</span><input name="name" type="text" autocomplete="name" placeholder="Como podemos chamar você?" maxlength="255" required /></label>` : ''}
            <label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" maxlength="255" required /></label>
            <label class="field"><span>Senha</span><input name="password" type="password" autocomplete="${registering ? 'new-password' : 'current-password'}" placeholder="${registering ? 'Pelo menos 8 caracteres' : 'Sua senha'}" minlength="${registering ? '8' : '1'}" required /></label>
            ${registering ? `<label class="field"><span>Confirme sua senha</span><input name="password_confirmation" type="password" autocomplete="new-password" placeholder="Digite a senha novamente" minlength="8" required /></label>` : ''}
            <button class="button button-primary auth-submit" type="submit">${registering ? 'Criar minha conta' : 'Entrar'} ${icon('arrow', 18)}</button>
          </form>
          <div class="auth-switch">${registering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button type="button" data-action="auth-toggle">${registering ? 'Entrar' : 'Criar conta'}</button></div>
          <p class="auth-footnote">Seus livros ficam salvos na sua conta.</p>
        </div>
      </section>
    </main>`
}

function filteredBooks() {
  const query = state.search.trim().toLocaleLowerCase('pt-BR')
  return state.books.filter((book) => {
    const status = book.status || 'to_read'
    const genreId = book.genre?.id ?? book.genre_id
    const matchesStatus = state.filter === 'all' || status === state.filter
    const matchesGenre = state.genreFilter === 'all' || String(genreId) === state.genreFilter
    const searchable = `${book.title || ''} ${book.author || ''} ${book.genre?.name || ''}`.toLocaleLowerCase('pt-BR')
    return matchesStatus && matchesGenre && (!query || searchable.includes(query))
  })
}

function renderBookCard(book, index) {
  const status = statuses[book.status] || statuses.to_read
  const title = escapeHtml(book.title || 'Sem título')
  const author = escapeHtml(book.author || 'Autor desconhecido')
  const genre = escapeHtml(book.genre?.name || 'Sem categoria')
  const pages = book.pages ? `${escapeHtml(book.pages)} páginas` : 'Páginas não informadas'
  const rating = book.status === 'finished' && book.rating
    ? `<span class="book-rating" aria-label="Nota ${escapeHtml(book.rating)} de 5">${'★'.repeat(Number(book.rating))}<span>${'☆'.repeat(5 - Number(book.rating))}</span></span>`
    : ''
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
          <span class="status-chip ${status.className}"><i></i>${status.label}</span>
          <span class="book-genre">${genre}</span>
        </div>
        <h3>${title}</h3>
        <p class="book-author">${author}</p>
        <div class="book-meta"><span>${icon('book', 15)} ${pages}</span>${rating}</div>
        <div class="book-actions">
          <button class="text-action" type="button" data-action="edit-book" data-id="${Number(book.id)}">${icon('edit', 15)} Editar</button>
          <button class="icon-button danger-action" type="button" aria-label="Excluir ${title}" title="Excluir livro" data-action="delete-book" data-id="${Number(book.id)}">${icon('trash', 17)}</button>
        </div>
      </div>
    </article>`
}

function renderBooks() {
  const target = document.querySelector('#books-content')
  if (!target) return
  const books = filteredBooks()
  const countLabel = books.length === 1 ? '1 livro' : `${books.length} livros`
  const count = document.querySelector('#results-count')
  if (count) count.textContent = countLabel
  if (!state.books.length) {
    target.innerHTML = `
      <div class="empty-state">
        <div class="empty-illustration">${icon('book', 38)}</div>
        <span class="eyebrow">SUA JORNADA COMEÇA AGORA</span>
        <h3>Sua estante está esperando a primeira história.</h3>
        <p>Adicione um livro para organizar suas leituras e acompanhar cada página.</p>
        <button class="button button-primary" type="button" data-action="new-book">${icon('plus', 18)} Adicionar primeiro livro</button>
      </div>`
    return
  }
  if (!books.length) {
    target.innerHTML = `
      <div class="empty-filter">
        <div class="empty-illustration small">${icon('search', 26)}</div>
        <h3>Nenhum livro encontrado</h3>
        <p>Tente mudar os filtros ou buscar por outro título.</p>
        <button class="text-action" type="button" data-action="clear-filters">Limpar filtros</button>
      </div>`
    return
  }
  target.innerHTML = `<div class="book-grid">${books.map(renderBookCard).join('')}</div>`
}

function renderDashboard() {
  const counts = {
    all: state.books.length,
    to_read: state.books.filter((book) => (book.status || 'to_read') === 'to_read').length,
    reading: state.books.filter((book) => book.status === 'reading').length,
    finished: state.books.filter((book) => book.status === 'finished').length,
  }
  const firstName = escapeHtml((state.user?.name || 'Leitor').trim().split(/\s+/)[0])
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Estante, início"><span class="brand-mark">${icon('book', 22)}</span><span>estante<span class="brand-dot">.</span></span></a>
        <div class="topbar-right">
          <button class="button button-soft genre-manage" type="button" data-action="open-genres">${icon('layers', 17)} <span>Gerenciar categorias</span></button>
          <span class="topbar-divider"></span>
          <div class="user-chip"><span class="user-avatar">${firstName.charAt(0).toLocaleUpperCase('pt-BR')}</span><span class="user-name">${firstName}</span></div>
          <button class="icon-button logout-button" type="button" data-action="logout" aria-label="Sair" title="Sair">${icon('logout', 18)}</button>
        </div>
      </header>
      <main class="dashboard">
        ${state.globalError ? `<div class="inline-alert page-alert" role="alert">${escapeHtml(state.globalError)}</div>` : ''}
        <section class="welcome-row">
          <div>
            <span class="eyebrow">SUA BIBLIOTECA PESSOAL</span>
            <h1>Olá, ${firstName}<span class="heading-period">.</span></h1>
            <p class="welcome-subtitle">Toda leitura deixa um pedacinho de história com você.</p>
          </div>
          <button class="button button-primary add-book-button" type="button" data-action="new-book">${icon('plus', 19)} Novo livro</button>
        </section>
        <section class="stats-grid" aria-label="Resumo da biblioteca">
          <article class="stat-card stat-total"><div class="stat-icon">${icon('grid', 20)}</div><div><span class="stat-label">Na estante</span><strong>${counts.all}</strong><span class="stat-caption">${counts.all === 1 ? 'livro cadastrado' : 'livros cadastrados'}</span></div></article>
          <article class="stat-card stat-reading"><div class="stat-icon">${icon('book', 20)}</div><div><span class="stat-label">Em leitura</span><strong>${counts.reading}</strong><span class="stat-caption">${counts.reading === 1 ? 'história em andamento' : 'histórias em andamento'}</span></div></article>
          <article class="stat-card stat-finished"><div class="stat-icon">${icon('sparkle', 20)}</div><div><span class="stat-label">Concluídos</span><strong>${counts.finished}</strong><span class="stat-caption">${counts.finished === 1 ? 'jornada finalizada' : 'jornadas finalizadas'}</span></div></article>
          <article class="stat-card stat-genres"><div class="stat-icon">${icon('layers', 20)}</div><div><span class="stat-label">Categorias</span><strong>${state.genres.length}</strong><span class="stat-caption">${state.genres.length === 1 ? 'tema na sua estante' : 'temas na sua estante'}</span></div></article>
        </section>
        <section class="library-section">
          <div class="library-heading"><div><span class="eyebrow">SEU ACERVO</span><h2>Minha estante</h2></div><span class="results-count" id="results-count">${counts.all} livros</span></div>
          <div class="library-toolbar">
            <div class="filter-tabs" role="group" aria-label="Filtrar por status">
              <button type="button" class="filter-tab ${state.filter === 'all' ? 'active' : ''}" data-filter="all">Todos <span>${counts.all}</span></button>
              <button type="button" class="filter-tab ${state.filter === 'to_read' ? 'active' : ''}" data-filter="to_read">Quero ler <span>${counts.to_read}</span></button>
              <button type="button" class="filter-tab ${state.filter === 'reading' ? 'active' : ''}" data-filter="reading">Lendo <span>${counts.reading}</span></button>
              <button type="button" class="filter-tab ${state.filter === 'finished' ? 'active' : ''}" data-filter="finished">Lidos <span>${counts.finished}</span></button>
            </div>
            <div class="toolbar-controls">
              <label class="search-box">${icon('search', 18)}<input id="search-input" type="search" placeholder="Buscar livro ou autor" value="${escapeHtml(state.search)}" aria-label="Buscar livro ou autor" /></label>
              <label class="select-wrap"><span class="sr-only">Filtrar por categoria</span><select id="genre-filter" aria-label="Filtrar por categoria"><option value="all">Todas as categorias</option>${state.genres.map((genre) => `<option value="${Number(genre.id)}" ${String(genre.id) === state.genreFilter ? 'selected' : ''}>${escapeHtml(genre.name)}</option>`).join('')}</select></label>
            </div>
          </div>
          <div id="books-content" class="books-content"></div>
        </section>
        <footer class="dashboard-footer"><span>feito para acompanhar boas histórias</span><span>${icon('sparkle', 15)} boas leituras!</span></footer>
      </main>
      ${state.toast ? `<div class="toast" role="status">${icon('sparkle', 17)} ${escapeHtml(state.toast)}</div>` : ''}
      ${renderModal()}
    </div>`
  renderBooks()
}

function renderBookModal() {
  const book = state.modal.book || {}
  const currentGenre = book.genre?.id ?? book.genre_id ?? ''
  const finished = (book.status || 'to_read') === 'finished'
  const genreOptions = state.genres.map((genre) => `<option value="${Number(genre.id)}" ${String(genre.id) === String(currentGenre) ? 'selected' : ''}>${escapeHtml(genre.name)}</option>`).join('')
  return `
    <div class="modal-backdrop" data-action="backdrop-close">
      <section class="modal-card book-modal" role="dialog" aria-modal="true" aria-labelledby="book-modal-title">
        <div class="modal-header"><div><span class="eyebrow">${book.id ? 'ATUALIZE SEU ACERVO' : 'NOVA HISTÓRIA'}</span><h2 id="book-modal-title">${book.id ? 'Editar livro' : 'Adicionar livro'}</h2></div><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="Fechar">${icon('close', 20)}</button></div>
        <p class="modal-description">${book.id ? 'Mantenha as informações da sua leitura em dia.' : 'Preencha os detalhes para guardar este livro na sua estante.'}</p>
        ${state.genres.length ? '' : `<div class="inline-alert" role="status">Cadastre uma categoria antes de adicionar um livro. <button class="inline-link" type="button" data-action="open-genres">Criar categoria</button></div>`}
        <div class="modal-error" role="alert"></div>
        <form id="book-form" class="form-stack modal-form">
          <label class="field"><span>Título do livro</span><input name="title" type="text" maxlength="255" value="${escapeHtml(book.title || '')}" placeholder="Ex.: O pequeno príncipe" required /></label>
          <label class="field"><span>Autor(a)</span><input name="author" type="text" maxlength="255" value="${escapeHtml(book.author || '')}" placeholder="Ex.: Antoine de Saint-Exupéry" required /></label>
          <div class="form-row">
            <label class="field"><span>Categoria</span><select name="genre_id" required ${state.genres.length ? '' : 'disabled'}><option value="">Selecione</option>${genreOptions}</select></label>
            <label class="field"><span>Páginas <small>(opcional)</small></span><input name="pages" type="number" min="1" step="1" value="${book.pages ? escapeHtml(book.pages) : ''}" placeholder="Ex.: 240" /></label>
          </div>
          <div class="form-row">
            <label class="field"><span>Status de leitura</span><select name="status"><option value="to_read" ${(!book.status || book.status === 'to_read') ? 'selected' : ''}>Quero ler</option><option value="reading" ${book.status === 'reading' ? 'selected' : ''}>Lendo</option><option value="finished" ${book.status === 'finished' ? 'selected' : ''}>Lido</option></select></label>
            <label class="field rating-field" ${finished ? '' : 'hidden'}><span>Avaliação <small>(1 a 5 estrelas)</small></span><select name="rating"><option value="">Sem avaliação</option>${[1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${Number(book.rating) === score ? 'selected' : ''}>${'★'.repeat(score)}${'☆'.repeat(5 - score)} · ${score}</option>`).join('')}</select></label>
          </div>
          <div class="modal-actions"><button class="button button-soft" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit" ${state.genres.length ? '' : 'disabled'}>${book.id ? 'Salvar alterações' : 'Adicionar à estante'}</button></div>
        </form>
      </section>
    </div>`
}

function renderGenresModal() {
  const editGenre = state.modal.editGenre
  const bookCounts = new Map()
  state.books.forEach((book) => {
    const id = book.genre?.id ?? book.genre_id
    if (id != null) bookCounts.set(String(id), (bookCounts.get(String(id)) || 0) + 1)
  })
  return `
    <div class="modal-backdrop" data-action="backdrop-close">
      <section class="modal-card genres-modal" role="dialog" aria-modal="true" aria-labelledby="genres-modal-title">
        <div class="modal-header"><div><span class="eyebrow">ORGANIZE SUA BIBLIOTECA</span><h2 id="genres-modal-title">Categorias</h2></div><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="Fechar">${icon('close', 20)}</button></div>
        <p class="modal-description">Agrupe seus livros por tema, gênero ou qualquer coleção que faça sentido para você.</p>
        <div class="genre-manager">
          <div class="genre-list-panel">
            <div class="genre-list-heading"><strong>Suas categorias</strong><button class="text-action" type="button" data-action="new-genre">${icon('plus', 16)} Nova</button></div>
            ${state.genres.length ? `<ul class="genre-list">${state.genres.map((genre) => `
              <li class="genre-row"><span class="genre-symbol">${icon('layers', 17)}</span><span class="genre-row-copy"><strong>${escapeHtml(genre.name)}</strong><small>${bookCounts.get(String(genre.id)) || 0} ${(bookCounts.get(String(genre.id)) || 0) === 1 ? 'livro' : 'livros'}</small></span><button class="icon-button" type="button" title="Editar categoria" aria-label="Editar ${escapeHtml(genre.name)}" data-action="edit-genre" data-id="${Number(genre.id)}">${icon('edit', 16)}</button><button class="icon-button danger-action" type="button" title="Excluir categoria" aria-label="Excluir ${escapeHtml(genre.name)}" data-action="delete-genre" data-id="${Number(genre.id)}">${icon('trash', 16)}</button></li>`).join('')}</ul>` : `<div class="genre-empty"><span class="empty-illustration small">${icon('layers', 25)}</span><p>Você ainda não criou categorias.</p><button class="text-action" type="button" data-action="new-genre">Criar primeira categoria</button></div>`}
          </div>
          <div class="genre-editor-panel">
            ${editGenre ? `
              <div class="genre-editor-heading"><span class="editor-icon">${icon(editGenre.id ? 'edit' : 'plus', 18)}</span><div><strong>${editGenre.id ? 'Editar categoria' : 'Nova categoria'}</strong><small>${editGenre.id ? 'Altere as informações abaixo.' : 'Dê um nome para sua coleção.'}</small></div></div>
              <div class="modal-error" role="alert"></div>
              <form id="genre-form" class="form-stack">
                <label class="field"><span>Nome</span><input name="name" type="text" maxlength="255" value="${escapeHtml(editGenre.name || '')}" placeholder="Ex.: Ficção científica" required /></label>
                <label class="field"><span>Descrição <small>(opcional)</small></span><textarea name="description" rows="4" placeholder="Conte um pouco sobre esta categoria">${escapeHtml(editGenre.description || '')}</textarea></label>
                <div class="modal-actions"><button class="button button-soft" type="button" data-action="cancel-genre-edit">Cancelar</button><button class="button button-primary" type="submit">${editGenre.id ? 'Salvar categoria' : 'Criar categoria'}</button></div>
              </form>` : `<div class="genre-editor-placeholder"><span class="empty-illustration small">${icon('sparkle', 25)}</span><h3>Uma boa organização faz a leitura fluir.</h3><p>Crie uma categoria para reunir seus livros favoritos.</p><button class="button button-soft" type="button" data-action="new-genre">${icon('plus', 17)} Criar categoria</button></div>`}
          </div>
        </div>
      </section>
    </div>`
}

function renderModal() {
  if (!state.modal) return ''
  return state.modal.type === 'book' ? renderBookModal() : renderGenresModal()
}

function render() {
  if (state.loading) return renderLoading()
  if (!state.user) return renderAuth()
  renderDashboard()
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

async function loadLibrary() {
  const [bookResponse, genreResponse] = await Promise.all([
    api('/api/books'),
    api('/api/genres'),
  ])
  const books = resourceData(bookResponse)
  const genres = resourceData(genreResponse)
  state.books = Array.isArray(books) ? books : []
  state.genres = Array.isArray(genres) ? genres : []
}

function showModalError(error) {
  const target = document.querySelector('.modal-error')
  if (target) target.textContent = getApiError(error)
}

app.addEventListener('click', async (event) => {
  const actionElement = event.target.closest('[data-action], [data-filter]')
  if (!actionElement) return
  if (actionElement.dataset.filter) {
    state.filter = actionElement.dataset.filter
    render()
    return
  }

  const action = actionElement.dataset.action
  if (action === 'auth-toggle') {
    state.authMode = state.authMode === 'login' ? 'register' : 'login'
    state.authError = ''
    state.globalError = ''
    render()
  } else if (action === 'logout') {
    actionElement.disabled = true
    try {
      await api('/api/logout', { method: 'POST' })
    } catch (error) {
      if (error.status !== 401) state.globalError = getApiError(error)
    }
    state.user = null
    state.books = []
    state.genres = []
    state.modal = null
    state.authMode = 'login'
    render()
  } else if (action === 'new-book') {
    state.modal = { type: 'book', book: {} }
    render()
  } else if (action === 'edit-book') {
    actionElement.disabled = true
    try {
      const response = await api(`/api/books/${Number(actionElement.dataset.id)}`)
      state.modal = { type: 'book', book: resourceData(response) }
      render()
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
  } else if (action === 'delete-book') {
    const book = state.books.find((item) => Number(item.id) === Number(actionElement.dataset.id))
    if (!book || !window.confirm(`Excluir “${book.title}” da sua estante?`)) return
    actionElement.disabled = true
    try {
      await api(`/api/books/${Number(book.id)}`, { method: 'DELETE' })
      await loadLibrary()
      showToast('Livro removido da estante.')
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
  } else if (action === 'open-genres') {
    state.modal = { type: 'genres', editGenre: null }
    render()
  } else if (action === 'new-genre') {
    state.modal = { type: 'genres', editGenre: { name: '', description: '' } }
    render()
  } else if (action === 'edit-genre') {
    actionElement.disabled = true
    try {
      const response = await api(`/api/genres/${Number(actionElement.dataset.id)}`)
      state.modal = { type: 'genres', editGenre: resourceData(response) }
      render()
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
  } else if (action === 'delete-genre') {
    const genre = state.genres.find((item) => Number(item.id) === Number(actionElement.dataset.id))
    if (!genre) return
    const count = state.books.filter((book) => String(book.genre?.id ?? book.genre_id) === String(genre.id)).length
    const consequence = count ? ` Isso também excluirá ${count} ${count === 1 ? 'livro associado' : 'livros associados'}.` : ''
    if (!window.confirm(`Excluir a categoria “${genre.name}”?${consequence}`)) return
    actionElement.disabled = true
    try {
      await api(`/api/genres/${Number(genre.id)}`, { method: 'DELETE' })
      if (state.genreFilter === String(genre.id)) state.genreFilter = 'all'
      await loadLibrary()
      state.modal = { type: 'genres', editGenre: null }
      showToast('Categoria removida.')
    } catch (error) {
      state.globalError = getApiError(error)
      render()
    }
  } else if (action === 'cancel-genre-edit') {
    state.modal = { type: 'genres', editGenre: null }
    render()
  } else if (action === 'close-modal') {
    state.modal = null
    render()
  } else if (action === 'backdrop-close' && event.target === actionElement) {
    state.modal = null
    render()
  } else if (action === 'clear-filters') {
    state.filter = 'all'
    state.genreFilter = 'all'
    state.search = ''
    render()
  }
})

app.addEventListener('input', (event) => {
  if (event.target.id === 'search-input') {
    state.search = event.target.value
    renderBooks()
  }
})

app.addEventListener('change', (event) => {
  if (event.target.id === 'genre-filter') {
    state.genreFilter = event.target.value
    renderBooks()
  }
  if (event.target.name === 'status' && state.modal?.type === 'book') {
    const ratingField = document.querySelector('.rating-field')
    if (ratingField) ratingField.hidden = event.target.value !== 'finished'
  }
})

app.addEventListener('submit', async (event) => {
  const form = event.target
  if (form.id === 'auth-form') {
    event.preventDefault()
    const values = new FormData(form)
    const registering = state.authMode === 'register'
    const payload = {
      email: String(values.get('email') || '').trim(),
      password: String(values.get('password') || ''),
    }
    if (registering) {
      payload.name = String(values.get('name') || '').trim()
      payload.password_confirmation = String(values.get('password_confirmation') || '')
    }
    const button = form.querySelector('[type="submit"]')
    button.disabled = true
    button.textContent = registering ? 'Criando sua conta...' : 'Entrando...'
    state.authError = ''
    try {
      await api(registering ? '/api/register' : '/api/login', { method: 'POST', body: payload })
      const response = await api('/api/me')
      state.user = resourceData(response)
      state.globalError = ''
      await loadLibrary()
      state.loading = false
      render()
    } catch (error) {
      if (state.user) {
        state.globalError = getApiError(error)
        state.loading = false
        render()
      } else {
        state.authError = getApiError(error)
        button.disabled = false
        render()
      }
    }
  }

  if (form.id === 'book-form') {
    event.preventDefault()
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
      if (currentBook.id) {
        await api(`/api/books/${Number(currentBook.id)}`, { method: 'PUT', body: payload })
      } else {
        await api('/api/books', { method: 'POST', body: payload })
      }
      await loadLibrary()
      state.modal = null
      showToast(currentBook.id ? 'Livro atualizado.' : 'Livro adicionado à estante.')
    } catch (error) {
      button.disabled = false
      button.textContent = currentBook.id ? 'Salvar alterações' : 'Adicionar à estante'
      showModalError(error)
    }
  }

  if (form.id === 'genre-form') {
    event.preventDefault()
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
      if (currentGenre.id) {
        await api(`/api/genres/${Number(currentGenre.id)}`, { method: 'PUT', body: payload })
      } else {
        await api('/api/genres', { method: 'POST', body: payload })
      }
      await loadLibrary()
      state.modal = { type: 'genres', editGenre: null }
      showToast(currentGenre.id ? 'Categoria atualizada.' : 'Categoria criada.')
    } catch (error) {
      button.disabled = false
      button.textContent = currentGenre.id ? 'Salvar categoria' : 'Criar categoria'
      showModalError(error)
    }
  }
})

async function start() {
  try {
    const response = await api('/api/me')
    state.user = resourceData(response)
    await loadLibrary()
  } catch (error) {
    if (error.status !== 401 && error.status !== 419) state.globalError = getApiError(error)
  }
  state.loading = false
  render()
}

start()
