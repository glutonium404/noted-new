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
  Tooltip,
  Box,
} from '@mui/material'
import CloseRounded from '@mui/icons-material/CloseRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import ArticleRounded from '@mui/icons-material/ArticleRounded'
import SmartToyRounded from '@mui/icons-material/SmartToyRounded'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import DoneRounded from '@mui/icons-material/DoneRounded'
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded'
import PushPinRounded from '@mui/icons-material/PushPinRounded'
import PushPinOutlined from '@mui/icons-material/PushPinOutlined'
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
import { useEffect, useRef, useState } from 'react'

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

function NoteViewDialog({ note, onClose, onEdit, onDelete, onTogglePin }) {
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isAskOpen, setIsAskOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [askError, setAskError] = useState('')
  const [askAnswer, setAskAnswer] = useState('')
  const [askLoading, setAskLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const bodyRef = useRef(null)

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
    setCopied(false)
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

  const handleCopy = async () => {
    if (!note) return
    const text = `${note.title}\n\n${note.body}`
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Silently ignore — clipboard access can be denied by the browser.
    }
  }

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const handlePrintPdf = () => {
    if (!note) return

    const bodyHtml = bodyRef.current?.innerHTML ?? `<p>${escapeHtml(note.body)}</p>`
    const tagsHtml = (note.tags ?? [])
      .map((tag) => `<span class="note-print-tag">#${escapeHtml(tag)}</span>`)
      .join(' ')

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'

    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document || iframe.contentDocument
    if (!doc) {
      document.body.removeChild(iframe)
      return
    }

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(note.title)}</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; padding: 10px; }
            h1 { font-size: 1.6rem; margin-bottom: 4px; }
            .note-print-meta { color: #666; font-size: 0.85rem; margin-bottom: 18px; }
            .note-print-tags { margin-bottom: 18px; }
            .note-print-tag { display: inline-block; border: 1px solid #ccc; border-radius: 999px; padding: 2px 10px; margin-right: 6px; font-size: 0.78rem; color: #444; }
            .note-print-body { font-size: 1rem; line-height: 1.55; word-wrap: break-word; }
            .note-print-body img { max-width: 100%; }
            .note-print-body pre { white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 6px; }
            .note-print-body code { background: #f4f4f4; border-radius: 3px; padding: 1px 4px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(note.title)}</h1>
          <div class="note-print-meta">
            ${note.updatedAt ? 'Updated ' : 'Created '}${escapeHtml(formatDate(getNoteActivityDate(note)))}
          </div>
          <div class="note-print-body">${bodyHtml}</div>
        </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
        }, 1000)
      }
    }, 250)
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
              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                {onTogglePin && (
                  <Tooltip title={note.pinned ? 'Unpin' : 'Pin'}>
                    <IconButton
                      onClick={() => onTogglePin(note)}
                      aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                      sx={note.pinned ? { color: 'primary.main' } : undefined}
                    >
                      {note.pinned ? <PushPinRounded /> : <PushPinOutlined />}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={copied ? 'Copied!' : 'Copy note'}>
                  <IconButton onClick={handleCopy} aria-label="Copy note">
                    {copied ? <DoneRounded color="success" /> : <ContentCopyRounded />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print as PDF">
                  <IconButton onClick={handlePrintPdf} aria-label="Print note as PDF">
                    <PictureAsPdfRounded />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={onClose} aria-label="Close">
                  <CloseRounded />
                </IconButton>
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {note.updatedAt ? 'Updated ' : 'Created '}
              {formatDate(getNoteActivityDate(note))}
            </Typography>
          </DialogTitle>
          <DialogContent dividers style={{ backgroundColor: "#212121" }}>
            <div className="markdown-body" ref={bodyRef}>
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
          <DialogActions sx={{
            px: 3,
            pb: 2,
            flexWrap: "wrap",
            gap: 1,
            '& > :not(style) ~ :not(style)': {
              ml: 0,
            }
          }}>
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
          <Button
            type="submit"
            disabled={askLoading}
            variant="contained"
            onClick={() => {
              if (!askLoading) {
                handleAsk()
              }
            }}
          >
            {askLoading ? <CircularProgress size={18} color="inherit" /> : 'Ask'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default NoteViewDialog
