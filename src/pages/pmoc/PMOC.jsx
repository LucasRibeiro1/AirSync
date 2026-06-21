import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Alert, AlertTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Divider, Stack, useTheme, alpha, Avatar,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ReportProblem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useStore } from '../../store';
import { formatDate, formatCurrency } from '../../utils';

const statusContrato = (dataVencimento) => {
  const dias = Math.ceil((new Date(dataVencimento) - new Date()) / 86400000);
  if (dias < 0) return { label: 'Vencido', color: 'error' };
  if (dias <= 30) return { label: 'Vence em breve', color: 'warning' };
  return { label: 'Ativo', color: 'success' };
};

function QuickStat({ label, value, color, icon }) {
  const theme = useTheme();
  const main = theme.palette[color]?.main || theme.palette.primary.main;
  return (
    <Box sx={{
      flex: 1, p: 2, borderRadius: 2, textAlign: 'center',
      bgcolor: alpha(main, 0.08),
      border: `1px solid ${alpha(main, 0.2)}`,
    }}>
      <Box sx={{ color: main, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h5" fontWeight={800} color={`${color}.main`}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{label}</Typography>
    </Box>
  );
}

export default function PMOC() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { contratosPMOC, equipamentosPMOC, manutencoesPMOC } = useStore();

  const stats = useMemo(() => {
    const hoje = new Date();
    const ativos = contratosPMOC.filter((c) => Math.ceil((new Date(c.dataVencimento) - hoje) / 86400000) > 30);
    const vencidos = contratosPMOC.filter((c) => new Date(c.dataVencimento) < hoje);
    const proximosVencer = contratosPMOC.filter((c) => {
      const d = Math.ceil((new Date(c.dataVencimento) - hoje) / 86400000);
      return d >= 0 && d <= 30;
    });
    const programadas = manutencoesPMOC.filter((m) => m.status === 'Agendada');
    const realizadas = manutencoesPMOC.filter((m) => m.status === 'Realizada');
    const receitaRecorrente = [...ativos, ...proximosVencer].reduce((acc, c) => acc + (c.valor || 0), 0);
    return {
      ativos: ativos.length, vencidos: vencidos.length,
      proximosVencer: proximosVencer.length, programadas: programadas.length,
      realizadas: realizadas.length, receitaRecorrente,
    };
  }, [contratosPMOC, manutencoesPMOC]);

  const proximasManutencoes = useMemo(() =>
    [...manutencoesPMOC]
      .filter((m) => m.status === 'Agendada')
      .sort((a, b) => new Date(a.dataAgendada) - new Date(b.dataAgendada))
      .slice(0, 8),
    [manutencoesPMOC]
  );

  const alertasContratos = useMemo(() =>
    contratosPMOC.filter((c) => {
      const d = Math.ceil((new Date(c.dataVencimento) - new Date()) / 86400000);
      return d >= -7 && d <= 30;
    }).sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento)),
    [contratosPMOC]
  );

  const chartData = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses.map((mes, i) => ({
      mes,
      programadas: manutencoesPMOC.filter((m) => new Date(m.dataAgendada).getMonth() === i && m.status === 'Agendada').length,
      realizadas: manutencoesPMOC.filter((m) => new Date(m.dataAgendada).getMonth() === i && m.status === 'Realizada').length,
    }));
  }, [manutencoesPMOC]);

  const diffDias = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
  const tickStyle = { fontSize: 11, fill: theme.palette.text.secondary };

  return (
    <Box>
      <PageHeader
        title="PMOC — Plano de Manutenção"
        subtitle="Controle de contratos, equipamentos e manutenções preventivas"
        breadcrumbs={['PMOC', 'Dashboard']}
      />

      {/* Alertas */}
      {alertasContratos.length > 0 && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {alertasContratos.map((c) => {
            const dias = diffDias(c.dataVencimento);
            return (
              <Alert
                key={c.id}
                severity={dias < 0 ? 'error' : 'warning'}
                icon={dias < 0 ? <ErrorOutlineIcon /> : <WarningAmberIcon />}
                action={
                  <Button size="small" onClick={() => navigate('/pmoc/contratos')} sx={{ whiteSpace: 'nowrap' }}>
                    Ver contrato
                  </Button>
                }
                sx={{ borderRadius: 2 }}
              >
                <AlertTitle sx={{ mb: 0 }}>
                  {dias < 0
                    ? `Contrato vencido há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}`
                    : `Contrato vence em ${dias} dia${dias !== 1 ? 's' : ''}`}
                </AlertTitle>
                <Typography variant="caption">
                  {c.numero} · {c.clienteNome} ({c.unidade}) · Vencimento: {formatDate(c.dataVencimento)}
                </Typography>
              </Alert>
            );
          })}
        </Stack>
      )}

      {/* KPIs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2.5, mb: 3 }}>
        <StatCard title="Contratos Ativos" value={stats.ativos} icon={<ArticleIcon />} color="primary" subtitle="+30 dias" onClick={() => navigate('/pmoc/contratos')} />
        <StatCard title="Contratos Vencidos" value={stats.vencidos} icon={<ErrorOutlineIcon />} color="error" subtitle="Renovar" onClick={() => navigate('/pmoc/contratos')} />
        <StatCard title="Próx. Vencimento" value={stats.proximosVencer} icon={<WarningAmberIcon />} color="warning" subtitle="≤ 30 dias" onClick={() => navigate('/pmoc/contratos')} />
        <StatCard title="Equipamentos" value={equipamentosPMOC.length} icon={<AcUnitIcon />} color="info" subtitle="Cadastrados" onClick={() => navigate('/pmoc/equipamentos')} />
        <StatCard title="Agendadas" value={stats.programadas} icon={<CalendarMonthIcon />} color="secondary" subtitle="Manutenções" onClick={() => navigate('/pmoc/planejamento')} />
        <StatCard title="Realizadas" value={stats.realizadas} icon={<CheckCircleIcon />} color="success" subtitle="Concluídas" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2.5, mb: 3 }}>
        {/* Gráfico manutenções */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Manutenções por Mês</Typography>
                  <Typography variant="caption" color="text.secondary">Programadas × Realizadas no ano</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/pmoc/planejamento')}>
                  Ver planejamento
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barGap={3} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="0" stroke={alpha(theme.palette.divider, 0.6)} vertical={false} />
                  <XAxis dataKey="mes" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="programadas" name="Programadas" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="realizadas" name="Realizadas" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        {/* Receita recorrente */}
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Resumo Financeiro</Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Receita em destaque */}
              <Box sx={{
                p: 2.5, borderRadius: 2, textAlign: 'center', mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.dark, 0.85)} 100%)`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.25)}`,
              }}>
                <MonetizationOnIcon sx={{ color: alpha('#fff', 0.8), fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.75), display: 'block' }}>
                  Receita Recorrente Mensal
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mt: 0.5 }}>
                  {formatCurrency(stats.receitaRecorrente)}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.65) }}>
                  Soma dos contratos ativos
                </Typography>
              </Box>

              {/* Distribuição por frequência */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Por Frequência</Typography>
              <Stack spacing={0.75} sx={{ flex: 1 }}>
                {['Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'].map((freq) => {
                  const count = contratosPMOC.filter((c) => c.frequencia === freq).length;
                  if (!count) return null;
                  return (
                    <Box key={freq} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1, borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}>
                      <Typography variant="body2" color="text.secondary">{freq}</Typography>
                      <Chip label={`${count} contrato${count > 1 ? 's' : ''}`} size="small" color="primary" variant="outlined" />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
      </Box>

      {/* Próximas manutenções */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Próximas Manutenções</Typography>
              <Typography variant="caption" color="text.secondary">Agendadas em ordem cronológica</Typography>
            </Box>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/pmoc/planejamento')}>
              Ver todas
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Equipamento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proximasManutencoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CalendarMonthIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography color="text.secondary" variant="body2">Nenhuma manutenção agendada</Typography>
                    </TableCell>
                  </TableRow>
                ) : proximasManutencoes.map((m) => {
                  const dias = diffDias(m.dataAgendada);
                  const urgente = dias <= 3;
                  return (
                    <TableRow key={m.id} hover sx={urgente ? { bgcolor: alpha(theme.palette.warning.main, 0.04) } : {}}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color={urgente ? 'warning.main' : 'inherit'}>
                            {formatDate(m.dataAgendada)}
                          </Typography>
                          <Typography variant="caption" color={dias < 0 ? 'error.main' : dias <= 7 ? 'warning.main' : 'text.disabled'}>
                            {dias < 0 ? `${Math.abs(dias)}d atrasada` : dias === 0 ? 'Hoje' : `em ${dias}d`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: 11, fontWeight: 700 }}>
                            {m.clienteNome.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{m.clienteNome}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{m.equipamentoNome}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={m.tipo} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{m.tecnicoNome || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.status}
                          size="small"
                          color={m.status === 'Realizada' ? 'success' : m.status === 'Agendada' ? 'primary' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
