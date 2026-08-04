import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import SaveRounded from '@mui/icons-material/SaveRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded'
import ColorizeRounded from '@mui/icons-material/ColorizeRounded'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HexColorPicker } from 'react-colorful'
import { NOTE_PRESET_COLORS } from '../lib/noted'

const TITLE_MAX = 80
const BODY_MAX = 5000
const TAG_MAX = 20
const TAG_LIMIT = 20

// `note` (and the `key` the parent assigns based on it) determine the
// initial field values. Remounting via key, rather than syncing in an
// effect, is what resets the form when switching between add/edit or
// between two different notes.
function NoteEditorDialog({ open, note, onClose, onSave, existingTags = [] }) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [isPreview, setIsPreview] = useState(false)
  const [tags, setTags] = useState(note?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [tagError, setTagError] = useState('')
  const [color, setColor] = useState(note?.color ?? '')
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null)

  const isEditing = Boolean(note)
  const datalistId = `tag-suggestions-${note?.id ?? 'new'}`
  const previewColor = (() => {
    if (color) return color
    const source = (title || note?.title || '').trim()
    if (!source) return NOTE_PRESET_COLORS[0]
    let hash = 0
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i)
      hash |= 0
    }
    return NOTE_PRESET_COLORS[Math.abs(hash) % NOTE_PRESET_COLORS.length]
  })()

  const normalizeTag = (raw) => raw.trim().toLowerCase()

  const addTag = (rawTag) => {
    const nextTag = normalizeTag(rawTag)
    if (!nextTag) return
    if (nextTag.includes(' ')) {
      setTagError('Tag must be a single word.')
      return
    }
    if (nextTag.length > TAG_MAX) {
      setTagError(`Tag must be ${TAG_MAX} characters or fewer.`)
      return
    }
    if (tags.includes(nextTag)) {
      setTagInput('')
      setTagError('')
      return
    }
    if (tags.length >= TAG_LIMIT) {
      setTagError(`At most ${TAG_LIMIT} tags allowed.`)
      return
    }
    setTags((prev) => [...prev, nextTag])
    setTagInput('')
    setTagError('')
  }

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const trySave = () => {
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle || !trimmedBody) {
      return
    }

    onSave({ title: trimmedTitle, body: trimmedBody, tags, color: color || null })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    trySave()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: { md: '840px' },
        },
      }}
      PaperProps={{ component: 'form', onSubmit: handleSubmit }}
    >
      <Box
        className="editor-color-band"
        sx={{ backgroundColor: previewColor }}
        aria-label="Selected note color preview"
      />
      <DialogTitle>{isEditing ? 'Edit note' : 'Add a new note'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            required
            fullWidth
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX))}
            helperText={`${title.length}/${TITLE_MAX}`}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Markdown supported.
            </Typography>
            <IconButton
              size="small"
              onClick={() => setIsPreview((prev) => !prev)}
              aria-label={isPreview ? 'Switch to edit mode' : 'Switch to preview mode'}
            >
              {isPreview ? <EditRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
            </IconButton>
          </Stack>

          {isPreview ? (
            <Paper variant="outlined" className="markdown-preview" sx={{ p: 1.5, minHeight: 168 }}>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {body || '_Nothing to preview yet._'}
                </ReactMarkdown>
              </div>
            </Paper>
          ) : (
            <TextField
              label="Note"
              required
              fullWidth
              multiline
              minRows={6}
              value={body}
              onChange={(event) => setBody(event.target.value.slice(0, BODY_MAX))}
              helperText={`${body.length}/${BODY_MAX}`}
            />
          )}

          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                label="Add tag"
                fullWidth
                value={tagInput}
                onChange={(event) => {
                  setTagInput(event.target.value)
                  if (tagError) setTagError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTag(tagInput)
                  }
                }}
                helperText={tagError || `Single word, max ${TAG_MAX} chars. Press Enter to add.`}
                error={Boolean(tagError)}
                inputProps={{ list: datalistId }}
              />
              <Button
                type="button"
                variant="outlined"
                startIcon={<AddCircleOutlineRounded />}
                onClick={() => addTag(tagInput)}
                sx={{ minWidth: 120, height: 56, flexShrink: 0 }}
              >
                Add tag
              </Button>
            </Stack>
            <datalist id={datalistId}>
              {existingTags
                .filter((tag) => !tags.includes(tag))
                .map((tag) => (
                  <option key={tag} value={tag} />
                ))}
            </datalist>
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              flexWrap="wrap"
              sx={{
                maxHeight: 106,
                overflowY: 'auto',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 1.5,
                p: 0.8,
              }}
            >
              {tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} onDelete={() => removeTag(tag)} />
              ))}
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" spacing={0.9} useFlexGap flexWrap="wrap" alignItems="center">
              {NOTE_PRESET_COLORS.map((preset) => (
                <IconButton
                  key={preset}
                  size="small"
                  type="button"
                  onClick={() => setColor(preset)}
                  aria-label={`Use color ${preset}`}
                  sx={{
                    border: color === preset ? '2px solid #e8f3ed' : '1px solid rgba(148, 163, 184, 0.4)',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: preset,
                  }}
                />
              ))}
              <IconButton
                size="small"
                type="button"
                onClick={(event) => setColorPickerAnchor(event.currentTarget)}
                aria-label="Pick custom color"
                sx={{
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                }}
              >
                <ColorizeRounded fontSize="small" />
              </IconButton>
            </Stack>
            <Popover
              open={Boolean(colorPickerAnchor)}
              anchorEl={colorPickerAnchor}
              onClose={() => setColorPickerAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box sx={{ p: 1.5, bgcolor: '#121a17' }}>
                <HexColorPicker
                  color={color || NOTE_PRESET_COLORS[0]}
                  onChange={(value) => setColor(value)}
                />
              </Box>
            </Popover>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          startIcon={isEditing ? <SaveRounded /> : <AddRounded />}
          onClick={trySave}
        >
          {isEditing ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NoteEditorDialog
