import { Box, Typography, useTheme, alpha } from '@mui/material';
import { statusColor } from '../../utils';

const COLOR_MAP = {
  primary: '#1565c0',
  secondary: '#7b1fa2',
  success: '#2e7d32',
  warning: '#e65100',
  error: '#c62828',
  info: '#01579b',
  default: '#546e7a',
};

export default function StatusChip({ status, size = 'small' }) {
  const theme = useTheme();
  const colorKey = statusColor(status);
  const hexColor = theme.palette[colorKey]?.main || COLOR_MAP[colorKey] || COLOR_MAP.default;

  if (size === 'medium') {
    return (
      <Box component="span" sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.6,
        px: 1.25, py: 0.4, borderRadius: 1.5,
        bgcolor: alpha(hexColor, 0.1),
        border: `1px solid ${alpha(hexColor, 0.25)}`,
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: hexColor, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: hexColor, fontWeight: 600, fontSize: '0.75rem', lineHeight: 1 }}>
          {status}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1, py: 0.3, borderRadius: 1,
      bgcolor: alpha(hexColor, 0.1),
      border: `1px solid ${alpha(hexColor, 0.2)}`,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: hexColor, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: hexColor, fontWeight: 600, fontSize: '0.7rem', lineHeight: 1, whiteSpace: 'nowrap' }}>
        {status}
      </Typography>
    </Box>
  );
}
