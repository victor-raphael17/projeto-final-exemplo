import { escapeHtml } from './escape-html.js'
import { icon } from './icons.js'

function renderModalHeader(eyebrow, title) {
  return `
    <div class="modal-header">
      <div>
        <span class="eyebrow">${eyebrow}</span>
        <h2>${title}</h2>
      </div>
      <button
        class="icon-button modal-close"
        type="button"
        data-action="close-modal"
        aria-label="Fechar"
      >
        ${icon('close', 20)}
      </button>
    </div>`
}

function renderGenreOptions(genres, selectedGenreId) {
  return genres
    .map((genre) => {
      const selected = String(genre.id) === String(selectedGenreId) ? 'selected' : ''
      return `
        <option value="${Number(genre.id)}" ${selected}>
          ${escapeHtml(genre.name)}
        </option>`
    })
    .join('')
}

function renderRatingOptions(rating) {
  const options = [1, 2, 3, 4, 5]
    .map((score) => {
      const selected = Number(rating) === score ? 'selected' : ''
      const stars = '★'.repeat(score) + '☆'.repeat(5 - score)
      return `<option value="${score}" ${selected}>${stars} · ${score}</option>`
    })
    .join('')

  return `<option value="">Sem avaliação</option>${options}`
}

function renderBookFields(book, genres) {
  const currentGenreId = book.genre?.id ?? book.genre_id ?? ''
  const status = book.status || 'to_read'
  const finished = status === 'finished'

  return `
    <label class="field">
      <span>Título do livro</span>
      <input
        name="title"
        type="text"
        maxlength="255"
        value="${escapeHtml(book.title || '')}"
        placeholder="Ex.: O pequeno príncipe"
        required
      />
    </label>

    <label class="field">
      <span>Autor(a)</span>
      <input
        name="author"
        type="text"
        maxlength="255"
        value="${escapeHtml(book.author || '')}"
        placeholder="Ex.: Antoine de Saint-Exupéry"
        required
      />
    </label>

    <div class="form-row">
      <label class="field">
        <span>Categoria</span>
        <select name="genre_id" required ${genres.length ? '' : 'disabled'}>
          <option value="">Selecione</option>
          ${renderGenreOptions(genres, currentGenreId)}
        </select>
      </label>

      <label class="field">
        <span>Páginas <small>(opcional)</small></span>
        <input
          name="pages"
          type="number"
          min="1"
          step="1"
          value="${book.pages ? escapeHtml(book.pages) : ''}"
          placeholder="Ex.: 240"
        />
      </label>
    </div>

    <div class="form-row">
      <label class="field">
        <span>Status de leitura</span>
        <select name="status">
          <option value="to_read" ${status === 'to_read' ? 'selected' : ''}>Quero ler</option>
          <option value="reading" ${status === 'reading' ? 'selected' : ''}>Lendo</option>
          <option value="finished" ${finished ? 'selected' : ''}>Lido</option>
        </select>
      </label>

      <label class="field rating-field" ${finished ? '' : 'hidden'}>
        <span>Avaliação <small>(1 a 5 estrelas)</small></span>
        <select name="rating">${renderRatingOptions(book.rating)}</select>
      </label>
    </div>`
}

function renderBookModal(state) {
  const book = state.modal.book || {}
  const isEditing = Boolean(book.id)
  const title = isEditing ? 'Editar livro' : 'Adicionar livro'
  const eyebrow = isEditing ? 'ATUALIZE SEU ACERVO' : 'NOVA HISTÓRIA'
  const description = isEditing
    ? 'Mantenha as informações da sua leitura em dia.'
    : 'Preencha os detalhes para guardar este livro na sua estante.'
  const categoryWarning = state.genres.length
    ? ''
    : `
      <div class="inline-alert" role="status">
        Cadastre uma categoria antes de adicionar um livro.
        <button class="inline-link" type="button" data-action="open-genres">
          Criar categoria
        </button>
      </div>`
  const submitLabel = isEditing ? 'Salvar alterações' : 'Adicionar à estante'
  const disabled = state.genres.length ? '' : 'disabled'

  return `
    <div class="modal-backdrop" data-action="backdrop-close">
      <section
        class="modal-card book-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
      >
        ${renderModalHeader(eyebrow, title)}
        <p class="modal-description">${description}</p>
        ${categoryWarning}
        <div class="modal-error" role="alert"></div>

        <form id="book-form" class="form-stack modal-form">
          ${renderBookFields(book, state.genres)}
          <div class="modal-actions">
            <button class="button button-soft" type="button" data-action="close-modal">
              Cancelar
            </button>
            <button class="button button-primary" type="submit" ${disabled}>
              ${submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>`
}

function countBooksByGenre(books) {
  const counts = new Map()

  books.forEach((book) => {
    const genreId = book.genre?.id ?? book.genre_id
    if (genreId == null) return

    const key = String(genreId)
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return counts
}

function renderGenreRow(genre, bookCounts) {
  const bookCount = bookCounts.get(String(genre.id)) || 0
  const bookLabel = bookCount === 1 ? 'livro' : 'livros'

  return `
    <li class="genre-row">
      <span class="genre-symbol">${icon('layers', 17)}</span>
      <span class="genre-row-copy">
        <strong>${escapeHtml(genre.name)}</strong>
        <small>${bookCount} ${bookLabel}</small>
      </span>
      <button
        class="icon-button"
        type="button"
        title="Editar categoria"
        aria-label="Editar ${escapeHtml(genre.name)}"
        data-action="edit-genre"
        data-id="${Number(genre.id)}"
      >
        ${icon('edit', 16)}
      </button>
      <button
        class="icon-button danger-action"
        type="button"
        title="Excluir categoria"
        aria-label="Excluir ${escapeHtml(genre.name)}"
        data-action="delete-genre"
        data-id="${Number(genre.id)}"
      >
        ${icon('trash', 16)}
      </button>
    </li>`
}

function renderGenreList(state, bookCounts) {
  if (!state.genres.length) {
    return `
      <div class="genre-empty">
        <span class="empty-illustration small">${icon('layers', 25)}</span>
        <p>Você ainda não criou categorias.</p>
        <button class="text-action" type="button" data-action="new-genre">
          Criar primeira categoria
        </button>
      </div>`
  }

  const rows = state.genres.map((genre) => renderGenreRow(genre, bookCounts)).join('')
  return `<ul class="genre-list">${rows}</ul>`
}

function renderGenreEditorHeading(editGenre) {
  const isEditing = Boolean(editGenre.id)
  const iconName = isEditing ? 'edit' : 'plus'
  const title = isEditing ? 'Editar categoria' : 'Nova categoria'
  const subtitle = isEditing ? 'Altere as informações abaixo.' : 'Dê um nome para sua coleção.'

  return `
    <div class="genre-editor-heading">
      <span class="editor-icon">${icon(iconName, 18)}</span>
      <div>
        <strong>${title}</strong>
        <small>${subtitle}</small>
      </div>
    </div>`
}

function renderGenreForm(editGenre) {
  const submitLabel = editGenre.id ? 'Salvar categoria' : 'Criar categoria'

  return `
    <form id="genre-form" class="form-stack">
      <label class="field">
        <span>Nome</span>
        <input
          name="name"
          type="text"
          maxlength="255"
          value="${escapeHtml(editGenre.name || '')}"
          placeholder="Ex.: Ficção científica"
          required
        />
      </label>

      <label class="field">
        <span>Descrição <small>(opcional)</small></span>
        <textarea
          name="description"
          rows="4"
          placeholder="Conte um pouco sobre esta categoria"
        >${escapeHtml(editGenre.description || '')}</textarea>
      </label>

      <div class="modal-actions">
        <button class="button button-soft" type="button" data-action="cancel-genre-edit">
          Cancelar
        </button>
        <button class="button button-primary" type="submit">
          ${submitLabel}
        </button>
      </div>
    </form>`
}

function renderGenreEditor(editGenre) {
  if (!editGenre) {
    return `
      <div class="genre-editor-placeholder">
        <span class="empty-illustration small">${icon('sparkle', 25)}</span>
        <h3>Uma boa organização faz a leitura fluir.</h3>
        <p>Crie uma categoria para reunir seus livros favoritos.</p>
        <button class="button button-soft" type="button" data-action="new-genre">
          ${icon('plus', 17)} Criar categoria
        </button>
      </div>`
  }

  return `
    ${renderGenreEditorHeading(editGenre)}
    <div class="modal-error" role="alert"></div>
    ${renderGenreForm(editGenre)}`
}

function renderGenresModal(state) {
  const bookCounts = countBooksByGenre(state.books)
  const categories = state.genres.map((genre) => renderGenreRow(genre, bookCounts)).join('')
  const newCategoryButton = `
    <button class="text-action" type="button" data-action="new-genre">
      ${icon('plus', 16)} Nova
    </button>`

  return `
    <div class="modal-backdrop" data-action="backdrop-close">
      <section
        class="modal-card genres-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="genres-modal-title"
      >
        <div class="modal-header">
          <div>
            <span class="eyebrow">ORGANIZE SUA BIBLIOTECA</span>
            <h2 id="genres-modal-title">Categorias</h2>
          </div>
          <button
            class="icon-button modal-close"
            type="button"
            data-action="close-modal"
            aria-label="Fechar"
          >
            ${icon('close', 20)}
          </button>
        </div>

        <p class="modal-description">
          Agrupe seus livros por tema, gênero ou qualquer coleção que faça sentido para você.
        </p>

        <div class="genre-manager">
          <div class="genre-list-panel">
            <div class="genre-list-heading">
              <strong>Suas categorias</strong>
              ${newCategoryButton}
            </div>
            ${state.genres.length ? `<ul class="genre-list">${categories}</ul>` : renderGenreList(state, bookCounts)}
          </div>

          <div class="genre-editor-panel">
            ${renderGenreEditor(state.modal.editGenre)}
          </div>
        </div>
      </section>
    </div>`
}

export function renderModal(state) {
  if (!state.modal) return ''
  if (state.modal.type === 'book') return renderBookModal(state)
  return renderGenresModal(state)
}
