import { useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import NoteEditorDialog from './components/NoteEditorDialog'
import NoteViewDialog from './components/NoteViewDialog'
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog'
import {
  PASSWORD_MIN_LENGTH,
  sanitizeUsername,
  setApiUser,
  clearApiUser,
  apiRegister,
  apiLogin,
  apiGetNotes,
  apiCreateNote,
  apiUpdateNote,
  apiDeleteNote,
} from './lib/noted'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [notes, setNotes] = useState([])

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteToDelete, setNoteToDelete] = useState(null)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const existingTags = [...new Set(notes.flatMap((note) => note.tags ?? []))].sort((a, b) =>
    a.localeCompare(b),
  )
  // ── Auth ────────────────────────────────────────────────────────────────
  // There's no session management here: nothing is persisted across a page
  // refresh. Logging in just keeps the user in memory for this tab, and
  // every request to the backend carries their email on a plain header so
  // it knows whose notes to work with.

  const handleLogin = async (rawEmail, rawPassword) => {
    const email = rawEmail.trim().toLowerCase()
    if (!email || !rawPassword) {
      notify('Enter your email and password to continue.', 'warning')
      return false
    }

    try {
      const user = await apiLogin({ email, password: rawPassword })

      setApiUser(user.email)
      setCurrentUser(user)

      const fetchedNotes = await apiGetNotes()
      setNotes(fetchedNotes)

      notify(`Welcome back, ${user.name}.`)
      return true
    } catch (err) {
      notify(err.message ?? 'Unable to login at the moment.', 'error')
      return false
    }
  }

  const handleRegister = async (rawName, rawEmail, rawPassword) => {
    const name = rawName.trim()
    const email = rawEmail.trim().toLowerCase()

    if (!name || !email || !rawPassword) {
      notify('Name, email, and password are all required.', 'warning')
      return false
    }
    if (rawPassword.length < PASSWORD_MIN_LENGTH) {
      notify(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`, 'warning')
      return false
    }
    if (!sanitizeUsername(name)) {
      notify('Name must contain at least one letter or number.', 'warning')
      return false
    }

    // Derive a username from the name — the backend will reject it if taken
    // and return a 409, surfaced as a thrown error below.
    const username = sanitizeUsername(name) || 'user'

    try {
      const user = await apiRegister({ email, name, username, password: rawPassword })

      setApiUser(user.email)
      setCurrentUser(user)
      setNotes([])

      notify(`Account created. Your username is ${user.username}.`)
      return true
    } catch (err) {
      notify(err.message ?? 'Unable to register at the moment.', 'error')
      return false
    }
  }

  const handleLogout = () => {
    clearApiUser()
    setCurrentUser(null)
    setNotes([])
    setSelectedNote(null)
    notify('You have been logged out.', 'info')
  }

  // ── Notes ───────────────────────────────────────────────────────────────

  const openAddDialog = () => {
    setEditingNote(null)
    setIsEditorOpen(true)
  }

  const openEditDialog = (note) => {
    setEditingNote(note)
    setSelectedNote(null)
    setIsEditorOpen(true)
  }

  const closeEditorDialog = () => {
    setIsEditorOpen(false)
    setEditingNote(null)
  }

  const handleSaveNote = async ({ title, body, tags, color }) => {
    try {
      if (editingNote) {
        const updated = await apiUpdateNote(editingNote.id, { title, body, tags, color })
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
        notify('Note updated.')
      } else {
        const created = await apiCreateNote({ title, body, tags, color })
        setNotes((prev) => [created, ...prev])
        notify('Note added.')
      }
      closeEditorDialog()
    } catch (err) {
      notify(err.message ?? 'Note could not be saved.', 'error')
    }
  }

  const requestDeleteNote = (note) => {
    setSelectedNote(null)
    setNoteToDelete(note)
  }

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return
    try {
      await apiDeleteNote(noteToDelete.id)
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id))
      setNoteToDelete(null)
      notify('Note deleted.', 'info')
    } catch (err) {
      notify(err.message ?? 'Unable to delete note right now.', 'error')
      setNoteToDelete(null)
    }
  }

  return (
    <>
      {!currentUser ? (
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <>
          <Dashboard
            user={currentUser}
            notes={notes}
            onLogout={handleLogout}
            onAdd={openAddDialog}
            onOpenNote={setSelectedNote}
            onEditNote={openEditDialog}
            onDeleteNote={requestDeleteNote}
          />

          {isEditorOpen && (
            <NoteEditorDialog
              key={editingNote?.id ?? 'new-note'}
              open={isEditorOpen}
              note={editingNote}
              onClose={closeEditorDialog}
              onSave={handleSaveNote}
              existingTags={existingTags}
            />
          )}

          <NoteViewDialog
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onEdit={openEditDialog}
            onDelete={requestDeleteNote}
          />

          <ConfirmDeleteDialog
            open={Boolean(noteToDelete)}
            noteTitle={noteToDelete?.title}
            onCancel={() => setNoteToDelete(null)}
            onConfirm={confirmDeleteNote}
          />
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default App
