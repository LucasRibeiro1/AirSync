import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Typography,
  Tooltip, InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatDate } from '../../utils';

const TIPOS = ['Split Hi-Wall', 'Cassete', 'Piso-Teto', 'Janela', 'Portátil', 'Chiller', 'Fan-Coil', 'VRF/VRV', 'Multi-Split', 'Outro'];
const SITUACOES = ['Operacional', 'Em Manutenção', 'Inoperante', 'Desativado'];
const BTUS = ['7000', '9000', '12000', '18000', '24000', '30000', '36000', '48000', '60000'];

const EMPTY = {
  contratoPMOCId: '', clienteId: '', clienteNome: '', tipo: 'Split Hi-Wall',
  marca: '', modelo: '', capacidadeBTU: '12000', numeroSerie: '',
  localInstalacao: '', dataInstalacao: '', situacao: 'Operacional',
};

const situacaoCor = (s) => ({
  'Operacional': 'success',
  'Em Manutenção': 'warning',
  'Inoperante': 'error',
  'Desativado': 'default',
}[s] || 'default');

export default function PMOCEquipamentos() {
  const { equipamentosPMOC, contratosPMOC, clientes, addEquipamentoPMOC, updateEquipamentoPMOC, deleteEquipamentoPMOC } = useStore();
  const [search, setSearch] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deletando, setDeletando] = useState(null);

  const lista = useMemo(() => {
    let r = [...equipamentosPMOC];
    if (search) r = r.filter((e) =>
      e.clienteNome?.toLowerCase().includes(search.toLowerCase()) ||
      e.marca?.toLowerCase().includes(search.toLowerCase()) ||
      e.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      e.numeroSerie?.toLowerCase().includes(search.toLowerCase()) ||
      e.localInstalacao?.toLowerCase().includes(search.toLowerCase())
    );
    if (filtroCliente) r = r.filter((e) => e.clienteId === Number(filtroCliente));
    if (filtroSituacao) r = r.filter((e) => e.situacao === filtroSituacao);
    return r;
  }, [equipamentosPMOC, search, filtroCliente, filtroSituacao]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (e) => { setEditing(e); setForm({ ...e }); setOpen(true); };

  const handleContratoChange = (e) => {
    const id = Number(e.target.value);
    const c = contratosPMOC.find((x) => x.id === id);
    setForm((f) => ({ ...f, contratoPMOCId: id, clienteId: c?.clienteId || '', clienteNome: c?.clienteNome || '' }));
  };

  const handleSave = () => {
    if (!form.marca || !form.modelo) return;
    if (editing) updateEquipamentoPMOC(editing.id, form);
    else addEquipamentoPMOC(form);
    setOpen(false);
  };

  return (
    <Box>
      <PageHeader
        title="Equipamentos PMOC"
        subtitle="Cadastro e controle de equipamentos vinculados aos contratos"
        breadcrumbs={['PMOC', 'Equipamentos']}
        action={openNew}
        actionLabel="Novo Equipamento"
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="medium"
              placeholder="Buscar por cliente, marca, modelo, nº série…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 300 }}
            />
            <TextField
              select size="medium" label="Cliente" value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)} sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
            </TextField>
            <TextField
              select size="medium" label="Situação" value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)} sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {SITUACOES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Marca / Modelo</TableCell>
                  <TableCell>BTU</TableCell>
                  <TableCell>Nº Série</TableCell>
                  <TableCell>Local</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Instalação</TableCell>
                  <TableCell>Situação</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      Nenhum equipamento encontrado
                    </TableCell>
                  </TableRow>
                ) : lista.map((eq) => (
                  <TableRow key={eq.id} hover>
                    <TableCell>
                      <Chip label={eq.tipo} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{eq.marca}</Typography>
                      <Typography variant="caption" color="text.secondary">{eq.modelo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{Number(eq.capacidadeBTU).toLocaleString('pt-BR')}</Typography>
                      <Typography variant="caption" color="text.secondary">BTUs</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace">{eq.numeroSerie || '—'}</Typography>
                    </TableCell>
                    <TableCell>{eq.localInstalacao}</TableCell>
                    <TableCell>{eq.clienteNome}</TableCell>
                    <TableCell>{formatDate(eq.dataInstalacao)}</TableCell>
                    <TableCell>
                      <Chip label={eq.situacao} size="small" color={situacaoCor(eq.situacao)} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(eq)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setDeletando(eq)}>
                          <DeleteIcon fontSize="small" />
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

      {/* Dialog Formulário */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Editar Equipamento' : 'Novo Equipamento PMOC'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              select fullWidth size="medium" label="Contrato PMOC vinculado"
              value={form.contratoPMOCId || ''} onChange={handleContratoChange}
            >
              <MenuItem value="">Sem vínculo</MenuItem>
              {contratosPMOC.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.numero} — {c.clienteNome}</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth size="medium" label="Tipo do Equipamento"
              value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
            >
              {TIPOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, gridColumn: 'span 2' }}>
              <TextField fullWidth size="medium" label="Marca *"
                value={form.marca} onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))} />
              <TextField fullWidth size="medium" label="Modelo *"
                value={form.modelo} onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} />
              <TextField select fullWidth size="medium" label="Capacidade BTU"
                value={form.capacidadeBTU} onChange={(e) => setForm((f) => ({ ...f, capacidadeBTU: e.target.value }))}
              >
                {BTUS.map((b) => <MenuItem key={b} value={b}>{Number(b).toLocaleString('pt-BR')} BTUs</MenuItem>)}
                <MenuItem value="custom">Outro</MenuItem>
              </TextField>
            </Box>
            <TextField fullWidth size="medium" label="Número de Série"
              value={form.numeroSerie} onChange={(e) => setForm((f) => ({ ...f, numeroSerie: e.target.value }))} />
            <TextField fullWidth size="medium" label="Local de Instalação"
              value={form.localInstalacao} onChange={(e) => setForm((f) => ({ ...f, localInstalacao: e.target.value }))} />
            <TextField fullWidth size="medium" label="Data de Instalação" type="date"
              value={form.dataInstalacao} onChange={(e) => setForm((f) => ({ ...f, dataInstalacao: e.target.value }))}
              InputLabelProps={{ shrink: true }} />
            <TextField select fullWidth size="medium" label="Situação Operacional"
              value={form.situacao} onChange={(e) => setForm((f) => ({ ...f, situacao: e.target.value }))}
            >
              {SITUACOES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.marca || !form.modelo}>
            {editing ? 'Salvar' : 'Cadastrar Equipamento'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deletando}
        title="Excluir equipamento?"
        message={`Deseja excluir ${deletando?.marca} ${deletando?.modelo} (${deletando?.localInstalacao})? Esta ação não pode ser desfeita.`}
        onConfirm={() => { deleteEquipamentoPMOC(deletando.id); setDeletando(null); }}
        onCancel={() => setDeletando(null)}
      />
    </Box>
  );
}
