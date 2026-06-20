import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid, Typography,
  Tooltip, InputAdornment, Stack, Divider, ToggleButton, ToggleButtonGroup,
  Paper, Alert, Stepper, Step, StepLabel, FormControlLabel, Checkbox,
  useTheme, alpha,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleOutlineIcon from '@mui/icons-material/DoNotDisturb';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useStore } from '../../store';
import { formatDate } from '../../utils';

const ITENS_PREVENTIVA = [
  'Limpeza dos filtros de ar',
  'Limpeza do evaporador (serpentina interna)',
  'Limpeza do condensador (serpentina externa)',
  'Verificação e limpeza do bandeja de condensado',
  'Verificação do dreno e limpeza',
  'Medição de corrente elétrica',
  'Medição de tensão de alimentação',
  'Medição de temperatura de insuflamento',
  'Medição de temperatura de retorno',
  'Verificação do nível de gás refrigerante',
  'Verificação do capacitor',
  'Verificação do ventilador (rolamentos e pás)',
  'Inspeção visual da estrutura',
  'Teste de funcionamento geral',
];

const ITENS_INSTALACAO = [
  'Suporte da condensadora instalado e nivelado',
  'Suporte da evaporadora instalado e nivelado',
  'Tubulação de cobre instalada e isolada',
  'Conexões de cobre com flare ou solda',
  'Dreno instalado com caimento adequado',
  'Vácuo realizado (mín. 500 microns)',
  'Teste de estanqueidade (pressão mín. 150 psi)',
  'Fiação elétrica de acordo com norma',
  'Disjuntor dimensionado corretamente',
  'Aterramento verificado',
  'Carga de gás conferida',
  'Equipamento ligado e funcionando',
  'Temperatura de insuflamento verificada',
  'Controle remoto programado e testado',
  'Ambiente limpo e organizado após instalação',
];

const ITENS_CORRETIVA = [
  'Diagnóstico do problema identificado',
  'Código de erro coletado (se aplicável)',
  'Verificação elétrica realizada',
  'Verificação de gás refrigerante',
  'Peças com defeito identificadas',
  'Peças substituídas',
  'Testes após substituição realizados',
  'Equipamento operando normalmente',
  'Causa raiz documentada',
];

const TIPOS_CHECKLIST = {
  Preventiva: ITENS_PREVENTIVA,
  Instalação: ITENS_INSTALACAO,
  Corretiva: ITENS_CORRETIVA,
};

const STEPS = ['Identificação', 'Checklist', 'Evidências e Assinaturas'];

const statusCor = { 'Concluído': 'success', 'Em Andamento': 'warning', 'Pendente': 'info' };

const ItemStatus = ({ value, onChange }) => {
  const theme = useTheme();
  const options = [
    { v: 'OK', label: 'OK', color: 'success', Icon: CheckCircleIcon },
    { v: 'NOK', label: 'NOK', color: 'error', Icon: CancelIcon },
    { v: 'NA', label: 'N/A', color: 'default', Icon: RemoveCircleOutlineIcon },
  ];
  return (
    <ToggleButtonGroup value={value} exclusive onChange={(_, v) => v && onChange(v)} size="small">
      {options.map(({ v, label, color, Icon }) => (
        <ToggleButton key={v} value={v}
          sx={{
            px: 1.5, py: 0.5, fontSize: 11, fontWeight: 600,
            ...(value === v && color !== 'default' ? {
              bgcolor: alpha(theme.palette[color].main, 0.12),
              color: `${color}.main`,
              borderColor: `${color}.main`,
            } : {}),
          }}
        >
          <Icon sx={{ fontSize: 14, mr: 0.5 }} />{label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

const buildItens = (tipo) =>
  (TIPOS_CHECKLIST[tipo] || ITENS_PREVENTIVA).map((desc, i) => ({
    id: i + 1, descricao: desc, status: 'OK', observacao: '',
  }));

export default function Checklist() {
  const {
    checklists, ordens, clientes, equipamentosPMOC, tecnicos,
    addChecklist, updateChecklist, deleteChecklist,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [deletando, setDeletando] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(null);

  const lista = useMemo(() => {
    let r = [...checklists];
    if (search) r = r.filter((c) =>
      c.clienteNome?.toLowerCase().includes(search.toLowerCase()) ||
      c.numero?.toLowerCase().includes(search.toLowerCase()) ||
      c.equipamentoNome?.toLowerCase().includes(search.toLowerCase())
    );
    if (filtroTipo) r = r.filter((c) => c.tipo === filtroTipo);
    if (filtroStatus) r = r.filter((c) => c.status === filtroStatus);
    return r.sort((a, b) => new Date(b.dataExecucao) - new Date(a.dataExecucao));
  }, [checklists, search, filtroTipo, filtroStatus]);

  const openNew = () => {
    setForm({
      ordemId: '', osNumero: '', clienteId: '', clienteNome: '',
      equipamentoId: '', equipamentoNome: '', tipo: 'Preventiva',
      tecnicoNome: '', itens: buildItens('Preventiva'),
      observacoes: '', recomendacoes: '',
      proximaManutencao: '', assinaturaTecnico: '', assinaturaCliente: '',
      status: 'Em Andamento',
    });
    setStep(0);
    setOpen(true);
  };

  const handleTipoChange = (tipo) => {
    setForm((f) => ({ ...f, tipo, itens: buildItens(tipo) }));
  };

  const handleOSChange = (e) => {
    const id = Number(e.target.value);
    const os = ordens.find((o) => o.id === id);
    setForm((f) => ({
      ...f, ordemId: id,
      osNumero: os?.numero || '',
      clienteId: os?.clienteId || '',
      clienteNome: os?.clienteNome || '',
      tecnicoNome: os?.tecnicoNome || f.tecnicoNome,
    }));
  };

  const handleEquipamentoChange = (e) => {
    const id = Number(e.target.value);
    const eq = equipamentosPMOC.find((x) => x.id === id);
    setForm((f) => ({
      ...f, equipamentoId: id,
      equipamentoNome: eq ? `${eq.marca} ${eq.modelo} — ${eq.localInstalacao}` : '',
    }));
  };

  const handleItemStatus = (idx, status) => {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((it, i) => i === idx ? { ...it, status } : it),
    }));
  };

  const handleItemObs = (idx, obs) => {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((it, i) => i === idx ? { ...it, observacao: obs } : it),
    }));
  };

  const handleSave = (finalStatus = 'Em Andamento') => {
    addChecklist({ ...form, status: finalStatus });
    setOpen(false);
  };

  const nok = form?.itens?.filter((i) => i.status === 'NOK').length || 0;
  const ok = form?.itens?.filter((i) => i.status === 'OK').length || 0;
  const total = form?.itens?.length || 0;

  return (
    <Box>
      <PageHeader
        title="Checklist Técnico"
        subtitle="Controle de vistorias, instalações e manutenções"
        breadcrumbs={['Operações', 'Checklist']}
        action={openNew}
        actionLabel="Novo Checklist"
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Buscar por cliente, nº ou equipamento…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 280 }}
            />
            <TextField select size="small" label="Tipo" value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="">Todos</MenuItem>
              {Object.keys(TIPOS_CHECKLIST).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="">Todos</MenuItem>
              {['Em Andamento', 'Concluído', 'Pendente'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nº</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Equipamento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>OS Vinculada</TableCell>
                  <TableCell>Itens OK</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      Nenhum checklist encontrado
                    </TableCell>
                  </TableRow>
                ) : lista.map((ck) => {
                  const okCount = ck.itens?.filter((i) => i.status === 'OK').length || 0;
                  const totalCount = ck.itens?.length || 0;
                  return (
                    <TableRow key={ck.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{ck.numero}</Typography></TableCell>
                      <TableCell>{formatDate(ck.dataExecucao)}</TableCell>
                      <TableCell>{ck.clienteNome}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{ck.equipamentoNome}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={ck.tipo} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {ck.osNumero ? <Chip label={ck.osNumero} size="small" variant="outlined" /> : '—'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={okCount === totalCount ? 'success.main' : 'warning.main'}>
                          {okCount}/{totalCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={ck.status} size="small" color={statusCor[ck.status] || 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizar">
                          <IconButton size="small" onClick={() => setViewing(ck)}><VisibilityIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => setDeletando(ck)}>
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

      {/* Dialog Novo Checklist */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentTurnedInIcon color="primary" />
            Novo Checklist Técnico
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Stepper activeStep={step} sx={{ px: 3, pt: 2.5, pb: 1.5, bgcolor: 'background.default' }}>
            {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
          </Stepper>
          <Divider />

          {form && (
            <Box sx={{ p: 3 }}>
              {/* Step 0: Identificação */}
              {step === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth size="small" label="Tipo de Checklist"
                      value={form.tipo} onChange={(e) => handleTipoChange(e.target.value)}>
                      {Object.keys(TIPOS_CHECKLIST).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth size="small" label="OS Vinculada"
                      value={form.ordemId || ''} onChange={handleOSChange}>
                      <MenuItem value="">Sem OS</MenuItem>
                      {ordens.map((o) => <MenuItem key={o.id} value={o.id}>{o.numero} — {o.clienteNome}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth size="small" label="Cliente"
                      value={form.clienteId || ''}
                      onChange={(e) => {
                        const cl = clientes.find((c) => c.id === Number(e.target.value));
                        setForm((f) => ({ ...f, clienteId: Number(e.target.value), clienteNome: cl?.nome || '' }));
                      }}>
                      <MenuItem value="">Selecionar</MenuItem>
                      {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth size="small" label="Equipamento"
                      value={form.equipamentoId || ''} onChange={handleEquipamentoChange}>
                      <MenuItem value="">Selecionar</MenuItem>
                      {equipamentosPMOC.map((e) => (
                        <MenuItem key={e.id} value={e.id}>{e.marca} {e.modelo} — {e.localInstalacao}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth size="small" label="Técnico Responsável"
                      value={form.tecnicoNome}
                      onChange={(e) => setForm((f) => ({ ...f, tecnicoNome: e.target.value }))}>
                      <MenuItem value="">Selecionar</MenuItem>
                      {tecnicos.map((t) => <MenuItem key={t.id} value={t.nome}>{t.nome}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              )}

              {/* Step 1: Checklist */}
              {step === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Checklist de {form.tipo} — {total} itens
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={`${ok} OK`} size="small" color="success" />
                      {nok > 0 && <Chip label={`${nok} NOK`} size="small" color="error" />}
                    </Stack>
                  </Box>

                  <Stack spacing={1.5}>
                    {form.itens.map((item, idx) => (
                      <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5,
                        borderColor: item.status === 'NOK' ? 'error.main' : item.status === 'OK' ? 'success.main' : 'divider',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Typography variant="body2" sx={{ flex: 1, pt: 0.5 }}>{item.descricao}</Typography>
                          <ItemStatus value={item.status} onChange={(v) => handleItemStatus(idx, v)} />
                        </Box>
                        {item.status === 'NOK' && (
                          <TextField
                            fullWidth size="small" label="Observação sobre a não conformidade"
                            value={item.observacao}
                            onChange={(e) => handleItemObs(idx, e.target.value)}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    ))}
                  </Stack>

                  {nok > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {nok} item(s) marcado(s) como NOK. Adicione observações e recomendações na próxima etapa.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 2: Evidências e Assinaturas */}
              {step === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Observações Gerais" multiline rows={3}
                      value={form.observacoes}
                      onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Recomendações Técnicas" multiline rows={2}
                      value={form.recomendacoes}
                      onChange={(e) => setForm((f) => ({ ...f, recomendacoes: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Próxima Manutenção Sugerida" type="date"
                      value={form.proximaManutencao}
                      onChange={(e) => setForm((f) => ({ ...f, proximaManutencao: e.target.value }))}
                      InputLabelProps={{ shrink: true }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Evidências Fotográficas
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Arraste fotos ou vídeos aqui · Upload de evidências (em implementação)
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assinaturas</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Nome do Técnico (assinatura)"
                      value={form.assinaturaTecnico}
                      onChange={(e) => setForm((f) => ({ ...f, assinaturaTecnico: e.target.value }))}
                      helperText="Digite o nome completo para assinar" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Nome do Cliente (assinatura)"
                      value={form.assinaturaCliente}
                      onChange={(e) => setForm((f) => ({ ...f, assinaturaCliente: e.target.value }))}
                      helperText="Digite o nome completo para assinar" />
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" icon={<AssignmentTurnedInIcon />}>
                      Ao concluir, o relatório PDF será gerado automaticamente com todos os dados, itens e assinaturas.
                    </Alert>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
          <Button onClick={() => step > 0 ? setStep(step - 1) : setOpen(false)}>
            {step === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {step < STEPS.length - 1 ? (
              <Button variant="contained" onClick={() => setStep(step + 1)}>
                Próximo
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={() => handleSave('Em Andamento')}>
                  Salvar Rascunho
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AssignmentTurnedInIcon />}
                  onClick={() => handleSave('Concluído')}
                >
                  Concluir e Gerar PDF
                </Button>
              </>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Dialog Visualizar */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="md" fullWidth>
        {viewing && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentTurnedInIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{viewing.numero}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(viewing.dataExecucao)} · {viewing.tipo} · {viewing.tecnicoNome}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={viewing.status} color={statusCor[viewing.status] || 'default'} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Cliente</Typography>
                  <Typography variant="body2" fontWeight={600}>{viewing.clienteNome}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Equipamento</Typography>
                  <Typography variant="body2" fontWeight={600}>{viewing.equipamentoNome}</Typography>
                </Grid>
                {viewing.osNumero && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">OS Vinculada</Typography>
                    <Typography variant="body2" fontWeight={600}>{viewing.osNumero}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Itens do Checklist</Typography>
              <Stack spacing={1}>
                {viewing.itens?.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.75 }}>
                    <Chip
                      label={item.status}
                      size="small"
                      color={item.status === 'OK' ? 'success' : item.status === 'NOK' ? 'error' : 'default'}
                      sx={{ minWidth: 48 }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>{item.descricao}</Typography>
                    {item.observacao && (
                      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, textAlign: 'right' }}>
                        {item.observacao}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>

              {(viewing.observacoes || viewing.recomendacoes) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  {viewing.observacoes && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" gutterBottom>Observações</Typography>
                      <Typography variant="body2" color="text.secondary">{viewing.observacoes}</Typography>
                    </Box>
                  )}
                  {viewing.recomendacoes && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Recomendações</Typography>
                      <Typography variant="body2" color="text.secondary">{viewing.recomendacoes}</Typography>
                    </Box>
                  )}
                </>
              )}

              {(viewing.assinaturaTecnico || viewing.assinaturaCliente) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Assinatura Técnico</Typography>
                      <Box sx={{ mt: 1, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="body2" fontStyle="italic">{viewing.assinaturaTecnico || '—'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Assinatura Cliente</Typography>
                      <Box sx={{ mt: 1, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="body2" fontStyle="italic">{viewing.assinaturaCliente || '—'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewing(null)}>Fechar</Button>
              <Button variant="contained" startIcon={<AssignmentTurnedInIcon />}>
                Gerar PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deletando}
        title="Excluir checklist?"
        message={`Deseja excluir o checklist ${deletando?.numero} de ${deletando?.clienteNome}?`}
        onConfirm={() => { deleteChecklist(deletando.id); setDeletando(null); }}
        onCancel={() => setDeletando(null)}
      />
    </Box>
  );
}
