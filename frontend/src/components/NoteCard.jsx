import { Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import PushPinRounded from '@mui/icons-material/PushPinRounded'
import PushPinOutlined from '@mui/icons-material/PushPinOutlined'
import { formatDate, getNoteActivityDate, resolveNoteColor } from '../lib/noted'

function NoteCard({ note, onOpen, onEdit, onDelete, onTogglePin }) {
  const visibleTags = (note.tags ?? []).slice(0, 5)
  const remainingTagCount = Math.max((note.tags ?? []).length - visibleTags.length, 0)

  return (
    <Card
      variant="outlined"
      className={`note-card${note.pinned ? ' note-card-pinned' : ''}`}
      onClick={() => onOpen(note)}
      style={{ '--spine-color': resolveNoteColor(note) }}
    >
      <span className="note-spine" aria-hidden="true" />
      <CardContent sx={{ p: 2.2, pl: 2.6, '&:last-child': { pb: 2.2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography
            variant="h6"
            className="note-title-text"
            noWrap
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            {note.title}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 'auto' }}>
            <Tooltip title={note.pinned ? 'Unpin' : 'Pin'}>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  onTogglePin(note)
                }}
                aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                sx={note.pinned ? { color: 'primary.main' } : undefined}
              >
                {note.pinned ? (
                  <PushPinRounded sx={{ fontSize: '1.3rem' }} />
                ) : (
                  <PushPinOutlined sx={{ fontSize: '1.3rem' }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(note)
                }}
                aria-label={`Edit ${note.title}`}
              >
                <EditRounded sx={{ fontSize: '1.3rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(note)
                }}
                aria-label={`Delete ${note.title}`}
              >
                <DeleteOutlineRounded sx={{ fontSize: '1.3rem' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          {note.updatedAt ? 'Updated ' : 'Created '}
          {formatDate(getNoteActivityDate(note))}
        </Typography>
        <Typography className="note-preview">{note.body}</Typography>
        {note.tags?.length > 0 && (
          <Stack direction="row" spacing={0.6} mt={1.1} useFlexGap flexWrap="wrap">
            {visibleTags.map((tag) => (
              <Chip key={tag} size="small" label={`#${tag}`} variant="outlined" />
            ))}
            {remainingTagCount > 0 && (
              <Chip size="small" label={`+${remainingTagCount}`} variant="outlined" />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default NoteCard
