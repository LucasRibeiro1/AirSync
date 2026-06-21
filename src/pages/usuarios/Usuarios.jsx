import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import { useStore } from '../../store';
import { perfis } from '../../utils';

const PERMISSOES = {
  Administrador: ['Dashboard', 'Agenda', 'Ordens de Serviço', 'Clientes', 'Compras', 'Vendas', 'Financeiro', 'Usuários'],
  Comercial: ['Dashboard', 'Agenda', 'Clientes', 'Vendas'],
  Financeiro: ['Dashboard', 'Financeiro', 'Clientes'],
  Técnico: ['Dashboard', 'Agenda', 'Ordens de Serviço', 'Clientes'],
  Gestor: ['Dashboard', 'Agenda', 'Ordens de Serviço', 'Clientes', 'Compras', 'Vendas', 'Financeiro'],
};

function UsuarioForm({ open, onClose, initial }) {
  const { addUsuario, updateUsuario } = useStore();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: initial || { nome: '', email: '', perfil: 'Técnico', ativo: true },
  });
  const perfil = watch('perfil');

  const onSubmit = (data) => {
    if (initial?.id) updateUsuario(initial.id, data);
    else addUsuario(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField fullWidth size="medium" label="Nome *" {...register('nome', { required: true })} error={!!errors.nome} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="E-mail *" type="email" {...register('email', { required: true })} error={!!errors.email} sx={{ gridColumn: 'span 2' }} />
            <Controller name="perfil" control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium"><InputLabel>Perfil</InputLabel>
                  <Select {...field} label="Perfil">
                    {perfis.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
            <Controller name="ativo" control={control}
              render={({ field }) => (
                <FormControlLabel control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Usuário Ativo" />
              )} />
          </Box>

          {perfil && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Permissões do Perfil "{perfil}"</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PERMISSOES[perfil]?.map((p) => (
                  <Chip key={p} label={p} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const PERFIL_COLOR = {
  Administrador: 'error',
  Comercial: 'primary',
  Financeiro: 'success',
  Técnico: 'warning',
  Gestor: 'secondary',
};

export default function Usuarios() {
  const { usuarios } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <Box>
      <PageHeader title="Usuários e Permissões" subtitle="Gerencie o acesso ao sistema"
        action={() => { setEditing(null); setFormOpen(true); }} actionLabel="Novo Usuário" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {perfis.map((p) => (
          <Grid item xs={6} sm={4} md={4} lg={2} key={p}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight={700} color={`${PERFIL_COLOR[p]}.main`}>
                  {usuarios.filter((u) => u.perfil === p).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">{p}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Perfil</TableCell>
                  <TableCell>Permissões</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: `${PERFIL_COLOR[u.perfil]}.main`, fontSize: 13 }}>
                          {u.nome.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{u.nome}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.perfil} size="small" color={PERFIL_COLOR[u.perfil]} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {PERMISSOES[u.perfil]?.slice(0, 3).map((p) => (
                          <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        ))}
                        {(PERMISSOES[u.perfil]?.length || 0) > 3 && (
                          <Chip label={`+${PERMISSOES[u.perfil].length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={u.ativo ? 'Ativo' : 'Inativo'} size="small" color={u.ativo ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setEditing(u); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <UsuarioForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
    </Box>
  );
}
