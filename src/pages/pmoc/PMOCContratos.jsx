import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Typography,
  Tooltip, Alert, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatDate, formatCurrency } from '../../utils';

const FREQUENCIAS = ['Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'];

const statusContrato = (dataVencimento) => {
  const dias = Math.ceil((new Date(dataVencimento) - new Date()) / 86400000);
  if (dias < 0) return { label: 'Vencido', color: 'error' };
  if (dias <= 30) return { label: 'Vence em breve', color: 'warning' };
  return { label: 'Ativo', color: 'success' };
};

const EMPTY = {
  clienteId: '', clienteNome: '', unidade: '', responsavel: '',
  dataInicio: '', dataVencimento: '', frequencia: 'Mensal', valor: '', observacoes: '',
};

export default function PMOCContratos() {
  const { contratosPMOC, clientes, addContratoPMOC, updateContratoPMOC, deleteContratoPMOC } = useStore();
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deletando, setDeletando] = useState(null);

  const lista = useMemo(() => {
    let r = [...contratosPMOC];
    if (search) r = r.filter((c) =>
      c.clienteNome?.toLowerCase().includes(search.toLowerCase()) ||
      c.numero?.toLowerCase().includes(search.toLowerCase()) ||
      c.unidade?.toLowerCase().includes(search.toLowerCase())
    );
    if (filtroStatus) {
      r = r.filter((c) => statusContrato(c.dataVencimento).label === filtroStatus);
    }
    return r.sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
  }, [contratosPMOC, search, filtroStatus]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setOpen(true); };

  const handleClienteChange = (e) => {
    const id = Number(e.target.value);
    const cl = clientes.find((c) => c.id === id);
    setForm((f) => ({ ...f, clienteId: id, clienteNome: cl?.nome || '', responsavel: cl?.responsavel || '' }));
  };

  const handleSave = () => {
    if (!form.clienteId || !form.dataInicio || !form.dataVencimento) return;
    if (editing) updateContratoPMOC(editing.id, form);
    else addContratoPMOC(form);
    setOpen(false);
  };

  const vencendoHoje = contratosPMOC.filter((c) => {
    const d = Math.ceil((new Date(c.dataVencimento) - new Date()) / 86400000);
    return d >= 0 && d <= 7;
  }).length;

  return (
    <Box>
      <PageHeader
        title="Contratos PMOC"
        subtitle="Gestão de contratos de manutenção preventiva"
        breadcrumbs={['PMOC', 'Contratos']}
        action={openNew}
        actionLabel="Novo Contrato"
      />

      {vencendoHoje > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
          {vencendoHoje} contrato{vencendoHoje > 1 ? 's' : ''} vencendo nos próximos 7 dias. Verifique e renove.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="medium"
              placeholder="Buscar por cliente, nº ou unidade…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 300 }}
            />
            <TextField
              select size="medium" label="Status" value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)} sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Ativo">Ativo</MenuItem>
              <MenuItem value="Vence em breve">Vence em breve</MenuItem>
              <MenuItem value="Vencido">Vencido</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nº Contrato</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Unidade</TableCell>
                  <TableCell>Frequência</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Valor/Mês</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                ) : lista.map((c) => {
                  const st = statusContrato(c.dataVencimento);
                  const dias = Math.ceil((new Date(c.dataVencimento) - new Date()) / 86400000);
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{c.numero}</Typography></TableCell>
                      <TableCell>{c.clienteNome}</TableCell>
                      <TableCell>{c.unidade}</TableCell>
                      <TableCell>
                        <Chip label={c.frequencia} size="small" variant="outlined" color="info" />
                      </TableCell>
                      <TableCell>{formatDate(c.dataInicio)}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{formatDate(c.dataVencimento)}</Typography>
                          {dias >= 0 && dias <= 30 && (
                            <Typography variant="caption" color="warning.main">em {dias}d</Typography>
                          )}
                          {dias < 0 && (
                            <Typography variant="caption" color="error.main">{Math.abs(dias)}d atrás</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{formatCurrency(c.valor)}</TableCell>
                      <TableCell>
                        <Chip label={st.label} size="small" color={st.color} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => setDeletando(c)}>
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
        <DialogTitle>{editing ? 'Editar Contrato PMOC' : 'Novo Contrato PMOC'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              select fullWidth size="medium" label="Cliente *"
              value={form.clienteId || ''} onChange={handleClienteChange}
            >
              {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
            </TextField>
            <TextField fullWidth size="medium" label="Unidade / Filial *"
              value={form.unidade} onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))} />
            <TextField fullWidth size="medium" label="Responsável"
              value={form.responsavel} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))} />
            <TextField select fullWidth size="medium" label="Frequência das Manutenções"
              value={form.frequencia} onChange={(e) => setForm((f) => ({ ...f, frequencia: e.target.value }))}
            >
              {FREQUENCIAS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, gridColumn: 'span 2' }}>
              <TextField fullWidth size="medium" label="Data de Início *" type="date"
                value={form.dataInicio} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
              <TextField fullWidth size="medium" label="Data de Vencimento *" type="date"
                value={form.dataVencimento} onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
              <TextField fullWidth size="medium" label="Valor Mensal (R$)" type="number"
                value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
            </Box>
            <TextField fullWidth size="medium" label="Observações" multiline rows={3}
              value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              sx={{ gridColumn: 'span 2' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.clienteId || !form.dataInicio || !form.dataVencimento}>
            {editing ? 'Salvar' : 'Criar Contrato'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deletando}
        title="Excluir contrato?"
        message={`Deseja excluir o contrato ${deletando?.numero} de ${deletando?.clienteNome}? Esta ação não pode ser desfeita.`}
        onConfirm={() => { deleteContratoPMOC(deletando.id); setDeletando(null); }}
        onCancel={() => setDeletando(null)}
      />
    </Box>
  );
}
