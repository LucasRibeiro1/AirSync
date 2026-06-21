import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment,
  Avatar, Chip, Dialog, DialogTitle, DialogContent, Tabs, Tab, List,
  ListItem, ListItemText, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ClienteForm from './ClienteForm';
import { useStore } from '../../store';
import { formatDate, formatCurrency } from '../../utils';

function ClienteDetail({ open, onClose, cliente }) {
  const { agendamentos, ordens, contasReceber } = useStore();
  const [tab, setTab] = useState(0);
  if (!cliente) return null;

  const clienteAg = agendamentos.filter((a) => a.clienteId === cliente.id);
  const clienteOS = ordens.filter((o) => o.clienteId === cliente.id);
  const clienteCR = contasReceber.filter((c) => c.clienteNome === cliente.nome);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{cliente.nome.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h6">{cliente.nome}</Typography>
            <Typography variant="body2" color="text.secondary">{cliente.cpfCnpj}</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" color="action" /><Typography variant="body2">{cliente.telefone || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" color="action" /><Typography variant="body2">{cliente.email || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="action" /><Typography variant="body2">{cliente.endereco || '-'}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label={`Agendamentos (${clienteAg.length})`} />
          <Tab label={`Ordens de Serviço (${clienteOS.length})`} />
          <Tab label={`Financeiro (${clienteCR.length})`} />
        </Tabs>

        {tab === 0 && (
          <List dense>
            {clienteAg.length === 0 && <Typography color="text.secondary">Nenhum agendamento.</Typography>}
            {clienteAg.map((a) => (
              <ListItem key={a.id} divider>
                <ListItemText primary={a.tipo} secondary={`${formatDate(a.data)} ${a.horario} — ${a.tecnicoNome}`}
                  primaryTypographyProps={{ fontWeight: 500 }} />
                <StatusChip status={a.status} />
              </ListItem>
            ))}
          </List>
        )}

        {tab === 1 && (
          <List dense>
            {clienteOS.length === 0 && <Typography color="text.secondary">Nenhuma OS.</Typography>}
            {clienteOS.map((o) => (
              <ListItem key={o.id} divider>
                <ListItemText primary={`${o.numero} — ${o.tipo}`} secondary={`${o.equipamento || ''} ${o.marca || ''}`}
                  primaryTypographyProps={{ fontWeight: 500 }} />
                <StatusChip status={o.status} />
              </ListItem>
            ))}
          </List>
        )}

        {tab === 2 && (
          <List dense>
            {clienteCR.length === 0 && <Typography color="text.secondary">Nenhum lançamento financeiro.</Typography>}
            {clienteCR.map((c) => (
              <ListItem key={c.id} divider>
                <ListItemText primary={c.documento} secondary={`Vence: ${formatDate(c.vencimento)}`}
                  primaryTypographyProps={{ fontWeight: 500 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={600} color="success.main">{formatCurrency(c.valor)}</Typography>
                  <StatusChip status={c.situacao} />
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Clientes() {
  const { clientes, deleteCliente } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    clientes.filter((c) =>
      !search || c.nome?.toLowerCase().includes(search.toLowerCase()) ||
      c.cpfCnpj?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
    ), [clientes, search]
  );

  const handleEdit = (c) => { setEditing(c); setFormOpen(true); };
  const handleView = (c) => { setViewing(c); setDetailOpen(true); };
  const handleDelete = () => { deleteCliente(deleteId); setDeleteId(null); };

  return (
    <Box>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} clientes cadastrados`}
        action={() => { setEditing(null); setFormOpen(true); }}
        actionLabel="Novo Cliente"
      />

      <Card>
        <CardContent>
          <TextField
            fullWidth size="medium" placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>CPF / CNPJ</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Cidade</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>{c.nome.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{c.nome}</Typography>
                          {c.responsavel && c.responsavel !== c.nome && (
                            <Typography variant="caption" color="text.secondary">{c.responsavel}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{c.cpfCnpj || '-'}</TableCell>
                    <TableCell>{c.telefone || '-'}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>{c.cidade || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleView(c)}><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleEdit(c)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" py={3}>Nenhum cliente encontrado</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ClienteForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} />
      <ClienteDetail open={detailOpen} onClose={() => { setDetailOpen(false); setViewing(null); }} cliente={viewing} />
      <ConfirmDialog open={!!deleteId} title="Excluir Cliente" message="Deseja excluir este cliente?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
    </Box>
  );
}
