import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Divider, useTheme,
} from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { useStore } from '../../store';
import { formatCurrency } from '../../utils';

const fluxoMensal = [
  { mes: 'Jan', entradas: 18500, saidas: 12000 },
  { mes: 'Fev', entradas: 22000, saidas: 14500 },
  { mes: 'Mar', entradas: 19800, saidas: 11200 },
  { mes: 'Abr', entradas: 26500, saidas: 18000 },
  { mes: 'Mai', entradas: 24000, saidas: 15500 },
  { mes: 'Jun', entradas: 31000, saidas: 20000 },
];

const fluxoDiario = [
  { dia: '01/06', entradas: 2200, saidas: 800, saldo: 1400 },
  { dia: '02/06', entradas: 0, saidas: 2500, saldo: -1100 },
  { dia: '03/06', entradas: 4500, saidas: 0, saldo: 3400 },
  { dia: '04/06', entradas: 350, saidas: 1200, saldo: 2550 },
  { dia: '05/06', entradas: 1800, saidas: 0, saldo: 4350 },
];

export default function FluxoCaixa() {
  const { contasReceber, contasPagar } = useStore();
  const theme = useTheme();

  const totalEntradas = contasReceber.filter((c) => c.situacao === 'Recebido').reduce((s, c) => s + c.valor, 0);
  const totalSaidas = contasPagar.filter((c) => c.situacao === 'Pago').reduce((s, c) => s + c.valor, 0);
  const saldoAtual = totalEntradas - totalSaidas;
  const aReceber = contasReceber.filter((c) => c.situacao === 'Aberto').reduce((s, c) => s + c.valor, 0);
  const aPagar = contasPagar.filter((c) => c.situacao === 'Aberto').reduce((s, c) => s + c.valor, 0);

  return (
    <Box>
      <PageHeader title="Fluxo de Caixa" subtitle="Controle financeiro completo da empresa" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Saldo Atual', value: formatCurrency(saldoAtual), color: saldoAtual >= 0 ? 'success' : 'error' },
          { label: 'Total de Entradas', value: formatCurrency(totalEntradas), color: 'success' },
          { label: 'Total de Saídas', value: formatCurrency(totalSaidas), color: 'error' },
          { label: 'Saldo Projetado', value: formatCurrency(saldoAtual + aReceber - aPagar), color: 'primary' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card><CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h5" fontWeight={700} color={`${s.color}.main`}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Entradas × Saídas (Mensal)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={fluxoMensal} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={52} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="entradas" name="Entradas" stroke={theme.palette.success.main} fill={theme.palette.success.light} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="saidas" name="Saídas" stroke={theme.palette.error.main} fill={theme.palette.error.light} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Resumo Financeiro</Typography>
              <Box>
                {[
                  { label: 'Receita do Mês', value: formatCurrency(31000), color: 'success.main' },
                  { label: 'Receita do Ano', value: formatCurrency(142000), color: 'success.main' },
                  { label: 'Despesas do Mês', value: formatCurrency(20000), color: 'error.main' },
                  { label: 'Lucro Líquido', value: formatCurrency(11000), color: 'primary.main' },
                  { label: 'Margem Operacional', value: '35.5%', color: 'primary.main' },
                ].map((item, i) => (
                  <Box key={item.label}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25 }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={700} color={item.color}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Fluxo Diário — Junho/2024</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Entradas</TableCell>
                  <TableCell align="right">Saídas</TableCell>
                  <TableCell align="right">Saldo do Dia</TableCell>
                  <TableCell align="right">Saldo Acumulado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fluxoDiario.map((d, i) => {
                  const acumulado = fluxoDiario.slice(0, i + 1).reduce((s, x) => s + x.saldo, 0);
                  return (
                    <TableRow key={d.dia} hover>
                      <TableCell>{d.dia}</TableCell>
                      <TableCell align="right"><Typography color="success.main" fontWeight={500}>{d.entradas > 0 ? formatCurrency(d.entradas) : '—'}</Typography></TableCell>
                      <TableCell align="right"><Typography color="error.main" fontWeight={500}>{d.saidas > 0 ? formatCurrency(d.saidas) : '—'}</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={600} color={d.saldo >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(d.saldo)}</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={600} color={acumulado >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(acumulado)}</Typography></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
