import { Card, CardContent, Box, Typography, useTheme, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function StatCard({ title, value, subtitle, icon, color = 'primary', trend, onClick }) {
  const theme = useTheme();
  const palette = theme.palette[color] ?? theme.palette.primary;
  const main = palette.main;
  const light = palette.light ?? main;

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.18s, box-shadow 0.18s',
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${alpha(main, 0.18)}`,
          },
        }),
      }}
    >
      {/* Accent stripe */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${main} 0%, ${alpha(light, 0.5)} 100%)`,
      }} />

      {/* Decorative circle */}
      <Box sx={{
        position: 'absolute', right: -20, bottom: -20,
        width: 100, height: 100, borderRadius: '50%',
        bgcolor: alpha(main, 0.04),
        pointerEvents: 'none',
      }} />

      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Icon container */}
          <Box sx={{
            width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
            background: `linear-gradient(135deg, ${main} 0%, ${alpha(light, 0.75)} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            boxShadow: `0 4px 14px ${alpha(main, 0.35)}`,
            '& svg': { fontSize: 16 },
          }}>
            {icon}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.3 }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ lineHeight: 1.15, mt: 0.75, mb: 0.5, fontSize: 'clamp(1.4rem, 2vw, 1.85rem)' }}
            >
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block"
              sx={{ fontSize: '0.75rem', minHeight: '1.1rem' }}>
              {subtitle}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75, minHeight: 24 }}>
              {trend !== undefined && (
                <>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.25,
                    px: 0.75, py: 0.2, borderRadius: 1,
                    bgcolor: alpha(trend >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.1),
                    color: trend >= 0 ? 'success.main' : 'error.main',
                  }}>
                    {trend >= 0
                      ? <TrendingUpIcon sx={{ fontSize: 13 }} />
                      : <TrendingDownIcon sx={{ fontSize: 13 }} />}
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                      {Math.abs(trend)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                    vs. mês anterior
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
