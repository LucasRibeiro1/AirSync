import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem,
  Tooltip, Badge, useTheme, Divider, ListItemIcon, alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HandymanIcon from '@mui/icons-material/Handyman';
import BusinessIcon from '@mui/icons-material/Business';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ConstructionIcon from '@mui/icons-material/Construction';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export const ICONES_MAP = {
  AcUnit: <AcUnitIcon />,
  Build: <BuildIcon />,
  Engineering: <EngineeringIcon />,
  Handyman: <HandymanIcon />,
  Business: <BusinessIcon />,
  HomeRepairService: <HomeRepairServiceIcon />,
  ElectricalServices: <ElectricalServicesIcon />,
  Plumbing: <PlumbingIcon />,
  Construction: <ConstructionIcon />,
  Thermostat: <ThermostatIcon />,
  WaterDrop: <WaterDropIcon />,
  Settings: <SettingsIcon />,
  Storefront: <StorefrontIcon />,
};

export default function Header({ onMenuClick }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { authUser, logout, tema, setTema, empresa } = useStore();
  const [anchor, setAnchor] = useState(null);

  const handleLogout = () => {
    setAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

  const IconeEmpresa = () => {
    if (empresa.logo) {
      return (
        <Box
          component="img"
          src={empresa.logo}
          alt="Logo"
          sx={{ width: 28, height: 28, borderRadius: 1, objectFit: 'cover' }}
        />
      );
    }
    const icone = ICONES_MAP[empresa.icone] || ICONES_MAP.AcUnit;
    return (
      <Box sx={{
        width: 28, height: 28, borderRadius: 1,
        bgcolor: alpha(theme.palette.primary.main, 0.12),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'primary.main',
        '& svg': { fontSize: 18 },
      }}>
        {icone}
      </Box>
    );
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 0.5, minHeight: 64 }}>
        {/* Mobile menu */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 0.5, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Nome da empresa — visível em todas as larguras */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          flexGrow: { xs: 1, md: 0 },
        }}>
          <IconeEmpresa />
          <Box sx={{ display: { xs: 'block', md: 'block' } }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="primary.main"
              sx={{ lineHeight: 1.1, fontSize: '0.9rem' }}
            >
              {empresa.nome}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}
            >
              {empresa.slogan}
            </Typography>
          </Box>
        </Box>

        {/* Espaçador */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Ações */}
        <Tooltip title={tema === 'light' ? 'Modo escuro' : 'Modo claro'}>
          <IconButton onClick={() => setTema(tema === 'light' ? 'dark' : 'light')} size="small">
            {tema === 'light' ? <Brightness4Icon fontSize="small" /> : <Brightness7Icon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notificações">
          <IconButton size="small">
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Avatar / perfil */}
        <Tooltip title="Minha conta">
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ ml: 0.5, p: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
              {authUser?.nome?.charAt(0) || '?'}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 0.5, minWidth: 200 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600}>{authUser?.nome}</Typography>
          <Typography variant="caption" color="text.secondary">{authUser?.email}</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ bgcolor: 'primary.main', color: 'white', px: 1, py: 0.25, borderRadius: 4, fontSize: '0.65rem' }}
            >
              {authUser?.perfil}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={() => setAnchor(null)} dense>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={handleLogout} dense sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
