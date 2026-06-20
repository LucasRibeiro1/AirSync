import {
  Grid, Card, CardContent, Typography, Box, Divider,
  useTheme, alpha, Avatar, Chip, Button, Stack,
} from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildIcon from '@mui/icons-material/Build';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import { useStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils';
import { useNavigate } from 'react-router-dom';

const faturamentoMensal = [
  { mes: 'Jan', valor: 18500 }, { mes: 'Fev', valor: 22000 }, { mes: 'Mar', valor: 19800 },
  { mes: 'Abr', valor: 26500 }, { mes: 'Mai', valor: 24000 }, { mes: 'Jun', valor: 31000 },
  { mes: 'Jul', valor: 28400 }, { mes: 'Ago', valor: 33200 }, { mes: 'Set', valor: 29800 },
];

const tiposOS = [
  { name: 'Instalação', value: 35 },
  { name: 'Preventiva', value: 28 },
  { name: 'Corretiva', value: 22 },
  { name: 'Higienização', value: 15 },
];

const PIE_COLORS = ['#1565c0', '#43a047', '#fb8c00', '#7b1fa2'];

function CustomAreaTooltip({ active, payload, label }) {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1.5, px: 2, py: 1.25,
      boxShadow: theme.shadows[4],
    }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mt: 0.25 }}>
        {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {action && (
        <Button size="small" endIcon={<ArrowForwardIcon />} onClick={onAction} sx={{ fontSize: 12 }}>
          {action}
        </Button>
      )}
    </Box>
  );
}

function AgendaItem({ ag }) {
  const theme = useTheme();
  const colors = {
    'Agendado': theme.palette.info.main,
    'Confirmado': theme.palette.primary.main,
    'Em atendimento': theme.palette.warning.main,
    'Concluído': theme.palette.success.main,
  };
  const c = colors[ag.status] || theme.palette.grey[400];

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25,
      borderLeft: `3px solid ${c}`,
      pl: 1.5, borderRadius: '0 6px 6px 0',
      bgcolor: alpha(c, 0.04), mb: 0.75,
    }}>
      <Box sx={{
        minWidth: 44, textAlign: 'center',
        bgcolor: alpha(c, 0.1), borderRadius: 1, py: 0.5,
      }}>
        <Typography variant="caption" fontWeight={700} color={c} sx={{ display: 'block', lineHeight: 1 }}>
          {ag.horario}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{ag.clienteNome}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{ag.tipo}</Typography>
      </Box>
      <StatusChip status={ag.status} />
    </Box>
  );
}

function OSItem({ os }) {
  const theme = useTheme();
  const colors = {
    'Concluída': theme.palette.success.main,
    'Em Andamento': theme.palette.warning.main,
    'Agendada': theme.palette.info.main,
    'Cancelada': theme.palette.error.main,
  };
  const c = colors[os.status] || theme.palette.grey[400];

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25,
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:last-child': { borderBottom: 0 },
    }}>
      <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(c, 0.12), color: c, fontSize: 13, fontWeight: 700 }}>
        {os.clienteNome.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" fontWeight={700} color="primary.main">{os.numero}</Typography>
          <StatusChip status={os.status} />
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>{os.clienteNome} · {os.tipo}</Typography>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { agendamentos, ordens, contasReceber, contasPagar, contratosPMOC, usuario } = useStore();
  const theme = useTheme();
  const today = new Date().toISOString().split('T')[0];

  const agendadosHoje = agendamentos.filter((a) => a.data === today);
  const emAndamento = ordens.filter((o) => o.status === 'Em Andamento');
  const totalReceber = contasReceber.filter((c) => c.situacao === 'Aberto').reduce((s, c) => s + c.valor, 0);
  const totalPagar = contasPagar.filter((c) => c.situacao === 'Aberto').reduce((s, c) => s + c.valor, 0);
  const saldo = totalReceber - totalPagar;
  const pmocAtivos = contratosPMOC.filter((c) => new Date(c.dataVencimento) > new Date()).length;
  const pmocVencendo = contratosPMOC.filter((c) => {
    const d = Math.ceil((new Date(c.dataVencimento) - new Date()) / 86400000);
    return d >= 0 && d <= 30;
  }).length;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const tickStyle = { fontSize: 11, fill: theme.palette.text.secondary };
  const PRIMARY = theme.palette.primary.main;

  return (
    <Box>
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <Card sx={{
        mb: 3, overflow: 'hidden', position: 'relative',
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #0d3b6e 100%)`,
        border: 'none',
        boxShadow: `0 8px 32px ${alpha(PRIMARY, 0.3)}`,
      }}>
        {/* Decorative orbs */}
        <Box sx={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
        <Box sx={{ position: 'absolute', right: 80, bottom: -70, width: 180, height: 180, borderRadius: '50%', bgcolor: alpha('#fff', 0.04) }} />
        <Box sx={{ position: 'absolute', left: '40%', top: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.03) }} />

        <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, position: 'relative', zIndex: 1 }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{
                  width: 48, height: 48, bgcolor: alpha('#fff', 0.15),
                  fontSize: 20, fontWeight: 700, color: '#fff',
                  border: `2px solid ${alpha('#fff', 0.3)}`,
                }}>
                  {usuario.nome.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
                    {saudacao}, {usuario.nome.split(' ')[0]}!
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={usuario.perfil}
                size="small"
                sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${alpha('#fff', 0.25)}` }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, justifyContent: { md: 'flex-end' } }}>
                {[
                  { label: 'Agenda hoje', value: agendadosHoje.length },
                  { label: 'OS em aberto', value: emAndamento.length },
                  { label: 'PMOCs ativos', value: pmocAtivos },
                ].map((item) => (
                  <Box key={item.label} sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>
                      {item.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.65), display: 'block', mt: 0.25 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── KPIs ───────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <StatCard
            title="Agendamentos Hoje"
            value={agendadosHoje.length}
            subtitle={`${agendamentos.length} no total`}
            icon={<CalendarTodayIcon />}
            color="primary"
            trend={12}
            onClick={() => navigate('/agenda')}
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <StatCard
            title="OS em Andamento"
            value={emAndamento.length}
            subtitle={`${ordens.length} OS abertas`}
            icon={<AssignmentIcon />}
            color="warning"
            onClick={() => navigate('/ordens')}
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <StatCard
            title="A Receber"
            value={formatCurrency(totalReceber)}
            subtitle="Contas em aberto"
            icon={<AttachMoneyIcon />}
            color="success"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <StatCard
            title="Saldo Projetado"
            value={formatCurrency(saldo)}
            subtitle={`A pagar: ${formatCurrency(totalPagar)}`}
            icon={<TrendingUpIcon />}
            color={saldo >= 0 ? 'success' : 'error'}
          />
        </Grid>
      </Grid>

      {/* ── Gráficos ───────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '& .recharts-surface': { overflow: 'visible' } }}>
              <SectionHeader title="Faturamento Mensal" subtitle="Evolução da receita nos últimos meses" />
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={faturamentoMensal} margin={{ top: 16, right: 24, left: 0, bottom: 16 }}>
                  <defs>
                    <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke={alpha(theme.palette.divider, 0.6)} vertical={false} />
                  <XAxis dataKey="mes" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={58} />
                  <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: alpha(PRIMARY, 0.2), strokeWidth: 1 }} />
                  <Area
                    type="monotone" dataKey="valor"
                    stroke={PRIMARY} strokeWidth={2.5}
                    fill="url(#gradFat)" dot={false}
                    activeDot={{ r: 5, fill: PRIMARY, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ '& .recharts-surface': { overflow: 'visible' } }}>
              <SectionHeader title="Tipos de OS" subtitle="Distribuição do mês" />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={tiposOS} cx="50%" cy="50%"
                    innerRadius={40} outerRadius={62}
                    paddingAngle={3} dataKey="value"
                    strokeWidth={0}
                  >
                    {tiposOS.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Part.']}
                    contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={0.75} sx={{ mt: 1 }}>
                {tiposOS.map((t, i) => (
                  <Box key={t.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[i], flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ flex: 1 }}>{t.name}</Typography>
                    <Typography variant="caption" fontWeight={700}>{t.value}%</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── PMOC + Indicadores ─────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SectionHeader title="PMOC" subtitle="Visão rápida dos contratos" action="Ver PMOC" onAction={() => navigate('/pmoc')} />
              <Stack spacing={1.5}>
                {[
                  { label: 'Contratos ativos', value: pmocAtivos, color: 'success' },
                  { label: 'Vencendo em 30d', value: pmocVencendo, color: pmocVencendo > 0 ? 'warning' : 'success' },
                  { label: 'Total de contratos', value: contratosPMOC.length, color: 'primary' },
                ].map((item) => (
                  <Box key={item.label} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: 1.5, borderRadius: 1.5,
                    bgcolor: alpha(theme.palette[item.color].main, 0.06),
                  }}>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" fontWeight={700} color={`${item.color}.main`}>{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SectionHeader title="Indicadores do Mês" subtitle="Performance operacional" />
              <Grid container spacing={2}>
                {[
                  { label: 'Total de OS', value: ordens.length, icon: <AssignmentIcon />, color: 'primary' },
                  { label: 'Instalações', value: ordens.filter((o) => o.tipo === 'Instalação').length, icon: <AcUnitIcon />, color: 'info' },
                  { label: 'Manutenções', value: ordens.filter((o) => o.tipo?.includes('Manutenção')).length, icon: <BuildIcon />, color: 'warning' },
                  { label: 'Concluídas', value: ordens.filter((o) => o.status === 'Concluída').length, icon: <CheckCircleIcon />, color: 'success' },
                ].map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Box sx={{
                      p: 2, borderRadius: 2, textAlign: 'center',
                      border: `1px solid ${alpha(theme.palette[item.color].main, 0.2)}`,
                      bgcolor: alpha(theme.palette[item.color].main, 0.04),
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <Box sx={{
                        position: 'absolute', right: -12, top: -12,
                        width: 60, height: 60, borderRadius: '50%',
                        bgcolor: alpha(theme.palette[item.color].main, 0.08),
                      }} />
                      <Box sx={{ color: `${item.color}.main`, mb: 0.5, position: 'relative' }}>{item.icon}</Box>
                      <Typography variant="h4" fontWeight={800} color={`${item.color}.main`}>{item.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Agenda + OS ────────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionHeader
                title="Agenda de Hoje"
                subtitle={`${agendadosHoje.length} compromisso${agendadosHoje.length !== 1 ? 's' : ''}`}
                action="Ver agenda"
                onAction={() => navigate('/agenda')}
              />
              {agendadosHoje.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CalendarTodayIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">Nenhum agendamento para hoje.</Typography>
                </Box>
              ) : (
                agendadosHoje.map((ag) => <AgendaItem key={ag.id} ag={ag} />)
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionHeader
                title="Últimas OS"
                subtitle="Ordens de serviço recentes"
                action="Ver todas"
                onAction={() => navigate('/ordens')}
              />
              {ordens.slice(0, 5).map((os) => <OSItem key={os.id} os={os} />)}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionHeader
                title="Contas a Receber"
                subtitle="Em aberto"
                action="Ver financeiro"
                onAction={() => navigate('/financeiro/receber')}
              />
              {contasReceber.slice(0, 5).map((c, i) => {
                const vencida = new Date(c.vencimento) < new Date() && c.situacao !== 'Recebido';
                return (
                  <Box key={c.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25,
                    borderBottom: i < 4 ? `1px solid ${theme.palette.divider}` : 0,
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{c.clienteNome}</Typography>
                        <StatusChip status={c.situacao} />
                      </Box>
                      <Typography variant="caption" color={vencida ? 'error.main' : 'text.secondary'}>
                        {formatCurrency(c.valor)} · {vencida ? '⚠ ' : ''}Vence: {formatDate(c.vencimento)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
