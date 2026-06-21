import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  Chip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatCurrency } from '../../utils';

const categorias = ['Equipamento', 'Peça', 'Material', 'Ferramenta', 'Outro'];
const unidades = ['un', 'm', 'kg', 'L', 'pç', 'cx'];

function ProdutoForm({ open, onClose, initial }) {
  const { addProduto, updateProduto } = useStore();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: initial || { nome: '', categoria: '', unidade: 'un', quantidade: 0, preco: 0, estoqueMinimo: 5 },
  });
  const onSubmit = (data) => {
    const payload = { ...data, quantidade: Number(data.quantidade), preco: Number(data.preco), estoqueMinimo: Number(data.estoqueMinimo) };
    if (initial?.id) updateProduto(initial.id, payload);
    else addProduto(payload);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Nome *" {...register('nome', { required: true })} error={!!errors.nome} /></Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="categoria" control={control}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Categoria</InputLabel>
                    <Select {...field} label="Categoria">
                      {categorias.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="unidade" control={control}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Unidade</InputLabel>
                    <Select {...field} label="Unidade">
                      {unidades.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Quantidade" type="number" {...register('quantidade')} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Estoque Mínimo" type="number" {...register('estoqueMinimo')} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Preço (R$)" type="number" inputProps={{ step: '0.01' }} {...register('preco')} /></Grid>
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

export default function Estoque() {
  const { produtos, deleteProduto } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = useMemo(() =>
    produtos.filter((p) =>
      (!search || p.nome?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCat || p.categoria === filterCat)
    ), [produtos, search, filterCat]
  );

  const totalValor = produtos.reduce((s, p) => s + (p.quantidade * p.preco), 0);
  const baixoEstoque = produtos.filter((p) => p.quantidade <= (p.estoqueMinimo || 5)).length;

  return (
    <Box>
      <PageHeader title="Estoque" subtitle={`${produtos.length} itens • Valor total: ${formatCurrency(totalValor)}`}
        action={() => { setEditing(null); setFormOpen(true); }} actionLabel="Novo Produto" />

      {baixoEstoque > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.main' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography variant="body2" color="warning.dark">
              <strong>{baixoEstoque} produto(s)</strong> com estoque baixo ou zerado.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              size="medium" placeholder="Buscar produto..." value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 280 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            <FormControl size="medium" sx={{ minWidth: 200 }}>
              <InputLabel>Categoria</InputLabel>
              <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} label="Categoria">
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Unidade</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => {
                  const baixo = p.quantidade <= (p.estoqueMinimo || 5);
                  return (
                    <TableRow key={p.id} hover sx={baixo ? { bgcolor: 'warning.50' } : {}}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {baixo && <WarningIcon fontSize="small" color="warning" />}
                          <Typography variant="body2">{p.nome}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={p.categoria} size="small" variant="outlined" /></TableCell>
                      <TableCell>{p.unidade}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={baixo ? 700 : 400} color={baixo ? 'warning.dark' : 'inherit'}>{p.quantidade}</Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(p.preco)}</TableCell>
                      <TableCell align="right">{formatCurrency(p.quantidade * p.preco)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => { setEditing(p); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ProdutoForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <ConfirmDialog open={!!deleteId} title="Excluir Produto" message="Deseja excluir este produto do estoque?" onConfirm={() => { deleteProduto(deleteId); setDeleteId(null); }} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
