import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Divider, Collapse, useTheme, alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TuneIcon from '@mui/icons-material/Tune';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import BuildIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { ICONES_MAP } from './Header';
import { useStore } from '../../store';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/', module: 'Dashboard' },
  { label: 'Agenda', icon: <CalendarMonthIcon />, path: '/agenda', module: 'Agenda' },
  { label: 'Ordens de Serviço', icon: <AssignmentIcon />, path: '/ordens', module: 'Ordens de Serviço' },
  { label: 'Clientes', icon: <PeopleIcon />, path: '/clientes', module: 'Clientes' },
  {
    label: 'PMOC', icon: <ArticleIcon />, module: 'PMOC',
    children: [
      { label: 'Dashboard PMOC', path: '/pmoc' },
      { label: 'Contratos', path: '/pmoc/contratos' },
      { label: 'Equipamentos', path: '/pmoc/equipamentos' },
      { label: 'Planejamento', path: '/pmoc/planejamento' },
    ],
  },
  { label: 'Checklist Técnico', icon: <AssignmentTurnedInIcon />, path: '/checklist', module: 'Checklist Técnico' },
  {
    label: 'Ferramentas', icon: <BuildIcon />, module: 'Ferramentas',
    children: [
      { label: 'Calculadora BTU', path: '/calculadora' },
      { label: 'Simulador de Consumo', path: '/simulador' },
    ],
  },
  {
    label: 'Compras', icon: <ShoppingCartIcon />, module: 'Compras',
    children: [
      { label: 'Fornecedores', path: '/compras/fornecedores' },
      { label: 'Pedidos de Compra', path: '/compras/pedidos' },
      { label: 'Estoque', path: '/compras/estoque' },
    ],
  },
  {
    label: 'Vendas', icon: <PointOfSaleIcon />, module: 'Vendas',
    children: [
      { label: 'Orçamentos', path: '/vendas/orcamentos' },
      { label: 'Vendas', path: '/vendas/lista' },
    ],
  },
  {
    label: 'Financeiro', icon: <AccountBalanceWalletIcon />, module: 'Financeiro',
    children: [
      { label: 'Contas a Receber', path: '/financeiro/receber' },
      { label: 'Contas a Pagar', path: '/financeiro/pagar' },
      { label: 'Fluxo de Caixa', path: '/financeiro/fluxo' },
    ],
  },
  { label: 'Configurador', icon: <TuneIcon />, path: '/configurador', module: 'Configurador' },
];

const ADMIN_ITEMS = [
  { label: 'Gerenciar Acesso', icon: <AdminPanelSettingsIcon />, path: '/admin', module: '__admin__' },
];

export default function Sidebar({ open, onClose, variant }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState({});
  const { empresa, authUser } = useStore();

  const primaryMain = theme.palette.primary.main;

  const hasPermission = (module) => {
    if (!module) return true;
    if (module === '__admin__') return authUser?.isAdmin === true;
    if (authUser?.isAdmin || authUser?.permissoes?.includes('*')) return true;
    return authUser?.permissoes?.includes(module) || false;
  };

  const visibleItems = [...NAV_ITEMS, ...ADMIN_ITEMS].filter((item) => hasPermission(item.module));

  const handleToggle = (label) =>
    setExpanded((p) => ({ ...p, [label]: !p[label] }));

  const handleNav = (path) => {
    navigate(path);
    if (variant === 'temporary') onClose();
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (children) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  const activeItemSx = {
    bgcolor: alpha(primaryMain, 0.1),
    color: primaryMain,
    '& .MuiListItemIcon-root': { color: primaryMain },
    '&:hover': { bgcolor: alpha(primaryMain, 0.14) },
  };

  const baseItemSx = {
    borderRadius: 1.5,
    mb: 0.25,
    transition: 'background 0.15s',
    '&:hover': { bgcolor: alpha(primaryMain, 0.06) },
  };

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <Toolbar sx={{ gap: 1.5, py: 2, minHeight: 64 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 1.5,
          bgcolor: alpha(primaryMain, 0.12),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {empresa.logo ? (
            <Box component="img" src={empresa.logo} alt="Logo"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box sx={{ color: 'primary.main', display: 'flex', '& svg': { fontSize: 22 } }}>
              {ICONES_MAP[empresa.icone] || <AcUnitIcon sx={{ fontSize: 22 }} />}
            </Box>
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1} color="primary.main" noWrap>
            {empresa.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }} noWrap>
            {empresa.slogan}
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.25, py: 1.5, overflowY: 'auto', overflowX: 'hidden' }}>
        {visibleItems.map((item) =>
          item.children ? (
            <Box key={item.label}>
              <ListItemButton
                onClick={() => handleToggle(item.label)}
                sx={{
                  ...baseItemSx,
                  mb: 0.25,
                  ...(isParentActive(item.children) ? activeItemSx : {}),
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 13.5, fontWeight: isParentActive(item.children) ? 600 : 400 }}
                />
                {expanded[item.label] || isParentActive(item.children)
                  ? <ExpandLess fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                  : <ExpandMore fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />}
              </ListItemButton>

              <Collapse
                in={expanded[item.label] || isParentActive(item.children)}
                timeout="auto"
                unmountOnExit
              >
                <List disablePadding sx={{ pl: 1.5, mb: 0.5 }}>
                  {item.children.map((child) => {
                    const active = isActive(child.path);
                    return (
                      <ListItemButton
                        key={child.path}
                        onClick={() => handleNav(child.path)}
                        sx={{
                          ...baseItemSx,
                          py: 0.625,
                          pl: 1.5,
                          ...(active ? activeItemSx : {}),
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <FiberManualRecordIcon
                            sx={{
                              fontSize: active ? 8 : 6,
                              color: active ? 'primary.main' : 'text.disabled',
                              transition: 'all 0.15s',
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            color: active ? 'primary.main' : 'text.secondary',
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          ) : (
            <ListItemButton
              key={item.path}
              onClick={() => handleNav(item.path)}
              sx={{
                ...baseItemSx,
                ...(isActive(item.path) ? activeItemSx : {}),
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13.5,
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          )
        )}
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          AirSync v2.0 · {empresa.nome}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {content}
    </Drawer>
  );
}
