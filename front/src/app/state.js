export function createInitialState() {
  return {
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
}
