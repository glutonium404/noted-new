import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Box,
} from '@mui/material'
import CloseRounded from '@mui/icons-material/CloseRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import ArticleRounded from '@mui/icons-material/ArticleRounded'
import SmartToyRounded from '@mui/icons-material/SmartToyRounded'
import CircularProgress from '@mui/material/CircularProgress'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  formatDate,
  getNoteActivityDate,
  resolveNoteColor,
  apiSummarizeNote,
  apiAskAiAboutNote,
} from '../lib/noted'
import { useEffect, useState } from 'react'

const SUMMARY_CACHE_KEY = 'noted.ai.summary.cache.v1'

const readSummaryCache = () => {
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

const writeSummaryCache = (cache) => {
  localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache))
}

function NoteViewDialog({ note, onClose, onEdit, onDelete }) {
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isAskOpen, setIsAskOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [askError, setAskError] = useState('')
  const [askAnswer, setAskAnswer] = useState('')
  const [askLoading, setAskLoading] = useState(false)

  useEffect(() => {
    setSummary(null)
    setSummaryError('')
    setSummaryLoading(false)
    setIsSummaryOpen(false)
    setIsAskOpen(false)
    setQuestion('')
    setAskError('')
    setAskAnswer('')
    setAskLoading(false)
  }, [note?.id])

  const handleSummarize = async () => {
    if (!note) return
    const version = note.updatedAt || note.createdAt || ''
    const cache = readSummaryCache()
    const cached = cache[note.id]
    if (cached?.version === version && cached?.summary) {
      setSummary({ summary: cached.summary })
      setIsSummaryOpen(true)
      return
    }

    setSummaryLoading(true)
    setSummaryError('')
    try {
      const data = await apiSummarizeNote(note.id)
      setSummary(data)
      setIsSummaryOpen(true)
      cache[note.id] = { version, summary: data.summary }
      writeSummaryCache(cache)
    } catch (err) {
      setSummary(null)
      setSummaryError(err?.message ?? 'Unable to summarize note.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleAsk = async () => {
    if (!note) return
    const trimmed = question.trim()
    if (!trimmed) {
      setAskError('Question is required.')
      return
    }

    setAskLoading(true)
    setAskError('')
    setAskAnswer('')
    try {
      const data = await apiAskAiAboutNote(note.id, trimmed)
      setAskAnswer(data.answer ?? '')
    } catch (err) {
      setAskError(err?.message ?? 'Unable to get AI answer.')
    } finally {
      setAskLoading(false)
    }
  }

  const handleAskSubmit = (event) => {
    event.preventDefault()
    handleAsk()
  }

  const handleAskKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!askLoading) {
        handleAsk()
      }
    }
  }

  return (
    <Dialog
      open={Boolean(note)}
      onClose={onClose}
      fullWidth maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: { md: '840px' },
        },
      }}
    >
      {note && (
        <>
          <DialogTitle sx={{ pr: 1 }}>
            <Stack className="card-title-wrapper" direction="row" alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <span
                  className="note-spine note-spine-dialog"
                  style={{ backgroundColor: resolveNoteColor(note) }}
                  aria-hidden="true"
                />
                <Typography variant="h6" className="note-title-text" sx={{ wordBreak: 'break-word' }}>
                  {note.title}
                </Typography>
              </Stack>
              <IconButton onClick={onClose} aria-label="Close">
                <CloseRounded />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {note.updatedAt ? 'Updated ' : 'Created '}
              {formatDate(getNoteActivityDate(note))}
            </Typography>
          </DialogTitle>
          <DialogContent dividers style={{ backgroundColor: "#212121" }}>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.body}
              </ReactMarkdown>
            </div>

            {note.tags?.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Tags
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  useFlexGap
                  flexWrap="wrap"
                  className="note-tags-scroll-box"
                  mt={0.5}
                >
                  {note.tags.map((tag) => (
                    <Chip key={tag} size="small" label={`#${tag}`} />
                  ))}
                </Stack>
              </Box>
            )}

            {summaryError && (
              <Typography color="error" sx={{ mt: 1.5 }}>
                {summaryError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="outlined"
              startIcon={<EditRounded />}
              onClick={() => onEdit(note)}
            >
              Edit
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArticleRounded />}
              onClick={handleSummarize}
              disabled={summaryLoading}
            >
              {summaryLoading ? <CircularProgress size={18} /> : 'Summarize'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<SmartToyRounded />}
              onClick={() => setIsAskOpen(true)}
            >
              Ask AI
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRounded />}
              onClick={() => onDelete(note)}
            >
              Delete
            </Button>
          </DialogActions>
        </>
      )}

      <Dialog
        open={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          AI Summary
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ whiteSpace: 'pre-wrap' }}>
            {summary?.summary ?? ''}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSummaryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ component: 'form', onSubmit: handleAskSubmit }}
      >
        <DialogTitle>Ask AI about this note</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <TextField
              label="Your question"
              fullWidth
              autoFocus
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value)
                if (askError) setAskError('')
              }}
              onKeyDown={handleAskKeyDown}
              error={Boolean(askError)}
              helperText={askError || ' '}
            />
            {askAnswer && (
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {askAnswer}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAskOpen(false)} disabled={askLoading}>Close</Button>
          <Button type="submit" disabled={askLoading} variant="contained">
            {askLoading ? <CircularProgress size={18} color="inherit" /> : 'Ask'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default NoteViewDialog
