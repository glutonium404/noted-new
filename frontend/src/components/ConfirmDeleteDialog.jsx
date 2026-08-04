import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'

function ConfirmDeleteDialog({ open, noteTitle, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Delete this note?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {noteTitle
            ? `"${noteTitle}" will be removed permanently. This can't be undone.`
            : "This note will be removed permanently. This can't be undone."}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteOutlineRounded />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteDialog
