import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
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

const STATUS = ['Aberto', 'Pago', 'Vencido', 'Cancelado'];
const CATEGORIAS = ['Fornecedor', 'Despesa Fixa', 'Folha de Pagamento', 'Impostos', 'Manutenção', 'Marketing', 'Outros'];

function ContaForm({ open, onClose, initial }) {
  const { addContaPagar, updateContaPagar } = useStore();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: initial || { fornecedorNome: '', categoria: 'Despesa Fixa', vencimento: '', valor: '', situacao: 'Aberto' },
  });
  const onSubmit = (data) => {
    const payload = { ...data, valor: Number(data.valor) };
    if (initial?.id) updateContaPagar(initial.id, payload);
    else addContaPagar(payload);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Conta' : 'Nova Conta a Pagar'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField fullWidth size="medium" label="Fornecedor / Descrição *" {...register('fornecedorNome', { required: true })} sx={{ gridColumn: 'span 2' }} />
            <Controller name="categoria" control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium"><InputLabel>Categoria</InputLabel>
                  <Select {...field} label="Categoria">{CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select>
                </FormControl>
              )} />
            <TextField fullWidth size="medium" label="Vencimento" type="date" InputLabelProps={{ shrink: true }} {...register('vencimento')} />
            <TextField fullWidth size="medium" label="Valor (R$)" type="number" inputProps={{ step: '0.01' }} {...register('valor', { required: true })} />
            <Controller name="situacao" control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium"><InputLabel>Situação</InputLabel>
                  <Select {...field} label="Situação">{STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
                </FormControl>
              )} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function ContasPagar() {
  const { contasPagar, deleteContaPagar, updateContaPagar } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() =>
    contasPagar.filter((c) =>
      (!search || c.fornecedorNome?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || c.situacao === filterStatus)
    ), [contasPagar, search, filterStatus]
  );

  const totais = {
    aberto: contasPagar.filter((c) => c.situacao === 'Aberto').reduce((s, c) => s + c.valor, 0),
    pago: contasPagar.filter((c) => c.situacao === 'Pago').reduce((s, c) => s + c.valor, 0),
    vencido: contasPagar.filter((c) => c.situacao === 'Vencido').reduce((s, c) => s + c.valor, 0),
  };

  return (
    <Box>
      <PageHeader title="Contas a Pagar" action={() => { setEditing(null); setFormOpen(true); }} actionLabel="Nova Conta" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h5" fontWeight={700} color="warning.main">{formatCurrency(totais.aberto)}</Typography>
            <Typography variant="caption">Em Aberto</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h5" fontWeight={700} color="success.main">{formatCurrency(totais.pago)}</Typography>
            <Typography variant="caption">Pago</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h5" fontWeight={700} color="error.main">{formatCurrency(totais.vencido)}</Typography>
            <Typography variant="caption">Vencido</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              size="medium" placeholder="Buscar..." value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 280 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            <FormControl size="medium" sx={{ minWidth: 200 }}>
              <InputLabel>Situação</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Situação">
                <MenuItem value="">Todas</MenuItem>
                {STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fornecedor / Descrição</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Situação</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.fornecedorNome}</TableCell>
                    <TableCell>{c.categoria}</TableCell>
                    <TableCell>{formatDate(c.vencimento)}</TableCell>
                    <TableCell align="right"><Typography fontWeight={600} color="error.main">{formatCurrency(c.valor)}</Typography></TableCell>
                    <TableCell><StatusChip status={c.situacao} /></TableCell>
                    <TableCell align="right">
                      {c.situacao === 'Aberto' && (
                        <IconButton size="small" color="success" onClick={() => updateContaPagar(c.id, { ...c, situacao: 'Pago' })}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
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
      <ConfirmDialog open={!!deleteId} title="Excluir Conta" message="Deseja excluir esta conta a pagar?"
        onConfirm={() => { deleteContaPagar(deleteId); setDeleteId(null); }} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
