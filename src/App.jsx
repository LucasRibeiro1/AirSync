import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Agenda from './pages/agenda/Agenda';
import Ordens from './pages/ordens/Ordens';
import Clientes from './pages/clientes/Clientes';
import Fornecedores from './pages/compras/Fornecedores';
import PedidosCompra from './pages/compras/PedidosCompra';
import Estoque from './pages/compras/Estoque';
import Orcamentos from './pages/vendas/Orcamentos';
import Vendas from './pages/vendas/Vendas';
import ContasReceber from './pages/financeiro/ContasReceber';
import ContasPagar from './pages/financeiro/ContasPagar';
import FluxoCaixa from './pages/financeiro/FluxoCaixa';
import Usuarios from './pages/usuarios/Usuarios';
import Configurador from './pages/configurador/Configurador';
import PMOC from './pages/pmoc/PMOC';
import PMOCContratos from './pages/pmoc/PMOCContratos';
import PMOCEquipamentos from './pages/pmoc/PMOCEquipamentos';
import PMOCPlanejamento from './pages/pmoc/PMOCPlanejamento';
import CalculadoraBTU from './pages/calculadora/CalculadoraBTU';
import SimuladorConsumo from './pages/simulador/SimuladorConsumo';
import Checklist from './pages/checklist/Checklist';
import { useStore } from './store';

const PRIMARY = '#1565c0';

export default function App() {
  const { tema } = useStore();
  const isDark = tema === 'dark';

  const theme = useMemo(() =>
    createTheme(
      {
        palette: {
          mode: tema,
          primary: { main: PRIMARY },
          secondary: { main: '#7b1fa2' },
          background: isDark
            ? { default: '#0d1117', paper: '#161b22' }
            : { default: '#f5f7fb', paper: '#ffffff' },
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: '"Inter", "Roboto", sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              outlined: {
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
            },
          },
          MuiTableContainer: {
            styleOverrides: { root: { borderRadius: 8 } },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: isDark ? '#94a3b8' : '#64748b',
                  backgroundColor: isDark ? '#1e2433' : '#f8fafc',
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  whiteSpace: 'nowrap',
                },
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: { '&:last-child .MuiTableCell-body': { borderBottom: 0 } },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                padding: '10px 16px',
                borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
              },
            },
          },
          MuiChip: {
            styleOverrides: { root: { fontWeight: 500 } },
          },
          MuiButton: {
            styleOverrides: {
              root: { textTransform: 'none', fontWeight: 600 },
              containedPrimary: {
                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                '&:hover': { boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.4)}` },
              },
            },
          },
          MuiInputBase: {
            styleOverrides: { root: { fontSize: '0.875rem' } },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)',
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: { paper: { backgroundImage: 'none' } },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: { root: { borderRadius: 8 } },
          },
        },
      },
      ptBR
    ),
    [tema, isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Core */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/ordens" element={<Ordens />} />
            <Route path="/clientes" element={<Clientes />} />

            {/* PMOC */}
            <Route path="/pmoc" element={<PMOC />} />
            <Route path="/pmoc/contratos" element={<PMOCContratos />} />
            <Route path="/pmoc/equipamentos" element={<PMOCEquipamentos />} />
            <Route path="/pmoc/planejamento" element={<PMOCPlanejamento />} />

            {/* Checklist */}
            <Route path="/checklist" element={<Checklist />} />

            {/* Ferramentas */}
            <Route path="/calculadora" element={<CalculadoraBTU />} />
            <Route path="/simulador" element={<SimuladorConsumo />} />

            {/* Compras */}
            <Route path="/compras/fornecedores" element={<Fornecedores />} />
            <Route path="/compras/pedidos" element={<PedidosCompra />} />
            <Route path="/compras/estoque" element={<Estoque />} />

            {/* Vendas */}
            <Route path="/vendas/orcamentos" element={<Orcamentos />} />
            <Route path="/vendas/lista" element={<Vendas />} />

            {/* Financeiro */}
            <Route path="/financeiro/receber" element={<ContasReceber />} />
            <Route path="/financeiro/pagar" element={<ContasPagar />} />
            <Route path="/financeiro/fluxo" element={<FluxoCaixa />} />

            {/* Configurações */}
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configurador" element={<Configurador />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
