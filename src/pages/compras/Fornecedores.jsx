import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';

function FornecedorForm({ open, onClose, initial }) {
  const { addFornecedor, updateFornecedor } = useStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { razaoSocial: '', nomeFantasia: '', cnpj: '', telefone: '', email: '' },
  });
  const onSubmit = (data) => {
    if (initial?.id) updateFornecedor(initial.id, data);
    else addFornecedor(data);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField fullWidth size="medium" label="Razão Social *" {...register('razaoSocial', { required: true })} error={!!errors.razaoSocial} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="Nome Fantasia" {...register('nomeFantasia')} />
            <TextField fullWidth size="medium" label="CNPJ" {...register('cnpj')} />
            <TextField fullWidth size="medium" label="Telefone" {...register('telefone')} />
            <TextField fullWidth size="medium" label="E-mail" type="email" {...register('email')} />
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

export default function Fornecedores() {
  const { fornecedores, deleteFornecedor } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    fornecedores.filter((f) => !search || f.razaoSocial?.toLowerCase().includes(search.toLowerCase()) || f.nomeFantasia?.toLowerCase().includes(search.toLowerCase())),
    [fornecedores, search]
  );

  return (
    <Box>
      <PageHeader title="Fornecedores" action={() => { setEditing(null); setFormOpen(true); }} actionLabel="Novo Fornecedor" />
      <Card>
        <CardContent>
          <TextField fullWidth size="medium" placeholder="Buscar fornecedor..." value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Razão Social</TableCell>
                  <TableCell>Nome Fantasia</TableCell>
                  <TableCell>CNPJ</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>{f.razaoSocial}</TableCell>
                    <TableCell>{f.nomeFantasia}</TableCell>
                    <TableCell>{f.cnpj}</TableCell>
                    <TableCell>{f.telefone}</TableCell>
                    <TableCell>{f.email}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setEditing(f); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(f.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <FornecedorForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <ConfirmDialog open={!!deleteId} title="Excluir Fornecedor" message="Deseja excluir este fornecedor?" onConfirm={() => { deleteFornecedor(deleteId); setDeleteId(null); }} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
