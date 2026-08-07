// ── Pure utilities (no side-effects) ────────────────────────────────────────

export const PASSWORD_MIN_LENGTH = 8

export const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const getNoteActivityDate = (note) => note.updatedAt || note.createdAt

export const pluralize = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural}`

export const sanitizeUsername = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

export const NOTE_PRESET_COLORS = [
  '#baff29', // lime (brand accent)
  '#5eead4', // teal
  '#60a5fa', // blue
  '#f9a8d4', // pink
  '#fbbf24', // amber
  '#c4b5fd', // violet
  '#fb923c', // orange
  '#a3e635', // green
]

const randomPresetColor = () =>
  NOTE_PRESET_COLORS[Math.floor(Math.random() * NOTE_PRESET_COLORS.length)]

export const resolveNoteColor = (note) => {
  if (note?.color) return note.color

  const title = note?.title ?? ''
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash |= 0
  }
  if (!title) return randomPresetColor()
  return NOTE_PRESET_COLORS[Math.abs(hash) % NOTE_PRESET_COLORS.length]
}

// ── API client ───────────────────────────────────────────────────────────────
// This is a demo project with no session management: there's no token or
// cookie. Instead, once a user has logged in or registered, we remember
// their email in a module-level variable and send it as a plain header on
// every subsequent request so the backend knows whose notes to work with.
// It resets on every page refresh — refreshing logs you out, on purpose,
// since there's no persisted session.

// Automatically switches based on environment (development vs production)
const API_BASE = import.meta.env.VITE_API_BASE || 'https://noted-new.onrender.com/api'

console.log(import.meta.env.VITE_API_BASE)

let _userEmail = null

export const setApiUser = (email) => {
  _userEmail = email
}

export const clearApiUser = () => {
  _userEmail = null
}

const apiFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(_userEmail ? { 'X-User-Email': _userEmail } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  // 204 No Content — return early, nothing to parse
  if (response.status === 204) {
    return { ok: true, status: 204, data: null }
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // Normalise backend ApiError shape: { status, code, message }
    const message = data?.message ?? `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.code = data?.code ?? 'unknown'
    throw error
  }

  return { ok: true, status: response.status, data }
}

// ── Auth endpoints ───────────────────────────────────────────────────────────
// No hashing, no encryption: passwords travel and are stored as plain text,
// by design, for this demo project.

export const apiRegister = async ({ email, name, username, password }) => {
  const { data } = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, username, password }),
  })
  // data: { username, name, email }
  return data
}

export const apiLogin = async ({ email, password }) => {
  const { data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data
}

// ── Note endpoints ───────────────────────────────────────────────────────────

export const apiGetNotes = async () => {
  const { data } = await apiFetch('/notes')
  return data  // array of NoteResponse
}

export const apiCreateNote = async ({ title, body, tags, color }) => {
  const { data } = await apiFetch('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, body, tags, color }),
  })
  return data  // NoteResponse
}

export const apiUpdateNote = async (id, { title, body, tags, color }) => {
  const { data } = await apiFetch(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, body, tags, color }),
  })
  return data  // NoteResponse
}

export const apiDeleteNote = async (id) => {
  await apiFetch(`/notes/${id}`, { method: 'DELETE' })
}

export const apiSetNotePinned = async (id, pinned) => {
  const { data } = await apiFetch(`/notes/${id}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ pinned }),
  })
  return data  // NoteResponse
}

export const apiSummarizeNote = async (id) => {
  const { data } = await apiFetch(`/notes/${id}/summarize`)
  return data
}

export const apiAskAiAboutNote = async (id, question) => {
  const { data } = await apiFetch(`/notes/${id}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
  return data
}

// POST request to share a note
export const shareNote = async (id) => {
  const { data } = await apiFetch(`/notes/${id}/share`, {
    method: 'POST',
  });
  return data; 
};

// DELETE request to unshare a note
export const unshareNote = async (id) => {
  const { data } = await apiFetch(`/notes/${id}/share`, {
    method: 'DELETE',
  });
  return data;
};

// GET request for a public shared note (No Auth headers needed)
export const getSharedNote = async (shareId) => {
  // Using raw fetch instead of apiFetch to ensure X-User-Email is NOT sent
  const response = await fetch(`${API_BASE}/notes/shared/${shareId}`);
  if (!response.ok) throw new Error('note_not_found');
  return response.json();
};
