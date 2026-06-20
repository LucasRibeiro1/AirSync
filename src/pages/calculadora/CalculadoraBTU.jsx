import { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, MenuItem,
  Button, Divider, Slider, Chip, Stack, Alert, useTheme, alpha,
  LinearProgress, Tooltip, Paper,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PeopleIcon from '@mui/icons-material/People';
import ComputerIcon from '@mui/icons-material/Computer';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import HomeIcon from '@mui/icons-material/Home';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHeader from '../../components/common/PageHeader';

const TIPOS_AMBIENTE = [
  { label: 'Residencial', valor: 1.0, icon: '🏠' },
  { label: 'Escritório', valor: 1.1, icon: '🏢' },
  { label: 'Loja', valor: 1.2, icon: '🛍️' },
  { label: 'Restaurante', valor: 1.4, icon: '🍽️' },
  { label: 'Clínica', valor: 1.2, icon: '🏥' },
  { label: 'Academia', valor: 1.3, icon: '🏋️' },
  { label: 'Outros', valor: 1.1, icon: '📦' },
];

const EXPOSICAO_SOLAR = [
  { label: 'Baixa', descricao: 'Sombra, face Norte/Sul', mult: 1.0, color: 'success' },
  { label: 'Média', descricao: 'Exposição parcial', mult: 1.15, color: 'warning' },
  { label: 'Alta', descricao: 'Sol direto, vidros grandes', mult: 1.3, color: 'error' },
];

const BTUS_PADRAO = [7000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

const EQUIPAMENTOS_SUGERIDOS = {
  9000:  [{ marca: 'Samsung', modelo: 'WindFree Essential 9000', preco: 1590 }, { marca: 'LG', modelo: 'Dual Inverter 9000', preco: 1490 }],
  12000: [{ marca: 'Samsung', modelo: 'WindFree Essential 12000', preco: 1890 }, { marca: 'LG', modelo: 'Dual Inverter 12000', preco: 1790 }],
  18000: [{ marca: 'Daikin', modelo: 'Inverter 18000', preco: 2490 }, { marca: 'Samsung', modelo: 'WindFree 18000', preco: 2390 }],
  24000: [{ marca: 'Daikin', modelo: 'Sky Air 24000', preco: 3290 }, { marca: 'LG', modelo: 'Artcool 24000', preco: 3190 }],
  30000: [{ marca: 'Daikin', modelo: 'Sky Air 30000', preco: 4290 }, { marca: 'Midea', modelo: 'Carrier 30000', preco: 3990 }],
  36000: [{ marca: 'Daikin', modelo: 'Sky Air 36000', preco: 5490 }, { marca: 'LG', modelo: 'Multi V 36000', preco: 5290 }],
};

const calcularBTU = (form) => {
  const area = (Number(form.comprimento) || 0) * (Number(form.largura) || 0);
  const altura = Number(form.altura) || 2.7;
  const alturaMultiplier = altura > 3 ? 1.15 : altura > 2.5 ? 1.0 : 0.9;
  const pessoas = Number(form.pessoas) || 0;
  const computadores = Number(form.computadores) || 0;
  const eletronicos = Number(form.eletronicos) || 0;
  const solar = EXPOSICAO_SOLAR.find((e) => e.label === form.exposicaoSolar)?.mult || 1.0;
  const ambiente = TIPOS_AMBIENTE.find((t) => t.label === form.tipoAmbiente)?.valor || 1.0;

  const baseBTU = area * 600 * alturaMultiplier;
  const pessoasBTU = pessoas * 600;
  const computadoresBTU = computadores * 600;
  const eletronicosBTU = eletronicos * 300;
  const totalBruto = (baseBTU + pessoasBTU + computadoresBTU + eletronicosBTU) * solar * ambiente;

  return {
    area: area.toFixed(1),
    volume: (area * altura).toFixed(1),
    totalBruto: Math.round(totalBruto),
    minimo: Math.round(totalBruto * 0.85),
    ideal: Math.round(totalBruto),
    maximo: Math.round(totalBruto * 1.15),
    breakdown: { baseBTU: Math.round(baseBTU), pessoasBTU: Math.round(pessoasBTU), computadoresBTU: Math.round(computadoresBTU), eletronicosBTU: Math.round(eletronicosBTU) },
  };
};

const proximoBTUPadrao = (btu) => {
  for (const b of BTUS_PADRAO) if (b >= btu) return b;
  return BTUS_PADRAO[BTUS_PADRAO.length - 1];
};

const EMPTY = {
  comprimento: '', largura: '', altura: '2.7',
  pessoas: '1', computadores: '0', eletronicos: '0',
  exposicaoSolar: 'Média', tipoAmbiente: 'Residencial',
};

export default function CalculadoraBTU() {
  const theme = useTheme();
  const [form, setForm] = useState(EMPTY);
  const [calculado, setCalculado] = useState(false);

  const resultado = useMemo(() => {
    if (!form.comprimento || !form.largura) return null;
    return calcularBTU(form);
  }, [form]);

  const btuPadrao = resultado ? proximoBTUPadrao(resultado.ideal) : null;
  const qtdUnidades = btuPadrao ? Math.ceil(resultado.ideal / btuPadrao) : 1;
  const equipamentosRecomendados = btuPadrao ? (EQUIPAMENTOS_SUGERIDOS[btuPadrao] || EQUIPAMENTOS_SUGERIDOS[36000]) : [];

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCalc = () => setCalculado(true);
  const handleReset = () => { setForm(EMPTY); setCalculado(false); };

  const pct = (v, min, max) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

  return (
    <Box>
      <PageHeader
        title="Calculadora de BTUs"
        subtitle="Dimensionamento inteligente para ar-condicionado"
        breadcrumbs={['Ferramentas', 'Calculadora BTU']}
      />

      <Grid container spacing={2.5}>
        {/* Formulário */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2.5}>
            {/* Ambiente */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HomeIcon color="primary" />
                  <Typography variant="h6">Dimensões do Ambiente</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="Comprimento (m)" type="number"
                      value={form.comprimento} onChange={set('comprimento')}
                      inputProps={{ min: 0, step: 0.1 }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="Largura (m)" type="number"
                      value={form.largura} onChange={set('largura')}
                      inputProps={{ min: 0, step: 0.1 }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="Altura (m)" type="number"
                      value={form.altura} onChange={set('altura')}
                      inputProps={{ min: 1.8, max: 6, step: 0.1 }} />
                  </Grid>
                </Grid>
                {resultado && (
                  <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                    <Typography variant="body2" color="text.secondary">
                      Área calculada: <strong>{resultado.area} m²</strong> · Volume: <strong>{resultado.volume} m³</strong>
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Ocupação */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6">Ocupação</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="Pessoas" type="number"
                      value={form.pessoas} onChange={set('pessoas')}
                      inputProps={{ min: 0, max: 100 }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="Computadores" type="number"
                      value={form.computadores} onChange={set('computadores')}
                      inputProps={{ min: 0 }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="Eletrônicos" type="number"
                      value={form.eletronicos} onChange={set('eletronicos')}
                      inputProps={{ min: 0 }}
                      helperText="TVs, servidores…" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Exposição Solar */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WbSunnyIcon color="primary" />
                  <Typography variant="h6">Exposição Solar</Typography>
                </Box>
                <Stack spacing={1}>
                  {EXPOSICAO_SOLAR.map((e) => (
                    <Paper
                      key={e.label}
                      variant="outlined"
                      onClick={() => setForm((f) => ({ ...f, exposicaoSolar: e.label }))}
                      sx={{
                        p: 1.5, cursor: 'pointer', borderRadius: 1.5,
                        borderColor: form.exposicaoSolar === e.label ? `${e.color}.main` : 'divider',
                        bgcolor: form.exposicaoSolar === e.label ? alpha(theme.palette[e.color]?.main || theme.palette.primary.main, 0.06) : 'transparent',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: `${e.color}.main` },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={form.exposicaoSolar === e.label ? 600 : 400}>
                            {e.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{e.descricao}</Typography>
                        </Box>
                        <Chip label={`+${Math.round((e.mult - 1) * 100)}%`} size="small" color={e.color} />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Tipo de Ambiente */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Tipo de Ambiente</Typography>
                <Grid container spacing={1}>
                  {TIPOS_AMBIENTE.map((t) => (
                    <Grid item xs={6} key={t.label}>
                      <Paper
                        variant="outlined"
                        onClick={() => setForm((f) => ({ ...f, tipoAmbiente: t.label }))}
                        sx={{
                          p: 1.25, cursor: 'pointer', borderRadius: 1.5, textAlign: 'center',
                          borderColor: form.tipoAmbiente === t.label ? 'primary.main' : 'divider',
                          bgcolor: form.tipoAmbiente === t.label ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Typography sx={{ fontSize: 20 }}>{t.icon}</Typography>
                        <Typography variant="caption" fontWeight={form.tipoAmbiente === t.label ? 600 : 400}>
                          {t.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="contained" size="large" startIcon={<CalculateIcon />}
                onClick={handleCalc} disabled={!form.comprimento || !form.largura}>
                Calcular BTUs
              </Button>
              <Button variant="outlined" size="large" startIcon={<RestartAltIcon />} onClick={handleReset}>
                Limpar
              </Button>
            </Box>
          </Stack>
        </Grid>

        {/* Resultado */}
        <Grid item xs={12} md={7}>
          {!calculado || !resultado ? (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center', p: 6 }}>
                <AcUnitIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Preencha os dados do ambiente
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  O resultado com a recomendação de BTUs aparecerá aqui
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2.5}>
              {/* Resultado Principal */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Resultado do Dimensionamento</Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Faixa de BTUs */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mínimo: <strong>{resultado.minimo.toLocaleString('pt-BR')} BTUs</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Máximo: <strong>{resultado.maximo.toLocaleString('pt-BR')} BTUs</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ position: 'relative', mb: 1 }}>
                      <Box sx={{
                        height: 20, borderRadius: 10,
                        background: `linear-gradient(90deg, ${theme.palette.warning.light} 0%, ${theme.palette.success.main} 50%, ${theme.palette.error.light} 100%)`,
                        opacity: 0.3,
                      }} />
                      <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 4, height: 28, borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                      }} />
                    </Box>

                    <Box sx={{
                      p: 2.5, borderRadius: 2, textAlign: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      border: `2px solid ${theme.palette.success.main}`,
                    }}>
                      <Typography variant="caption" color="success.main" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                        BTU Recomendado
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="success.main">
                        {resultado.ideal.toLocaleString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">BTUs/h</Typography>
                    </Box>
                  </Box>

                  {/* Faixas */}
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[
                      { label: 'Faixa Mínima', value: resultado.minimo, color: 'warning', desc: 'Condições ideais' },
                      { label: 'Faixa Ideal', value: resultado.ideal, color: 'success', desc: 'Recomendado' },
                      { label: 'Faixa Máxima', value: resultado.maximo, color: 'info', desc: 'Ambientes críticos' },
                    ].map((f) => (
                      <Grid item xs={4} key={f.label}>
                        <Box sx={{ p: 1.5, borderRadius: 1.5, textAlign: 'center', bgcolor: alpha(theme.palette[f.color].main, 0.08) }}>
                          <Typography variant="caption" color={`${f.color}.main`} fontWeight={600}>{f.label}</Typography>
                          <Typography variant="h6" fontWeight={700} color={`${f.color}.main`}>
                            {f.value.toLocaleString('pt-BR')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Breakdown */}
                  <Typography variant="subtitle2" gutterBottom>Composição do cálculo</Typography>
                  {[
                    { label: `Área base (${resultado.area} m²)`, value: resultado.breakdown.baseBTU },
                    { label: `Pessoas (${form.pessoas})`, value: resultado.breakdown.pessoasBTU },
                    { label: `Computadores (${form.computadores})`, value: resultado.breakdown.computadoresBTU },
                    { label: `Eletrônicos (${form.eletronicos})`, value: resultado.breakdown.eletronicosBTU },
                  ].filter((r) => r.value > 0).map((r) => {
                    const pctVal = Math.round((r.value / resultado.totalBruto) * 100);
                    return (
                      <Box key={r.label} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{r.label}</Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {r.value.toLocaleString('pt-BR')} BTU ({pctVal}%)
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pctVal}
                          sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Sugestão de Equipamentos */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Equipamentos Recomendados</Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Capacidade padrão recomendada: <strong>{btuPadrao?.toLocaleString('pt-BR')} BTUs</strong>
                    {qtdUnidades > 1 && ` · ${qtdUnidades} unidades para cobrir a área`}
                  </Alert>
                  <Stack spacing={1.5}>
                    {equipamentosRecomendados.map((eq, i) => (
                      <Box key={i} sx={{
                        p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AcUnitIcon fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight={600}>{eq.marca} {eq.modelo}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {btuPadrao?.toLocaleString('pt-BR')} BTUs · {qtdUnidades > 1 ? `${qtdUnidades} unidades` : '1 unidade'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {(eq.preco * qtdUnidades).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {eq.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<CheckCircleIcon />}>
                    Gerar Orçamento com estes Equipamentos
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
