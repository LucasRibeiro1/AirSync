import { useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Tabs, Tab, TextField,
  Button, Avatar, Chip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, Divider, Paper, Tooltip,
  Alert, Stack, useTheme, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HandymanIcon from '@mui/icons-material/Handyman';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ConstructionIcon from '@mui/icons-material/Construction';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import { useStore } from '../../store';
import { perfis } from '../../utils';

// ── Ícones disponíveis para a empresa ──────────────────────────────
const ICONES_LISTA = [
  { key: 'AcUnit', label: 'Ar-Condicionado', icon: <AcUnitIcon /> },
  { key: 'Thermostat', label: 'Temperatura', icon: <ThermostatIcon /> },
  { key: 'Build', label: 'Ferramentas', icon: <BuildIcon /> },
  { key: 'Handyman', label: 'Reparos', icon: <HandymanIcon /> },
  { key: 'Engineering', label: 'Engenharia', icon: <EngineeringIcon /> },
  { key: 'HomeRepairService', label: 'Serviços', icon: <HomeRepairServiceIcon /> },
  { key: 'ElectricalServices', label: 'Elétrica', icon: <ElectricalServicesIcon /> },
  { key: 'Plumbing', label: 'Hidráulica', icon: <PlumbingIcon /> },
  { key: 'Construction', label: 'Obras', icon: <ConstructionIcon /> },
  { key: 'WaterDrop', label: 'Refrigeração', icon: <WaterDropIcon /> },
  { key: 'Storefront', label: 'Loja', icon: <StorefrontIcon /> },
  { key: 'Business', label: 'Empresa', icon: <BusinessIcon /> },
  { key: 'Settings', label: 'Configurações', icon: <SettingsIcon /> },
];

const PERMISSOES = {
  Administrador: ['Dashboard', 'Agenda', 'OS', 'Clientes', 'PMOC', 'Checklist', 'Ferramentas', 'Compras', 'Vendas', 'Financeiro', 'Configurador'],
  Comercial: ['Dashboard', 'Agenda', 'Clientes', 'Vendas', 'Ferramentas'],
  Financeiro: ['Dashboard', 'Financeiro', 'Clientes'],
  Técnico: ['Dashboard', 'Agenda', 'OS', 'Clientes', 'PMOC', 'Checklist'],
  Gestor: ['Dashboard', 'Agenda', 'OS', 'Clientes', 'PMOC', 'Compras', 'Vendas', 'Financeiro'],
};

const PERFIL_COLOR = {
  Administrador: 'error',
  Comercial: 'primary',
  Financeiro: 'success',
  Técnico: 'warning',
  Gestor: 'secondary',
};

// ── Formulário de usuário ──────────────────────────────────────────
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Nome completo *"
                {...register('nome', { required: true })} error={!!errors.nome} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="E-mail *" type="email"
                {...register('email', { required: true })} error={!!errors.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="perfil" control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Perfil de Acesso</InputLabel>
                    <Select {...field} label="Perfil de Acesso">
                      {perfis.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="ativo" control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} color="success" />}
                    label="Usuário Ativo"
                  />
                )}
              />
            </Grid>
          </Grid>

          {perfil && (
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Permissões do perfil "{perfil}"
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
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

// ── Aba Empresa ────────────────────────────────────────────────────
function AbaEmpresa() {
  const theme = useTheme();
  const { empresa, updateEmpresa } = useStore();
  const [form, setForm] = useState({ nome: empresa.nome, slogan: empresa.slogan, icone: empresa.icone });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    updateEmpresa(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Imagem muito grande. Use uma imagem de até 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateEmpresa({ logo: ev.target.result });
      setForm((f) => ({ ...f }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => updateEmpresa({ logo: null });

  const preview = {
    nome: form.nome || empresa.nome,
    slogan: form.slogan || empresa.slogan,
    icone: form.icone,
    logo: empresa.logo,
  };

  return (
    <Grid container spacing={3}>
      {/* Preview */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Pré-visualização — Barra Lateral
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: 2, borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? '#1e2433' : '#f8fafc',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {preview.logo ? (
                  <Box component="img" src={preview.logo} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ color: 'primary.main', '& svg': { fontSize: 24 } }}>
                    {ICONES_LISTA.find((i) => i.key === preview.icone)?.icon || <AcUnitIcon />}
                  </Box>
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main" noWrap>
                  {preview.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {preview.slogan}
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2.5 }}>
              Pré-visualização — Barra Superior
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              p: 1.5, borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: 1, overflow: 'hidden',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {preview.logo ? (
                  <Box component="img" src={preview.logo} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ color: 'primary.main', '& svg': { fontSize: 18 } }}>
                    {ICONES_LISTA.find((i) => i.key === preview.icone)?.icon || <AcUnitIcon />}
                  </Box>
                )}
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ display: 'block', lineHeight: 1.1 }}>
                  {preview.nome}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem' }}>
                  {preview.slogan}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Formulário */}
      <Grid item xs={12} md={8}>
        <Stack spacing={3}>
          {/* Dados básicos */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Dados da Empresa</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Nome da Empresa"
                    value={form.nome} onChange={set('nome')}
                    placeholder="Ex: AirSync Tecnologia" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Slogan / Descrição"
                    value={form.slogan} onChange={set('slogan')}
                    placeholder="Ex: Gestão de Climatização" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Logo da Empresa</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: 2, overflow: 'hidden',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {empresa.logo ? (
                    <Box component="img" src={empresa.logo} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <UploadIcon sx={{ color: 'text.disabled', fontSize: 28 }} />
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.6rem' }}>
                        Sem logo
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogo} />
                  <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => fileRef.current?.click()} sx={{ mr: 1 }}>
                    {empresa.logo ? 'Trocar Logo' : 'Upload de Logo'}
                  </Button>
                  {empresa.logo && (
                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveLogo}>
                      Remover
                    </Button>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    PNG, JPG ou SVG · máximo 500 KB · recomendado 256×256 px
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Seleção de ícone */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Ícone da Empresa</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Exibido quando não há logo cadastrada. Clique para selecionar.
              </Typography>
              <Grid container spacing={1.5}>
                {ICONES_LISTA.map((item) => {
                  const selected = form.icone === item.key;
                  return (
                    <Grid item xs={4} sm={3} md={2} key={item.key}>
                      <Tooltip title={item.label}>
                        <Paper
                          variant="outlined"
                          onClick={() => setForm((f) => ({ ...f, icone: item.key }))}
                          sx={{
                            p: 1.5, cursor: 'pointer', borderRadius: 2,
                            textAlign: 'center', position: 'relative',
                            borderColor: selected ? 'primary.main' : 'divider',
                            borderWidth: selected ? 2 : 1,
                            bgcolor: selected ? alpha(theme.palette.primary.main, 0.07) : 'transparent',
                            transition: 'all 0.15s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                        >
                          {selected && (
                            <Box sx={{
                              position: 'absolute', top: 4, right: 4,
                              width: 16, height: 16, borderRadius: '50%',
                              bgcolor: 'primary.main',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <CheckIcon sx={{ fontSize: 10, color: '#fff' }} />
                            </Box>
                          )}
                          <Box sx={{ color: selected ? 'primary.main' : 'text.secondary', '& svg': { fontSize: 28 } }}>
                            {item.icon}
                          </Box>
                          <Typography variant="caption" color={selected ? 'primary.main' : 'text.disabled'}
                            sx={{ fontSize: '0.6rem', display: 'block', mt: 0.5, lineHeight: 1 }}>
                            {item.label}
                          </Typography>
                        </Paper>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* Salvar */}
          {saved && <Alert severity="success">Configurações da empresa salvas com sucesso!</Alert>}
          <Button
            variant="contained" size="large" startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ alignSelf: 'flex-start' }}
          >
            Salvar Configurações
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

// ── Aba Usuários ───────────────────────────────────────────────────
function AbaUsuarios() {
  const { usuarios } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <Box>
      {/* Resumo por perfil */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {perfis.map((p) => (
          <Grid item xs={6} sm={4} md={2} key={p}>
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

      {/* Tabela */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<PersonAddIcon />}
              onClick={() => { setEditing(null); setFormOpen(true); }}>
              Novo Usuário
            </Button>
          </Box>
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
                        <Avatar sx={{
                          width: 34, height: 34,
                          bgcolor: `${PERFIL_COLOR[u.perfil] || 'primary'}.main`,
                          fontSize: 13, fontWeight: 700,
                        }}>
                          {u.nome.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{u.nome}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={u.perfil} size="small" color={PERFIL_COLOR[u.perfil] || 'primary'} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {PERMISSOES[u.perfil]?.slice(0, 3).map((p) => (
                          <Chip key={p} label={p} size="small" variant="outlined"
                            sx={{ fontSize: '0.62rem', height: 20 }} />
                        ))}
                        {(PERMISSOES[u.perfil]?.length || 0) > 3 && (
                          <Chip
                            label={`+${PERMISSOES[u.perfil].length - 3}`}
                            size="small" variant="outlined"
                            sx={{ fontSize: '0.62rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.ativo ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={u.ativo ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar usuário">
                        <IconButton size="small" onClick={() => { setEditing(u); setFormOpen(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <UsuarioForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        initial={editing}
      />
    </Box>
  );
}

// ── Página principal ───────────────────────────────────────────────
export default function Configurador() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <PageHeader
        title="Configurador"
        subtitle="Personalize a empresa e gerencie usuários"
        breadcrumbs={['Sistema', 'Configurador']}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            icon={<BusinessIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Dados da Empresa"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48 }}
          />
          <Tab
            icon={<PeopleIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Usuários e Permissões"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {tab === 0 && <AbaEmpresa />}
      {tab === 1 && <AbaUsuarios />}
    </Box>
  );
}
