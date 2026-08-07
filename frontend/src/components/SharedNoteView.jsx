import { useEffect, useRef, useState } from 'react';
import { getSharedNote } from '../lib/noted';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DoneRounded from '@mui/icons-material/DoneRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  formatDate,
  getNoteActivityDate,
  resolveNoteColor
} from '../lib/noted';

export default function SharedNoteView({ shareId }) {
  const [note, setNote] = useState(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    getSharedNote(shareId)
      .then(data => setNote(data))
      .catch(() => setError(true));
  }, [shareId]);

  const handleCopy = async () => {
    if (!note) return;
    const textToCopy = `${note.title}\n\n${note.body || note.content || ''}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Silently ignore — clipboard access can be denied by the browser.
    }
  };

  const escapeHtml = (value) =>
    String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const handlePrintPdf = () => {
    if (!note) return;

    const bodyHtml = bodyRef.current?.innerHTML ?? `<p>${escapeHtml(note.body || note.content)}</p>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
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
`);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 250);
  };

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh"
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          404 - Note Not Found
        </Typography>
        <Typography variant="body1">
          This link is invalid or has been revoked by the owner.
        </Typography>
      </Box>
    );
  }

  if (!note) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '840px', margin: '40px auto', padding: '20px' }}>
      <Paper elevation={3} sx={{ backgroundColor: '#212121', overflow: 'hidden' }}>

        <Box sx={{ p: 3, pb: 2 }}>
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
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {note.updatedAt ? 'Updated ' : 'Created '}
            {formatDate(getNoteActivityDate(note))}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <div className="markdown-body" ref={bodyRef}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.body || note.content || ''}
            </ReactMarkdown>
          </div>
        </Box>
      </Paper>
    </Box>
  );
}
