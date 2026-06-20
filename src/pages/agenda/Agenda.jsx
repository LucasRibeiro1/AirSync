import { useState, useMemo, Fragment } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, FormControl, InputLabel, Select, Tabs, Tab,
  useTheme, alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AgendaForm from './AgendaForm';
import { useStore } from '../../store';
import { formatDate } from '../../utils';

const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getWeekDays(date) {
  const d = new Date(date);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    return dd;
  });
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function useStatusColors() {
  const theme = useTheme();
  return {
    Agendado: theme.palette.info.main,
    Confirmado: theme.palette.secondary.main,
    'Em atendimento': theme.palette.warning.main,
    Concluído: theme.palette.success.main,
    Cancelado: theme.palette.error.main,
  };
}

export default function Agenda() {
  const { agendamentos, tecnicos, deleteAgendamento } = useStore();
  const theme = useTheme();
  const STATUS_COLORS = useStatusColors();

  const [tab, setTab] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterTecnico, setFilterTecnico] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() =>
    agendamentos.filter((a) =>
      (!filterTecnico || a.tecnicoId === Number(filterTecnico)) &&
      (!filterStatus || a.status === filterStatus)
    ), [agendamentos, filterTecnico, filterStatus]
  );

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (tab === 0) d.setDate(d.getDate() + dir);
    else if (tab === 1) d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const toISO = (d) => d.toISOString().split('T')[0];
  const agForDay = (dateStr) => filtered.filter((a) => a.data === dateStr);
  const handleEdit = (ag) => { setEditing(ag); setFormOpen(true); };
  const handleDelete = () => { deleteAgendamento(deleteId); setDeleteId(null); };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const todayStr = toISO(new Date());

  const todayBg = alpha(theme.palette.primary.main, 0.08);

  return (
    <Box>
      <PageHeader
        title="Agenda"
        subtitle="Gerencie os agendamentos de serviço"
        action={() => { setEditing(null); setFormOpen(true); }}
        actionLabel="Novo Agendamento"
      />

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Técnico</InputLabel>
                <Select value={filterTecnico} onChange={(e) => setFilterTecnico(e.target.value)} label="Técnico">
                  <MenuItem value="">Todos</MenuItem>
                  {tecnicos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="">Todos</MenuItem>
                  {['Agendado','Confirmado','Em atendimento','Concluído','Cancelado'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button variant="outlined" size="small" startIcon={<TodayIcon />}
                onClick={() => setCurrentDate(new Date())}>
                Hoje
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardContent>
          {/* Header navegação */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            mb: 2, flexWrap: 'wrap', gap: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={() => navigate(-1)}><ChevronLeftIcon /></IconButton>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ minWidth: { xs: 160, sm: 220 }, textAlign: 'center', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
              >
                {tab === 0 && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {tab === 1 && `${weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                {tab === 2 && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </Typography>
              <IconButton size="small" onClick={() => navigate(1)}><ChevronRightIcon /></IconButton>
            </Box>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Dia" />
              <Tab label="Semana" />
              <Tab label="Mês" />
            </Tabs>
          </Box>

          {/* ── Vista Dia ── */}
          {tab === 0 && (
            <Box>
              {HOURS.map((h) => {
                const dayAgs = agForDay(toISO(currentDate)).filter((a) => a.horario?.startsWith(h.slice(0, 2)));
                return (
                  <Box key={h} sx={{
                    display: 'flex', borderBottom: '1px solid', borderColor: 'divider',
                    minHeight: 72, py: 0.5,
                  }}>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ width: 52, pt: 0.5, flexShrink: 0, fontWeight: 500, fontSize: '0.75rem' }}
                    >
                      {h}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', gap: 1, flexWrap: 'wrap', py: 0.25 }}>
                      {dayAgs.map((ag) => {
                        const c = STATUS_COLORS[ag.status] ?? theme.palette.primary.main;
                        return (
                          <Box key={ag.id} sx={{
                            flex: '1 1 180px', minWidth: 160, maxWidth: 340,
                            bgcolor: alpha(c, 0.1), border: `1.5px solid ${alpha(c, 0.5)}`,
                            borderLeft: `4px solid ${c}`, borderRadius: 1.5, p: 1,
                          }}>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                              {ag.horario} — {ag.clienteNome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">{ag.tipo}</Typography>
                            <Typography variant="caption" color="text.secondary">{ag.tecnicoNome}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              <IconButton size="small" onClick={() => handleEdit(ag)} sx={{ p: 0.25 }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => setDeleteId(ag.id)} sx={{ p: 0.25 }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ── Vista Semana ── */}
          {tab === 1 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '52px repeat(7, 1fr)',
                minWidth: 560,
              }}>
                {/* Header dias */}
                <Box sx={{ borderBottom: '2px solid', borderColor: 'divider' }} />
                {weekDays.map((d) => {
                  const isToday = toISO(d) === todayStr;
                  return (
                    <Box key={toISO(d)} sx={{
                      textAlign: 'center', py: 1,
                      borderBottom: '2px solid', borderColor: 'divider',
                      bgcolor: isToday ? todayBg : 'transparent',
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {DAYS[d.getDay()]}
                      </Typography>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: '50%', mx: 'auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: isToday ? 'primary.main' : 'transparent',
                        color: isToday ? 'white' : 'text.primary',
                      }}>
                        <Typography variant="body2" fontWeight={isToday ? 700 : 400}>
                          {d.getDate()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}

                {/* Linhas de hora */}
                {HOURS.map((h) => (
                  <Fragment key={h}>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{
                        borderBottom: '1px solid', borderColor: 'divider',
                        px: 0.75, pt: 0.5, height: 68,
                        fontWeight: 500, fontSize: '0.72rem',
                      }}
                    >
                      {h}
                    </Typography>
                    {weekDays.map((d) => {
                      const ags = agForDay(toISO(d)).filter((a) => a.horario?.startsWith(h.slice(0, 2)));
                      const isToday = toISO(d) === todayStr;
                      return (
                        <Box key={toISO(d) + h} sx={{
                          borderBottom: '1px solid', borderLeft: '1px solid', borderColor: 'divider',
                          height: 68, p: 0.5, overflow: 'hidden',
                          bgcolor: isToday ? todayBg : 'transparent',
                        }}>
                          {ags.map((ag) => {
                            const c = STATUS_COLORS[ag.status] ?? theme.palette.primary.main;
                            return (
                              <Box key={ag.id} onClick={() => handleEdit(ag)} sx={{
                                bgcolor: alpha(c, 0.12),
                                borderLeft: `3px solid ${c}`,
                                borderRadius: 0.5, px: 0.75, py: 0.25,
                                cursor: 'pointer', mb: 0.25,
                                '&:hover': { bgcolor: alpha(c, 0.2) },
                              }}>
                                <Typography variant="caption" noWrap sx={{ fontSize: '0.72rem', fontWeight: 500 }}>
                                  {ag.clienteNome}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    })}
                  </Fragment>
                ))}
              </Box>
            </Box>
          )}

          {/* ── Vista Mês ── */}
          {tab === 2 && (
            <Box>
              {/* Header dos dias da semana */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
                {DAYS.map((d) => (
                  <Typography key={d} variant="caption" color="text.secondary" sx={{
                    textAlign: 'center', fontWeight: 700, py: 0.75,
                    textTransform: 'uppercase', fontSize: '0.7rem',
                  }}>
                    {d}
                  </Typography>
                ))}
              </Box>
              {/* Células */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {monthDays.map((d, i) => {
                  const ags = d ? agForDay(toISO(d)) : [];
                  const isToday = d && toISO(d) === todayStr;
                  return (
                    <Box key={i} sx={{
                      minHeight: 88,
                      border: '1px solid', borderColor: 'divider',
                      borderRadius: 1,
                      p: 0.75,
                      bgcolor: isToday ? todayBg : 'background.paper',
                    }}>
                      {d && (
                        <>
                          <Box sx={{
                            width: 24, height: 24, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mb: 0.5,
                            bgcolor: isToday ? 'primary.main' : 'transparent',
                            color: isToday ? 'white' : 'text.primary',
                          }}>
                            <Typography variant="caption" fontWeight={isToday ? 700 : 500} sx={{ fontSize: '0.75rem' }}>
                              {d.getDate()}
                            </Typography>
                          </Box>
                          {ags.slice(0, 3).map((ag) => {
                            const c = STATUS_COLORS[ag.status] ?? theme.palette.primary.main;
                            return (
                              <Box key={ag.id} onClick={() => handleEdit(ag)} sx={{
                                bgcolor: alpha(c, 0.12),
                                borderLeft: `2px solid ${c}`,
                                px: 0.5, py: 0.1,
                                borderRadius: 0.5, mb: 0.25,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: alpha(c, 0.22) },
                              }}>
                                <Typography noWrap sx={{ fontSize: '0.7rem', fontWeight: 500, lineHeight: 1.4 }}>
                                  {ag.clienteNome}
                                </Typography>
                              </Box>
                            );
                          })}
                          {ags.length > 3 && (
                            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.25 }}>
                              +{ags.length - 3} mais
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Lista */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Lista de Agendamentos</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Horário</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>Nenhum agendamento encontrado</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((ag) => (
                  <TableRow key={ag.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{ag.clienteNome}</TableCell>
                    <TableCell>{ag.tipo}</TableCell>
                    <TableCell>{formatDate(ag.data)}</TableCell>
                    <TableCell>{ag.horario}</TableCell>
                    <TableCell>{ag.tecnicoNome || '—'}</TableCell>
                    <TableCell><StatusChip status={ag.status} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" onClick={() => handleEdit(ag)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(ag.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <AgendaForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Agendamento"
        message="Deseja excluir este agendamento?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
