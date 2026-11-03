import { escapeHtml } from './escape-html.js'
import { icon } from './icons.js'

function renderNameField() {
  return `
    <label class="field">
      <span>Nome</span>
      <input
        name="name"
        type="text"
        autocomplete="name"
        placeholder="Como podemos chamar você?"
        maxlength="255"
        required
      />
    </label>`
}

function renderEmailField() {
  return `
    <label class="field">
      <span>E-mail</span>
      <input
        name="email"
        type="email"
        autocomplete="email"
        placeholder="voce@exemplo.com"
        maxlength="255"
        required
      />
    </label>`
}

function renderPasswordField(registering) {
  const autocomplete = registering ? 'new-password' : 'current-password'
  const placeholder = registering ? 'Pelo menos 8 caracteres' : 'Sua senha'
  const minimumLength = registering ? 8 : 1

  return `
    <label class="field">
      <span>Senha</span>
      <input
        name="password"
        type="password"
        autocomplete="${autocomplete}"
        placeholder="${placeholder}"
        minlength="${minimumLength}"
        required
      />
    </label>`
}

function renderPasswordConfirmationField() {
  return `
    <label class="field">
      <span>Confirme sua senha</span>
      <input
        name="password_confirmation"
        type="password"
        autocomplete="new-password"
        placeholder="Digite a senha novamente"
        minlength="8"
        required
      />
    </label>`
}

function renderAuthForm(registering) {
  const nameField = registering ? renderNameField() : ''
  const confirmationField = registering ? renderPasswordConfirmationField() : ''
  const submitLabel = registering ? 'Criar minha conta' : 'Entrar'

  return `
    <form id="auth-form" class="form-stack">
      ${nameField}
      ${renderEmailField()}
      ${renderPasswordField(registering)}
      ${confirmationField}
      <button class="button button-primary auth-submit" type="submit">
        ${submitLabel}
        ${icon('arrow', 18)}
      </button>
    </form>`
}

export function renderLoadingView() {
  return `
    <main class="loading-screen" aria-live="polite">
      <div class="brand-mark">${icon('book', 24)}</div>
      <span class="spinner"></span>
      <p>Preparando sua estante...</p>
    </main>`
}

export function renderAuthView(state) {
  const registering = state.authMode === 'register'
  const title = registering ? 'Crie sua conta' : 'Que bom ter você de volta'
  const subtitle = registering
    ? 'Sua biblioteca pessoal começa com um cadastro rápido.'
    : 'Entre para continuar de onde sua última leitura parou.'
  const switchPrompt = registering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'
  const switchAction = registering ? 'Entrar' : 'Criar conta'

  return `
    <main class="auth-layout">
      <section class="auth-story">
        <a class="brand" href="#" aria-label="Estante, início">
          <span class="brand-mark">${icon('book', 23)}</span>
          <span>estante<span class="brand-dot">.</span></span>
        </a>
        <div class="story-copy">
          <span class="eyebrow light-eyebrow">SEU PRÓXIMO CAPÍTULO COMEÇA AQUI</span>
          <h1>Histórias boas merecem um lugar especial.</h1>
          <p>
            Organize o que você já leu, acompanhe sua leitura e guarde os livros
            que ainda quer descobrir.
          </p>
          <div class="story-note">
            <span class="note-icon">${icon('quote', 21)}</span>
            <span>
              “Uma casa sem livros é como um corpo sem alma.”
              <small>— Cícero</small>
            </span>
          </div>
        </div>
        <div class="story-footer">Um cantinho só seu para cada grande história.</div>
        <div class="story-orb orb-one"></div>
        <div class="story-orb orb-two"></div>
      </section>

      <section class="auth-panel">
        <div class="auth-card">
          <span class="eyebrow">BEM-VINDO À ESTANTE</span>
          <h2>${title}</h2>
          <p class="auth-subtitle">${subtitle}</p>
          ${renderAuthErrors(state)}
          ${renderAuthForm(registering)}
          <div class="auth-switch">
            ${switchPrompt}
            <button type="button" data-action="auth-toggle">${switchAction}</button>
          </div>
          <p class="auth-footnote">Seus livros ficam salvos na sua conta.</p>
        </div>
      </section>
    </main>`
}

function renderAuthErrors(state) {
  const globalError = state.globalError
    ? `<div class="inline-alert" role="alert">${escapeHtml(state.globalError)}</div>`
    : ''
  const authError = state.authError
    ? `<div class="inline-alert" role="alert">${escapeHtml(state.authError)}</div>`
    : ''

  return `${globalError}${authError}`
}
