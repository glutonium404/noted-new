import { useEffect, useMemo, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import ClearRounded from '@mui/icons-material/ClearRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import NoteCard from './NoteCard'
import { pluralize } from '../lib/noted'

function Dashboard({ user, notes, onLogout, onAdd, onOpenNote, onEditNote, onDeleteNote, onTogglePin }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (Boolean(b.pinned) !== Boolean(a.pinned)) {
          return Boolean(b.pinned) - Boolean(a.pinned)
        }
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        )
      }),
    [notes],
  )

  const availableTags = useMemo(() => {
    const tags = new Set()
    for (const note of notes) {
      for (const tag of note.tags ?? []) {
        if (tag?.trim()) tags.add(tag)
      }
    }
    return ['all', ...Array.from(tags).sort((a, b) => a.localeCompare(b))]
  }, [notes])

  useEffect(() => {
    if (!availableTags.includes(selectedTag)) {
      setSelectedTag('all')
    }
  }, [availableTags, selectedTag])

  const visibleNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return sortedNotes.filter((note) => {
      const tagMatches = selectedTag === 'all' || (note.tags ?? []).includes(selectedTag)
      if (!tagMatches) return false
      if (!query) return true
      return note.title.toLowerCase().includes(query)
    })
  }, [searchQuery, selectedTag, sortedNotes])

  const noteCountLabel = pluralize(notes.length, 'note', 'notes')
  const isFiltering = searchQuery.trim().length > 0

  return (
    <Box className="dashboard-shell">
      <AppBar position="static" elevation={0} color="transparent" className="topbar">
        <Toolbar className="toolbar">
          <Stack className="info-wrapper" direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', color: '#0a0f0d', fontWeight: 700 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" className="greeting-text">
                Hello, {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Stack>

          <Button variant="outlined" startIcon={<LogoutRounded />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Paper elevation={0} className="dashboard-panel">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Search by title"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                  >
                    <ClearRounded fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={onAdd}
            sx={{ minWidth: 140, whiteSpace: 'nowrap' }}
          >
            Add new
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={2} mb={2.5} color="text.secondary">
          <Typography variant="body2">{noteCountLabel}</Typography>
          {isFiltering && (
            <Typography variant="body2">
              &middot; {pluralize(visibleNotes.length, 'match', 'matches')} for &ldquo;{searchQuery.trim()}&rdquo;
            </Typography>
          )}
          {!isFiltering && notes.length > 0 && (
            <Typography variant="body2">&middot; Sorted by most recent activity</Typography>
          )}
        </Stack>

        <Box className="tag-filter-container">
          <Tabs
            value={selectedTag}
            onChange={(_, value) => setSelectedTag(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 42 }}
          >
            {availableTags.map((tag) => (
              <Tab
                key={tag}
                value={tag}
                label={tag === 'all' ? 'All tags' : `#${tag}`}
              />
            ))}
          </Tabs>
        </Box>

        <Stack spacing={1.5}>
          {visibleNotes.length === 0 ? (
            <Paper variant="outlined" className="empty-state">
              <Typography variant="h6" className="note-title-text">
                {isFiltering ? 'No matching notes' : 'No notes yet'}
              </Typography>
              <Typography color="text.secondary">
                {isFiltering
                  ? 'Try a different title, or clear the search.'
                  : 'Use "Add new +" to write your first note.'}
              </Typography>
            </Paper>
          ) : (
            visibleNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={onOpenNote}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
              />
            ))
          )}
        </Stack>
      </Paper>
    </Box>
  )
}

export default Dashboard
