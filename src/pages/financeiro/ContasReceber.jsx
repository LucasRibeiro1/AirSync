import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils';

const STATUS = ['Aberto', 'Recebido', 'Vencido', 'Cancelado'];

function ContaForm({ open, onClose, initial }) {
  const { clientes, addContaReceber, updateContaReceber } = useStore();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: initial || { clienteNome: '', documento: '', vencimento: '', valor: '', situacao: 'Aberto' },
  });
  const onSubmit = (data) => {
    const payload = { ...data, valor: Number(data.valor) };
    if (initial?.id) updateContaReceber(initial.id, payload);
    else addContaReceber(payload);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Conta' : 'Nova Conta a Receber'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Cliente *" {...register('clienteNome', { required: true })} error={!!errors.clienteNome} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Documento / Referência" {...register('documento')} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Vencimento" type="date" InputLabelProps={{ shrink: true }} {...register('vencimento')} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Valor (R$) *" type="number" inputProps={{ step: '0.01' }} {...register('valor', { required: true })} /></Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="situacao" control={control}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Situação</InputLabel>
                    <Select {...field} label="Situação">{STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
                  </FormControl>
                )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function ContasReceber() {
  const { contasReceber, deleteContaReceber, updateContaReceber } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() =>
    contasReceber.filter((c) =>
      (!search || c.clienteNome?.toLowerCase().includes(search.toLowerCase()) || c.documento?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || c.situacao === filterStatus)
    ), [contasReceber, search, filterStatus]
  );

  const totais = {
    aberto: contasReceber.filter((c) => c.situacao === 'Aberto').reduce((s, c) => s + c.valor, 0),
    recebido: contasReceber.filter((c) => c.situacao === 'Recebido').reduce((s, c) => s + c.valor, 0),
    vencido: contasReceber.filter((c) => c.situacao === 'Vencido').reduce((s, c) => s + c.valor, 0),
  };

  const markReceived = (c) => updateContaReceber(c.id, { ...c, situacao: 'Recebido' });

  return (
    <Box>
      <PageHeader title="Contas a Receber" action={() => { setEditing(null); setFormOpen(true); }} actionLabel="Nova Conta" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h5" fontWeight={700} color="info.main">{formatCurrency(totais.aberto)}</Typography>
            <Typography variant="caption" color="text.secondary">Em Aberto</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h5" fontWeight={700} color="success.main">{formatCurrency(totais.recebido)}</Typography>
            <Typography variant="caption" color="text.secondary">Recebido</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h5" fontWeight={700} color="error.main">{formatCurrency(totais.vencido)}</Typography>
            <Typography variant="caption" color="text.secondary">Vencido</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" placeholder="Buscar cliente ou documento..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Situação</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Situação">
                  <MenuItem value="">Todas</MenuItem>
                  {STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Situação</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.clienteNome}</TableCell>
                    <TableCell>{c.documento}</TableCell>
                    <TableCell>{formatDate(c.vencimento)}</TableCell>
                    <TableCell align="right"><Typography fontWeight={600} color="success.main">{formatCurrency(c.valor)}</Typography></TableCell>
                    <TableCell><StatusChip status={c.situacao} /></TableCell>
                    <TableCell align="right">
                      {c.situacao === 'Aberto' && (
                        <IconButton size="small" color="success" title="Marcar como Recebido" onClick={() => markReceived(c)}><CheckCircleIcon fontSize="small" /></IconButton>
                      )}
                      <IconButton size="small" onClick={() => { setEditing(c); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ContaForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <ConfirmDialog open={!!deleteId} title="Excluir Conta" message="Deseja excluir esta conta a receber?"
        onConfirm={() => { deleteContaReceber(deleteId); setDeleteId(null); }} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
