import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography,
  Divider, Box, Chip, List, ListItem, ListItemIcon, ListItemText, Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PrintIcon from '@mui/icons-material/Print';
import StatusChip from '../../components/common/StatusChip';
import { formatDate } from '../../utils';

function Row({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>{label}:</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Box>
  );
}

export default function OSDetail({ open, onClose, os }) {
  if (!os) return null;
  const checklist = os.checklist || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{os.numero}</Typography>
          <StatusChip status={os.status} size="medium" />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Informações Gerais</Typography>
            <Row label="Cliente" value={os.clienteNome} />
            <Row label="Tipo" value={os.tipo} />
            <Row label="Técnico" value={os.tecnicoNome} />
            <Row label="Data de Abertura" value={formatDate(os.dataAbertura)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Equipamento</Typography>
            <Row label="Equipamento" value={os.equipamento} />
            <Row label="Marca" value={os.marca} />
            <Row label="Modelo" value={os.modelo} />
            <Row label="BTUs" value={os.btus ? `${os.btus} BTUs` : '-'} />
            <Row label="Local" value={os.localInstalacao} />
          </Grid>

          {Object.keys(checklist).length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Checklist</Typography>
              <Grid container spacing={1}>
                {Object.entries(checklist).map(([item, done]) => (
                  <Grid item xs={12} sm={6} key={item}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {done
                        ? <CheckCircleIcon fontSize="small" color="success" />
                        : <RadioButtonUncheckedIcon fontSize="small" color="disabled" />}
                      <Typography variant="body2" color={done ? 'text.primary' : 'text.secondary'}>{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="subtitle2" color="primary" gutterBottom>Relatório Técnico</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Problema Encontrado</Typography>
                  <Typography variant="body2">{os.problema || '—'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Serviço Executado</Typography>
                  <Typography variant="body2">{os.servicoExecutado || '—'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Row label="Peças Utilizadas" value={os.pecasUtilizadas} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Row label="Materiais" value={os.materiais} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Row label="Tempo Gasto" value={os.tempoGasto} />
              </Grid>
              {os.observacoes && (
                <Grid item xs={12}>
                  <Row label="Observações" value={os.observacoes} />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button startIcon={<PrintIcon />} onClick={() => window.print()}>Imprimir</Button>
        <Button onClick={onClose} variant="contained">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
