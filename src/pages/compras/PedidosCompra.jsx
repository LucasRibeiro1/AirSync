import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Divider, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils';

const STATUS = ['Aberto', 'Aprovado', 'Recebido', 'Cancelado'];

function PedidoForm({ open, onClose }) {
  const { fornecedores, produtos } = useStore();
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: { fornecedorId: '', data: new Date().toISOString().split('T')[0], status: 'Aberto', itens: [{ produtoId: '', quantidade: 1, valorUnitario: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });
  const itens = watch('itens');

  const total = itens.reduce((s, i) => s + (Number(i.quantidade) * Number(i.valorUnitario)), 0);

  const onSubmit = (data) => {
    // In production this would persist; for now just close
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Novo Pedido de Compra</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2, mb: 2 }}>
            <Controller name="fornecedorId" control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium"><InputLabel>Fornecedor</InputLabel>
                  <Select {...field} label="Fornecedor">
                    {fornecedores.map((f) => <MenuItem key={f.id} value={f.id}>{f.nomeFantasia || f.razaoSocial}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
            <TextField fullWidth size="medium" label="Data" type="date" InputLabelProps={{ shrink: true }} {...register('data')} />
            <Controller name="status" control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium"><InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
          </Box>

          <Typography variant="subtitle2" gutterBottom>Itens do Pedido</Typography>
          {fields.map((field, idx) => (
            <Grid container spacing={1} key={field.id} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={12} sm={5}>
                <Controller name={`itens.${idx}.produtoId`} control={control}
                  render={({ field: f }) => (
                    <FormControl fullWidth size="small"><InputLabel>Produto</InputLabel>
                      <Select {...f} label="Produto">
                        {produtos.map((p) => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )} />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField fullWidth size="small" label="Qtd" type="number" {...register(`itens.${idx}.quantidade`)} />
              </Grid>
              <Grid item xs={5} sm={3}>
                <TextField fullWidth size="small" label="Valor Unit." type="number" inputProps={{ step: '0.01' }} {...register(`itens.${idx}.valorUnitario`)} />
              </Grid>
              <Grid item xs={2} sm={1}>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(Number(itens[idx]?.quantidade) * Number(itens[idx]?.valorUnitario))}</Typography>
              </Grid>
              <Grid item xs={1}>
                <IconButton size="small" color="error" onClick={() => remove(idx)}><DeleteIcon fontSize="small" /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => append({ produtoId: '', quantidade: 1, valorUnitario: 0 })}>
            Adicionar Item
          </Button>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6">Total: <strong>{formatCurrency(total)}</strong></Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar Pedido</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const MOCK_PEDIDOS = [
  { id: 1, fornecedor: 'Clima Total', data: '2024-01-10', total: 8500, status: 'Recebido', itens: 5 },
  { id: 2, fornecedor: 'Peças & Cia', data: '2024-01-20', total: 1200, status: 'Aprovado', itens: 3 },
];

export default function PedidosCompra() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <Box>
      <PageHeader title="Pedidos de Compra" action={() => setFormOpen(true)} actionLabel="Novo Pedido" />
      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fornecedor</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Itens</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_PEDIDOS.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.fornecedor}</TableCell>
                    <TableCell>{formatDate(p.data)}</TableCell>
                    <TableCell align="right">{p.itens}</TableCell>
                    <TableCell align="right">{formatCurrency(p.total)}</TableCell>
                    <TableCell><StatusChip status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <PedidoForm open={formOpen} onClose={() => setFormOpen(false)} />
    </Box>
  );
}
