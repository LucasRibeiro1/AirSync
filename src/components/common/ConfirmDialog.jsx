import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Box, useTheme, alpha,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function ConfirmDialog({ open, title, message, onConfirm, onClose, onCancel, confirmLabel = 'Confirmar', confirmColor = 'error' }) {
  const handleClose = onCancel || onClose;
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: alpha(theme.palette[confirmColor]?.main || theme.palette.error.main, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: `${confirmColor}.main`,
            flexShrink: 0,
          }}>
            <WarningAmberIcon fontSize="small" />
          </Box>
          <Box>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1rem' }}>{title || 'Confirmar ação'}</Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <DialogContentText sx={{ fontSize: '0.875rem' }}>
          {message || 'Deseja confirmar esta ação?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" sx={{ flex: 1 }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
