import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem,
  FormControl, InputLabel, Select, Chip, Button, InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import OSForm from './OSForm';
import OSDetail from './OSDetail';
import { useStore } from '../../store';
import { formatDate, tiposAtendimento } from '../../utils';

const STATUS_OPTIONS = ['Aberta', 'Em Andamento', 'Aguardando Peças', 'Concluída', 'Cancelada'];

export default function Ordens() {
  const { ordens, deleteOrdem } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const filtered = useMemo(() =>
    ordens.filter((o) =>
      (!search || o.clienteNome?.toLowerCase().includes(search.toLowerCase()) || o.numero?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || o.status === filterStatus) &&
      (!filterTipo || o.tipo === filterTipo)
    ), [ordens, search, filterStatus, filterTipo]
  );

  const stats = {
    total: ordens.length,
    emAndamento: ordens.filter((o) => o.status === 'Em Andamento').length,
    concluidas: ordens.filter((o) => o.status === 'Concluída').length,
    abertas: ordens.filter((o) => o.status === 'Aberta').length,
  };

  const handleEdit = (os) => { setEditing(os); setFormOpen(true); };
  const handleView = (os) => { setViewing(os); setDetailOpen(true); };
  const handleDelete = () => { deleteOrdem(deleteId); setDeleteId(null); };

  return (
    <Box>
      <PageHeader
        title="Ordens de Serviço"
        subtitle="Gerencie todas as OS da empresa"
        action={() => { setEditing(null); setFormOpen(true); }}
        actionLabel="Nova OS"
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Total de OS', value: stats.total, color: 'primary' },
          { label: 'Em Andamento', value: stats.emAndamento, color: 'warning' },
          { label: 'Concluídas', value: stats.concluidas, color: 'success' },
          { label: 'Abertas', value: stats.abertas, color: 'info' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight={700} color={`${s.color}.main`}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small" placeholder="Buscar por cliente ou nº OS..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="">Todos</MenuItem>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} label="Tipo">
                  <MenuItem value="">Todos</MenuItem>
                  {tiposAtendimento.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nº OS</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Equipamento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((os) => (
                  <TableRow key={os.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600} color="primary">{os.numero}</Typography></TableCell>
                    <TableCell>{os.clienteNome}</TableCell>
                    <TableCell>{os.equipamento || '-'}</TableCell>
                    <TableCell>{os.tipo}</TableCell>
                    <TableCell>{os.tecnicoNome || '-'}</TableCell>
                    <TableCell>{formatDate(os.dataAbertura)}</TableCell>
                    <TableCell><StatusChip status={os.status} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleView(os)}><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleEdit(os)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(os.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={3}>Nenhuma OS encontrada</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <OSForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <OSDetail open={detailOpen} onClose={() => { setDetailOpen(false); setViewing(null); }} os={viewing} />
      <ConfirmDialog open={!!deleteId} title="Excluir OS" message="Deseja excluir esta Ordem de Serviço?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
