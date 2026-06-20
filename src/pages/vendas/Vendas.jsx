import { Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils';

const MOCK_VENDAS = [
  { id: 1, numero: 'VD-2024-001', cliente: 'Empresa ABC Ltda', data: '2024-01-15', itens: 'Split 12000 BTUs LG + Instalação', total: 4500, status: 'Concluída' },
  { id: 2, numero: 'VD-2024-002', cliente: 'João Silva', data: '2024-01-18', itens: 'Manutenção Preventiva', total: 350, status: 'Concluída' },
  { id: 3, numero: 'VD-2024-003', cliente: 'Carlos Oliveira', data: '2024-01-22', itens: 'Split 9000 BTUs + Instalação', total: 2800, status: 'Pendente' },
];

export default function Vendas() {
  const totalMes = MOCK_VENDAS.filter((v) => v.status === 'Concluída').reduce((s, v) => s + v.total, 0);

  return (
    <Box>
      <PageHeader title="Vendas" subtitle={`Faturamento do mês: ${formatCurrency(totalMes)}`} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Vendas Realizadas', value: MOCK_VENDAS.filter((v) => v.status === 'Concluída').length, color: 'success' },
          { label: 'Pendentes', value: MOCK_VENDAS.filter((v) => v.status === 'Pendente').length, color: 'warning' },
          { label: 'Faturamento', value: formatCurrency(totalMes), color: 'primary' },
          { label: 'Ticket Médio', value: formatCurrency(totalMes / (MOCK_VENDAS.length || 1)), color: 'info' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" fontWeight={700} color={`${s.color}.main`}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
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
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Itens</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_VENDAS.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600} color="primary">{v.numero}</Typography></TableCell>
                    <TableCell>{v.cliente}</TableCell>
                    <TableCell>{formatDate(v.data)}</TableCell>
                    <TableCell>{v.itens}</TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(v.total)}</Typography></TableCell>
                    <TableCell><StatusChip status={v.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
