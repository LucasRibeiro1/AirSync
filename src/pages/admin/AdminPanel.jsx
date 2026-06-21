import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Switch, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, FormControlLabel,
  Checkbox, Tooltip, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useStore } from '../../store';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { perfis } from '../../utils';

export const ALL_MODULES = [
  'Dashboard',
  'Agenda',
  'Ordens de Serviço',
  'Clientes',
  'PMOC',
  'Checklist Técnico',
  'Ferramentas',
  'Compras',
  'Vendas',
  'Financeiro',
  'Configurador',
];

function PermissoesDialog({ open, onClose, user, onSave }) {
  const [selected, setSelected] = useState(user?.permissoes || []);

  const toggle = (m) =>
    setSelected((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const toggleAll = () =>
    setSelected(selected.length === ALL_MODULES.length ? [] : [...ALL_MODULES]);

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Permissões — {user?.nome}</DialogTitle>
      <DialogContent dividers>
        <FormControlLabel
          label={<Typography variant="body2" fontWeight={600}>Selecionar todos</Typography>}
          control={
            <Checkbox
              checked={selected.length === ALL_MODULES.length}
              indeterminate={selected.length > 0 && selected.length < ALL_MODULES.length}
              onChange={toggleAll}
              size="small"
            />
          }
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pl: 1 }}>
          {ALL_MODULES.map((m) => (
            <FormControlLabel
              key={m}
              label={<Typography variant="body2">{m}</Typography>}
              control={
                <Checkbox
                  checked={selected.includes(m)}
                  onChange={() => toggle(m)}
                  size="small"
                />
              }
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}

function UsuarioDialog({ open, onClose, initial, onSave }) {
  const [form, setForm] = useState(
    initial
      ? { nome: initial.nome, username: initial.username || '', senha: initial.senha || '', email: initial.email || '', perfil: initial.perfil || 'Técnico' }
      : { nome: '', username: '', senha: '', email: '', perfil: 'Técnico' }
  );

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const isNew = !initial?.id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isNew ? 'Novo Usuário' : 'Editar Usuário'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            fullWidth size="medium" label="Nome completo" value={form.nome}
            onChange={(e) => setField('nome', e.target.value)}
            sx={{ gridColumn: 'span 2' }}
          />
          <TextField
            fullWidth size="medium" label="Usuário (login)" value={form.username}
            onChange={(e) => setField('username', e.target.value)}
            inputProps={{ autoCapitalize: 'none' }}
          />
          <TextField
            fullWidth size="medium" label={isNew ? 'Senha' : 'Nova senha (opcional)'} type="password"
            value={form.senha} onChange={(e) => setField('senha', e.target.value)}
            placeholder={isNew ? '' : 'Deixe em branco para manter'}
          />
          <TextField
            fullWidth size="medium" label="E-mail" value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            sx={{ gridColumn: 'span 2' }}
          />
          <FormControl fullWidth size="medium" sx={{ gridColumn: 'span 2' }}>
            <InputLabel>Perfil</InputLabel>
            <Select value={form.perfil} label="Perfil" onChange={(e) => setField('perfil', e.target.value)}>
              {perfis.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained" onClick={handleSave}
          disabled={!form.nome.trim() || !form.username.trim() || (isNew && !form.senha)}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminPanel() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, toggleBloqueado, setPermissoes } = useStore();
  const [permDialog, setPermDialog] = useState(null);
  const [userDialog, setUserDialog] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSaveUser = (data) => {
    if (userDialog?.id) {
      const payload = { ...data };
      if (!payload.senha) delete payload.senha;
      updateUsuario(userDialog.id, payload);
    } else {
      addUsuario({ ...data, permissoes: [] });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Gerenciar Acesso"
        subtitle="Usuários, bloqueios e permissões de módulos"
        action={() => setUserDialog({})}
        actionLabel="Novo Usuário"
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        O acesso de <strong>administrador</strong> (usuário <code>admin</code>) é fixo e não aparece nesta lista. Gerencie aqui os demais usuários do sistema.
      </Alert>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Perfil</TableCell>
                  <TableCell align="center">Módulos</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id} hover sx={{ opacity: u.bloqueado ? 0.55 : 1 }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{u.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                      >
                        {u.username || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={u.perfil} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar permissões">
                        <Chip
                          label={`${(u.permissoes || []).length} módulos`}
                          size="small"
                          icon={<SecurityIcon style={{ fontSize: 14 }} />}
                          onClick={() => setPermDialog(u)}
                          clickable
                          color={(u.permissoes || []).length > 0 ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={u.bloqueado ? 'Clique para desbloquear' : 'Clique para bloquear'}>
                        <Chip
                          label={u.bloqueado ? 'Bloqueado' : 'Ativo'}
                          size="small"
                          color={u.bloqueado ? 'error' : 'success'}
                          icon={u.bloqueado
                            ? <BlockIcon style={{ fontSize: 14 }} />
                            : <CheckCircleIcon style={{ fontSize: 14 }} />
                          }
                          onClick={() => toggleBloqueado(u.id)}
                          clickable
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Editar usuário">
                        <IconButton size="small" onClick={() => setUserDialog(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir usuário">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {usuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" py={3}>Nenhum usuário cadastrado</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {permDialog && (
        <PermissoesDialog
          key={permDialog.id}
          open
          onClose={() => setPermDialog(null)}
          user={permDialog}
          onSave={(perm) => setPermissoes(permDialog.id, perm)}
        />
      )}

      {userDialog !== null && (
        <UsuarioDialog
          key={userDialog?.id || 'new'}
          open
          onClose={() => setUserDialog(null)}
          initial={userDialog?.id ? userDialog : null}
          onSave={handleSaveUser}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Usuário"
        message="Deseja excluir este usuário permanentemente?"
        onConfirm={() => { deleteUsuario(deleteId); setDeleteId(null); }}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
