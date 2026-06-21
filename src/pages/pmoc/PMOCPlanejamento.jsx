import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Typography,
  Tooltip, InputAdornment, Alert, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatDate } from '../../utils';

const FREQ_DIAS = { Mensal: 30, Bimestral: 60, Trimestral: 90, Semestral: 180, Anual: 365 };

const gerarProximasManutencoes = (contratosPMOC, equipamentosPMOC, manutencoesPMOC) => {
  const novas = [];
  contratosPMOC.forEach((contrato) => {
    const equipamentos = equipamentosPMOC.filter((e) => e.contratoPMOCId === contrato.id);
    const dias = FREQ_DIAS[contrato.frequencia] || 30;
    equipamentos.forEach((eq) => {
      const ultima = manutencoesPMOC
        .filter((m) => m.equipamentoId === eq.id && m.status === 'Realizada')
        .sort((a, b) => new Date(b.dataRealizacao) - new Date(a.dataRealizacao))[0];
      const base = ultima ? new Date(ultima.dataRealizacao) : new Date(contrato.dataInicio);
      const proxData = new Date(base);
      proxData.setDate(proxData.getDate() + dias);
      const jaAgendada = manutencoesPMOC.some(
        (m) => m.equipamentoId === eq.id && m.status === 'Agendada' &&
          Math.abs(new Date(m.dataAgendada) - proxData) < 7 * 86400000
      );
      if (!jaAgendada) {
        novas.push({
          contratoPMOCId: contrato.id,
          equipamentoId: eq.id,
          clienteNome: contrato.clienteNome,
          equipamentoNome: `${eq.marca} ${eq.modelo} — ${eq.localInstalacao}`,
          tipo: 'Preventiva',
          dataAgendada: proxData.toISOString().split('T')[0],
          dataRealizacao: null,
          status: 'Sugerida',
          tecnicoNome: '',
          osVinculada: null,
          observacoes: '',
        });
      }
    });
  });
  return novas;
};

const EMPTY = {
  contratoPMOCId: '', equipamentoId: '', clienteNome: '',
  equipamentoNome: '', tipo: 'Preventiva', dataAgendada: '',
  dataRealizacao: '', status: 'Agendada', tecnicoNome: '', osVinculada: '', observacoes: '',
};

const statusCor = (s) => ({
  'Agendada': 'primary', 'Realizada': 'success', 'Cancelada': 'error',
  'Sugerida': 'warning', 'Em Andamento': 'info',
}[s] || 'default');

export default function PMOCPlanejamento() {
  const { manutencoesPMOC, contratosPMOC, equipamentosPMOC, tecnicos,
    addManutencaoPMOC, updateManutencaoPMOC, deleteManutencaoPMOC, addOrdem } = useStore();
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deletando, setDeletando] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);

  const lista = useMemo(() => {
    let r = [...manutencoesPMOC];
    if (search) r = r.filter((m) =>
      m.clienteNome?.toLowerCase().includes(search.toLowerCase()) ||
      m.equipamentoNome?.toLowerCase().includes(search.toLowerCase()) ||
      m.tecnicoNome?.toLowerCase().includes(search.toLowerCase())
    );
    if (filtroStatus) r = r.filter((m) => m.status === filtroStatus);
    return r.sort((a, b) => new Date(a.dataAgendada) - new Date(b.dataAgendada));
  }, [manutencoesPMOC, search, filtroStatus]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...m }); setOpen(true); };

  const handleContratoChange = (e) => {
    const id = Number(e.target.value);
    const c = contratosPMOC.find((x) => x.id === id);
    setForm((f) => ({ ...f, contratoPMOCId: id, clienteNome: c?.clienteNome || '' }));
  };

  const handleEquipamentoChange = (e) => {
    const id = Number(e.target.value);
    const eq = equipamentosPMOC.find((x) => x.id === id);
    setForm((f) => ({
      ...f, equipamentoId: id,
      equipamentoNome: eq ? `${eq.marca} ${eq.modelo} — ${eq.localInstalacao}` : '',
    }));
  };

  const handleSave = () => {
    if (!form.dataAgendada) return;
    if (editing) updateManutencaoPMOC(editing.id, form);
    else addManutencaoPMOC(form);
    setOpen(false);
  };

  const gerarOS = (m) => {
    const eq = equipamentosPMOC.find((e) => e.id === m.equipamentoId);
    addOrdem({
      clienteId: contratosPMOC.find((c) => c.id === m.contratoPMOCId)?.clienteId || '',
      clienteNome: m.clienteNome,
      equipamento: m.equipamentoNome,
      marca: eq?.marca || '',
      modelo: eq?.modelo || '',
      btus: eq?.capacidadeBTU || '',
      localInstalacao: eq?.localInstalacao || '',
      tipo: 'Manutenção Preventiva',
      status: 'Agendada',
      tecnicoNome: m.tecnicoNome,
      problema: `PMOC — Manutenção preventiva programada`,
      servicoExecutado: '',
      pecasUtilizadas: '',
      materiais: '',
      tempoGasto: '',
      observacoes: `Contrato PMOC vinculado. Manutenção de frequência ${contratosPMOC.find((c) => c.id === m.contratoPMOCId)?.frequencia || ''}.`,
    });
    updateManutencaoPMOC(m.id, { ...m, osVinculada: 'Gerada', status: 'Em Andamento' });
  };

  const handleGerarSugestoes = () => {
    const s = gerarProximasManutencoes(contratosPMOC, equipamentosPMOC, manutencoesPMOC);
    setSugestoes(s);
    setShowSugestoes(true);
  };

  const confirmarSugestao = (s) => {
    addManutencaoPMOC({ ...s, status: 'Agendada' });
    setSugestoes((prev) => prev.filter((x) => x !== s));
  };

  const equipamentosFiltrados = form.contratoPMOCId
    ? equipamentosPMOC.filter((e) => e.contratoPMOCId === Number(form.contratoPMOCId))
    : equipamentosPMOC;

  return (
    <Box>
      <PageHeader
        title="Planejamento PMOC"
        subtitle="Agenda técnica de manutenções preventivas programadas"
        breadcrumbs={['PMOC', 'Planejamento']}
        action={openNew}
        actionLabel="Agendar Manutenção"
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AutorenewIcon />}
          onClick={handleGerarSugestoes}
        >
          Gerar Sugestões Automáticas
        </Button>
      </Box>

      {showSugestoes && sugestoes.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {sugestoes.length} manutenção(ões) sugerida(s) pelo sistema. Confirme para adicionar ao planejamento:
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {sugestoes.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {formatDate(s.dataAgendada)} — {s.clienteNome} — {s.equipamentoNome}
                </Typography>
                <Button size="small" variant="contained" onClick={() => confirmarSugestao(s)}>
                  Confirmar
                </Button>
              </Box>
            ))}
          </Stack>
        </Alert>
      )}

      {showSugestoes && sugestoes.length === 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Todas as sugestões foram processadas. Planejamento atualizado.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="medium" placeholder="Buscar por cliente, equipamento ou técnico…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 300 }}
            />
            <TextField
              select size="medium" label="Status" value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)} sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {['Agendada', 'Em Andamento', 'Realizada', 'Cancelada'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data Agendada</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Equipamento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>OS Vinculada</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      Nenhuma manutenção encontrada
                    </TableCell>
                  </TableRow>
                ) : lista.map((m) => {
                  const dias = Math.ceil((new Date(m.dataAgendada) - new Date()) / 86400000);
                  const atrasada = dias < 0 && m.status === 'Agendada';
                  return (
                    <TableRow key={m.id} hover sx={atrasada ? { bgcolor: 'error.50' } : {}}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color={atrasada ? 'error.main' : 'inherit'}>
                            {formatDate(m.dataAgendada)}
                          </Typography>
                          {m.status === 'Agendada' && (
                            <Typography variant="caption" color={atrasada ? 'error.main' : dias <= 7 ? 'warning.main' : 'text.secondary'}>
                              {atrasada ? `${Math.abs(dias)}d atrasada` : dias === 0 ? 'Hoje' : `em ${dias}d`}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{m.clienteNome}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>{m.equipamentoNome}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={m.tipo} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>{m.tecnicoNome || '—'}</TableCell>
                      <TableCell>
                        {m.osVinculada ? (
                          <Chip label={m.osVinculada} size="small" color="success" variant="outlined" />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={m.status} size="small" color={statusCor(m.status)} />
                      </TableCell>
                      <TableCell align="right">
                        {m.status === 'Agendada' && (
                          <Tooltip title="Gerar Ordem de Serviço">
                            <IconButton size="small" color="primary" onClick={() => gerarOS(m)}>
                              <AssignmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => setDeletando(m)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog Formulário */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Editar Manutenção' : 'Agendar Manutenção'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField select fullWidth size="medium" label="Contrato PMOC"
              value={form.contratoPMOCId || ''} onChange={handleContratoChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {contratosPMOC.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.numero} — {c.clienteNome}</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth size="medium" label="Equipamento"
              value={form.equipamentoId || ''} onChange={handleEquipamentoChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {equipamentosFiltrados.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.marca} {e.modelo} — {e.localInstalacao}</MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, gridColumn: 'span 2' }}>
              <TextField select fullWidth size="medium" label="Tipo"
                value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              >
                {['Preventiva', 'Corretiva', 'Instalação', 'Higienização'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth size="medium" label="Data Agendada *" type="date"
                value={form.dataAgendada} onChange={(e) => setForm((f) => ({ ...f, dataAgendada: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
              <TextField select fullWidth size="medium" label="Técnico Responsável"
                value={form.tecnicoNome} onChange={(e) => setForm((f) => ({ ...f, tecnicoNome: e.target.value }))}
              >
                <MenuItem value="">A definir</MenuItem>
                {tecnicos.map((t) => <MenuItem key={t.id} value={t.nome}>{t.nome}</MenuItem>)}
              </TextField>
            </Box>
            <TextField select fullWidth size="medium" label="Status"
              value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {['Agendada', 'Em Andamento', 'Realizada', 'Cancelada'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            {form.status === 'Realizada' && (
              <TextField fullWidth size="medium" label="Data de Realização" type="date"
                value={form.dataRealizacao || ''} onChange={(e) => setForm((f) => ({ ...f, dataRealizacao: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            )}
            <TextField fullWidth size="medium" label="Observações" multiline rows={2}
              value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              sx={{ gridColumn: 'span 2' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.dataAgendada}>
            {editing ? 'Salvar' : 'Agendar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deletando}
        title="Excluir manutenção?"
        message={`Deseja excluir esta manutenção de ${deletando?.clienteNome} agendada para ${formatDate(deletando?.dataAgendada)}?`}
        onConfirm={() => { deleteManutencaoPMOC(deletando.id); setDeletando(null); }}
        onCancel={() => setDeletando(null)}
      />
    </Box>
  );
}
