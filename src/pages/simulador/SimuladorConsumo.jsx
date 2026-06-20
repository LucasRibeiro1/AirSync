import { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, MenuItem,
  Button, Divider, Stack, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, useTheme, alpha, Alert,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils';

const CLASSES = [
  { label: 'A (Inverter Premium)', fator: 1.0 },
  { label: 'B (Inverter Simples)', fator: 1.12 },
  { label: 'C (Convencional Novo)', fator: 1.25 },
  { label: 'D (Convencional Antigo)', fator: 1.45 },
];

const BTUS_WATTS = {
  7000: 700, 9000: 860, 12000: 1100, 18000: 1600, 24000: 2050,
  30000: 2600, 36000: 3100, 48000: 4100, 60000: 5100,
};

const EMPTY = {
  capacidadeBTU: '12000', potenciaW: '1100', classe: 'C (Convencional Novo)',
  horasDia: '8', diasMes: '22', precoKwh: '0.85',
};

const calcular = (f) => {
  const w = Number(f.potenciaW) || 0;
  const h = Number(f.horasDia) || 0;
  const d = Number(f.diasMes) || 0;
  const preco = Number(f.precoKwh) || 0;

  const kwhDia = (w / 1000) * h;
  const kwhMes = kwhDia * d;
  const kwhAno = kwhMes * 12;

  return {
    kwhDia: kwhDia.toFixed(2),
    kwhMes: kwhMes.toFixed(2),
    kwhAno: kwhAno.toFixed(2),
    custoDia: kwhDia * preco,
    custoMes: kwhMes * preco,
    custoAno: kwhAno * preco,
  };
};

const calcularComparacao = (f) => {
  const w = Number(f.potenciaW) || 0;
  const h = Number(f.horasDia) || 0;
  const d = Number(f.diasMes) || 0;
  const preco = Number(f.precoKwh) || 0;

  const base = (w / 1000) * h * d * 12 * preco;

  return [
    {
      nome: 'Convencional (Atual)',
      fator: 1.0,
      custoAno: base,
      cor: '#ef5350',
    },
    {
      nome: 'Inverter Simples',
      fator: 0.75,
      custoAno: base * 0.75,
      cor: '#ff9800',
    },
    {
      nome: 'Inverter Premium A',
      fator: 0.60,
      custoAno: base * 0.60,
      cor: '#4caf50',
    },
  ];
};

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SAZONALIDADE = [1.2, 1.3, 1.1, 0.9, 0.7, 0.8, 0.9, 1.1, 1.0, 0.9, 1.0, 1.2];

export default function SimuladorConsumo() {
  const theme = useTheme();
  const [form, setForm] = useState(EMPTY);
  const [simulado, setSimulado] = useState(false);

  const set = (k) => (e) => {
    const val = e.target.value;
    const updates = { [k]: val };
    if (k === 'capacidadeBTU') {
      updates.potenciaW = String(BTUS_WATTS[Number(val)] || val);
    }
    setForm((f) => ({ ...f, ...updates }));
  };

  const resultado = useMemo(() => calcular(form), [form]);
  const comparacao = useMemo(() => calcularComparacao(form), [form]);

  const dadosMensais = useMemo(() => MESES.map((mes, i) => ({
    mes,
    convencional: parseFloat((Number(resultado.custoMes) * SAZONALIDADE[i]).toFixed(2)),
    inverter: parseFloat((Number(resultado.custoMes) * 0.60 * SAZONALIDADE[i]).toFixed(2)),
  })), [resultado]);

  const projecao5Anos = useMemo(() => {
    const custoAnualConv = Number(resultado.custoAno);
    const custoAnualInv = custoAnualConv * 0.60;
    const investimentoInverter = 2500;
    const acumuladoConv = [0];
    const acumuladoInv = [investimentoInverter];
    for (let i = 1; i <= 60; i++) {
      acumuladoConv.push(acumuladoConv[i - 1] + custoAnualConv / 12);
      acumuladoInv.push(acumuladoInv[i - 1] + custoAnualInv / 12);
    }
    return Array.from({ length: 61 }, (_, i) => ({
      mes: i,
      convencional: parseFloat(acumuladoConv[i].toFixed(2)),
      inverter: parseFloat(acumuladoInv[i].toFixed(2)),
    })).filter((_, i) => i % 6 === 0);
  }, [resultado]);

  const economiaTotalInverter = comparacao[0].custoAno - comparacao[2].custoAno;

  return (
    <Box>
      <PageHeader
        title="Simulador de Consumo"
        subtitle="Calcule o custo operacional e compare equipamentos"
        breadcrumbs={['Ferramentas', 'Simulador de Consumo']}
      />

      <Grid container spacing={2.5}>
        {/* Formulário */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BoltIcon color="primary" />
                <Typography variant="h6">Dados do Equipamento</Typography>
              </Box>

              <Stack spacing={2}>
                <TextField select fullWidth size="small" label="Capacidade BTU"
                  value={form.capacidadeBTU} onChange={set('capacidadeBTU')}>
                  {Object.keys(BTUS_WATTS).map((b) => (
                    <MenuItem key={b} value={b}>{Number(b).toLocaleString('pt-BR')} BTUs</MenuItem>
                  ))}
                </TextField>

                <TextField fullWidth size="small" label="Potência (W)" type="number"
                  value={form.potenciaW} onChange={set('potenciaW')}
                  helperText="Preenchido automaticamente pelo BTU" />

                <TextField select fullWidth size="small" label="Classe Energética"
                  value={form.classe} onChange={set('classe')}>
                  {CLASSES.map((c) => <MenuItem key={c.label} value={c.label}>{c.label}</MenuItem>)}
                </TextField>

                <Divider />
                <Typography variant="subtitle2" color="text.secondary">Uso</Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Horas/dia" type="number"
                      value={form.horasDia} onChange={set('horasDia')}
                      inputProps={{ min: 1, max: 24 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Dias/mês" type="number"
                      value={form.diasMes} onChange={set('diasMes')}
                      inputProps={{ min: 1, max: 31 }} />
                  </Grid>
                </Grid>

                <TextField fullWidth size="small" label="Valor do kWh (R$)" type="number"
                  value={form.precoKwh} onChange={set('precoKwh')}
                  helperText="Verifique sua conta de energia"
                  inputProps={{ step: 0.01 }} />

                <Button fullWidth variant="contained" size="large" startIcon={<BoltIcon />}
                  onClick={() => setSimulado(true)}>
                  Simular Consumo
                </Button>
                <Button fullWidth variant="outlined" startIcon={<RestartAltIcon />}
                  onClick={() => { setForm(EMPTY); setSimulado(false); }}>
                  Limpar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultados */}
        <Grid item xs={12} md={8}>
          {!simulado ? (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center', p: 6 }}>
                <BoltIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Configure o equipamento e clique em Simular
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2.5}>
              {/* Tabela de consumo */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Consumo e Custo Estimado</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Período</TableCell>
                          <TableCell align="right">Consumo (kWh)</TableCell>
                          <TableCell align="right">Custo (R$)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { label: 'Diário', kwh: resultado.kwhDia, custo: resultado.custoDia },
                          { label: 'Mensal', kwh: resultado.kwhMes, custo: resultado.custoMes },
                          { label: 'Anual', kwh: resultado.kwhAno, custo: resultado.custoAno },
                        ].map((r) => (
                          <TableRow key={r.label} hover>
                            <TableCell><Typography variant="body2" fontWeight={600}>{r.label}</Typography></TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{Number(r.kwh).toLocaleString('pt-BR')} kWh</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {formatCurrency(r.custo)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Comparação */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Comparação de Equipamentos</Typography>
                  <Alert severity="success" icon={<SavingsIcon />} sx={{ mb: 2 }}>
                    Ao trocar para um Inverter Premium, a economia anual estimada é de{' '}
                    <strong>{formatCurrency(economiaTotalInverter)}</strong>.
                  </Alert>
                  <Grid container spacing={1.5}>
                    {comparacao.map((c) => (
                      <Grid item xs={12} sm={4} key={c.nome}>
                        <Box sx={{
                          p: 2, borderRadius: 1.5, textAlign: 'center',
                          border: `2px solid ${c.cor}`, bgcolor: alpha(c.cor, 0.06),
                        }}>
                          <Typography variant="caption" fontWeight={600} sx={{ color: c.cor }}>
                            {c.nome}
                          </Typography>
                          <Typography variant="h5" fontWeight={700} sx={{ color: c.cor, my: 0.5 }}>
                            {formatCurrency(c.custoAno)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">custo anual</Typography>
                          {c.fator < 1 && (
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`${Math.round((1 - c.fator) * 100)}% mais econômico`}
                                size="small" color="success" icon={<TrendingDownIcon />}
                              />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Gráfico mensal */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Custo Mensal ao Longo do Ano</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Variação por sazonalidade — Convencional vs. Inverter Premium
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dadosMensais} barGap={3} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v.toFixed(0)}`} width={52} />
                      <RechartTooltip
                        formatter={(v) => [formatCurrency(v)]}
                        contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="convencional" name="Convencional" fill="#ef5350" radius={[4, 4, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="inverter" name="Inverter Premium" fill="#4caf50" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Projeção 5 anos */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Projeção de Economia — 5 Anos</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Custo acumulado incluindo investimento inicial do inverter (R$ 2.500)
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={projecao5Anos} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={52} />
                      <RechartTooltip
                        formatter={(v) => [formatCurrency(v)]}
                        labelFormatter={(l) => `Mês ${l}`}
                        contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="convencional" name="Convencional" stroke="#ef5350" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="inverter" name="Inverter Premium" stroke="#4caf50" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
