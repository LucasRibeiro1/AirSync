import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, alpha, useTheme,
} from '@mui/material';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useStore } from '../../store';
import { ICONES_MAP } from '../../components/layout/Header';

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, empresa } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    const result = login(username.trim(), password);
    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.msg);
      setLoading(false);
    }
  };

  const LogoIcon = () => {
    if (empresa.logo) {
      return (
        <Box
          component="img"
          src={empresa.logo}
          alt="Logo"
          sx={{ width: 52, height: 52, borderRadius: 2, objectFit: 'cover' }}
        />
      );
    }
    return (
      <Box sx={{
        width: 56, height: 56, borderRadius: 2.5,
        bgcolor: alpha('#1565c0', 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {ICONES_MAP[empresa.icone]
          ? <Box sx={{ color: 'primary.main', '& svg': { fontSize: 32 } }}>{ICONES_MAP[empresa.icone]}</Box>
          : <AcUnitIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
      </Box>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 55%, #01579b 100%)',
      p: 2,
    }}>
      <Card sx={{ maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Branding */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <LogoIcon />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
              {empresa.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {empresa.slogan}
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              size="medium"
              label="Usuário"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              sx={{ mb: 2 }}
              autoFocus
              autoComplete="username"
              inputProps={{ autoCapitalize: 'none' }}
            />

            <TextField
              fullWidth
              size="medium"
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !username.trim() || !password}
              startIcon={<LockOutlinedIcon />}
              sx={{ py: 1.25 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <Typography
            variant="caption"
            color="text.disabled"
            display="block"
            textAlign="center"
            sx={{ mt: 3 }}
          >
            AirSync v2.0 · Acesso restrito
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
