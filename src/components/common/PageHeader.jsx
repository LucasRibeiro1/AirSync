import { Box, Typography, Button, Breadcrumbs, Link, useTheme, alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function PageHeader({ title, subtitle, action, actionLabel, breadcrumbs, icon, secondaryAction, secondaryLabel, secondaryIcon }) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ fontSize: 14 }} />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((b, i) =>
            i < breadcrumbs.length - 1 ? (
              <Typography key={b} variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>{b}</Typography>
            ) : (
              <Typography key={b} variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{b}</Typography>
            )
          )}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'primary.main',
            }}>
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{subtitle}</Typography>
            )}
          </Box>
        </Box>

        {(action || secondaryAction) && (
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            {secondaryAction && (
              <Button variant="outlined" startIcon={secondaryIcon} onClick={secondaryAction}>
                {secondaryLabel}
              </Button>
            )}
            {action && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={action}>
                {actionLabel}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
