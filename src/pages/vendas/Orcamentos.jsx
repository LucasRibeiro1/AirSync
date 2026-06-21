import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Divider, InputAdornment,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TransformIcon from '@mui/icons-material/Transform';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils';

const STATUS = ['Pendente', 'Aprovado', 'Recusado', 'Convertido'];
const PAGAMENTO = ['À Vista', 'Parcelado 2x', 'Parcelado 3x', 'Parcelado 6x', 'Parcelado 12x', 'Boleto 30 dias'];

function OrcamentoForm({ open, onClose, initial }) {
  const { clientes, addOrcamento, updateOrcamento } = useStore();
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: initial || {
      clienteId: '', pagamento: 'À Vista', desconto: 0, observacoes: '',
      itens: [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });
  const itens = watch('itens');
  const desconto = Number(watch('desconto')) || 0;
  const subtotal = itens.reduce((s, i) => s + (Number(i.quantidade) * Number(i.valorUnitario)), 0);
  const total = subtotal - desconto;

  const onSubmit = (data) => {
    const cliente = clientes.find((c) => c.id === Number(data.clienteId));
    const payload = { ...data, clienteId: Number(data.clienteId), clienteNome: cliente?.nome || '', subtotal, total };
    if (initial?.id) updateOrcamento(initial.id, payload);
    else addOrcamento(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial?.id ? `Editar ${initial.numero}` : 'Novo Orçamento'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Controller name="clienteId" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Cliente *</InputLabel>
                    <Select {...field} label="Cliente *">
                      {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="pagamento" control={control}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Pagamento</InputLabel>
                    <Select {...field} label="Pagamento">
                      {PAGAMENTO.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>Itens do Orçamento</Typography>
          {fields.map((field, idx) => (
            <Grid container spacing={1} key={field.id} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={12} sm={5}>
                <TextField fullWidth size="small" label="Descrição" {...register(`itens.${idx}.descricao`)} />
              </Grid>
              <Grid item xs={3} sm={2}>
                <TextField fullWidth size="small" label="Qtd" type="number" {...register(`itens.${idx}.quantidade`)} />
              </Grid>
              <Grid item xs={5} sm={3}>
                <TextField fullWidth size="small" label="Valor Unit." type="number" inputProps={{ step: '0.01' }} {...register(`itens.${idx}.valorUnitario`)} />
              </Grid>
              <Grid item xs={3} sm={1}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {formatCurrency(Number(itens[idx]?.quantidade) * Number(itens[idx]?.valorUnitario))}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <IconButton size="small" color="error" onClick={() => remove(idx)}><DeleteIcon fontSize="small" /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => append({ descricao: '', quantidade: 1, valorUnitario: 0 })}>
            Adicionar Item
          </Button>

          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Desconto (R$)" type="number" inputProps={{ step: '0.01' }} {...register('desconto')} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2">Subtotal: {formatCurrency(subtotal)}</Typography>
                <Typography variant="h6" color="primary">Total: <strong>{formatCurrency(total)}</strong></Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observações" multiline rows={2} {...register('observacoes')} />
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

export default function Orcamentos() {
  const { orcamentos, deleteOrcamento, updateOrcamento } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    orcamentos.filter((o) => !search || o.clienteNome?.toLowerCase().includes(search.toLowerCase()) || o.numero?.toLowerCase().includes(search.toLowerCase())),
    [orcamentos, search]
  );

  const stats = {
    total: orcamentos.length,
    aprovados: orcamentos.filter((o) => o.status === 'Aprovado').length,
    pendentes: orcamentos.filter((o) => o.status === 'Pendente').length,
    taxa: orcamentos.length > 0 ? Math.round((orcamentos.filter((o) => o.status === 'Aprovado').length / orcamentos.length) * 100) : 0,
  };

  return (
    <Box>
      <PageHeader title="Orçamentos" action={() => { setEditing(null); setFormOpen(true); }} actionLabel="Novo Orçamento" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Total', value: stats.total, color: 'info' },
          { label: 'Aprovados', value: stats.aprovados, color: 'success' },
          { label: 'Pendentes', value: stats.pendentes, color: 'warning' },
          { label: 'Taxa de Conversão', value: `${stats.taxa}%`, color: 'primary' },
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
          <TextField fullWidth size="medium" placeholder="Buscar orçamento..." value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Pagamento</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600} color="primary">{o.numero}</Typography></TableCell>
                    <TableCell>{o.clienteNome}</TableCell>
                    <TableCell>{formatDate(o.data)}</TableCell>
                    <TableCell>{o.pagamento}</TableCell>
                    <TableCell align="right" fontWeight={600}>{formatCurrency(o.total)}</TableCell>
                    <TableCell><StatusChip status={o.status} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="Aprovar" onClick={() => updateOrcamento(o.id, { status: 'Aprovado' })}>
                        <TransformIcon fontSize="small" color="success" />
                      </IconButton>
                      <IconButton size="small" onClick={() => { setEditing(o); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(o.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={3}>Nenhum orçamento encontrado</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <OrcamentoForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <ConfirmDialog open={!!deleteId} title="Excluir Orçamento" message="Deseja excluir este orçamento?"
        onConfirm={() => { deleteOrcamento(deleteId); setDeleteId(null); }} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
