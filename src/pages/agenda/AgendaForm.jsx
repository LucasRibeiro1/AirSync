import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useStore } from '../../store';
import { tiposAtendimento } from '../../utils';

const statusOptions = ['Agendado', 'Confirmado', 'Em atendimento', 'Concluído', 'Cancelado'];

export default function AgendaForm({ open, onClose, initial }) {
  const { clientes, tecnicos, addAgendamento, updateAgendamento } = useStore();
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: initial || {
      clienteId: '', tipo: '', data: '', horario: '', tecnicoId: '',
      endereco: '', observacoes: '', status: 'Agendado',
    },
  });

  const clienteId = watch('clienteId');
  const cliente = clientes.find((c) => c.id === Number(clienteId));

  const onSubmit = (data) => {
    const tecnico = tecnicos.find((t) => t.id === Number(data.tecnicoId));
    const clienteObj = clientes.find((c) => c.id === Number(data.clienteId));
    const payload = {
      ...data,
      clienteId: Number(data.clienteId),
      tecnicoId: Number(data.tecnicoId),
      clienteNome: clienteObj?.nome || '',
      tecnicoNome: tecnico?.nome || '',
    };
    if (initial?.id) {
      updateAgendamento(initial.id, payload);
    } else {
      addAgendamento(payload);
    }
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="clienteId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.clienteId}>
                    <InputLabel>Cliente *</InputLabel>
                    <Select {...field} label="Cliente *">
                      {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {cliente && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Telefone" value={cliente.telefone} disabled />
              </Grid>
            )}
            <Grid item xs={12} sm={cliente ? 6 : 12}>
              <Controller
                name="tipo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tipo}>
                    <InputLabel>Tipo de Atendimento *</InputLabel>
                    <Select {...field} label="Tipo de Atendimento *">
                      {tiposAtendimento.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Data *" type="date" InputLabelProps={{ shrink: true }}
                {...register('data', { required: true })} error={!!errors.data} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Horário *" type="time" InputLabelProps={{ shrink: true }}
                {...register('horario', { required: true })} error={!!errors.horario} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="tecnicoId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Técnico Responsável</InputLabel>
                    <Select {...field} label="Técnico Responsável">
                      <MenuItem value="">Nenhum</MenuItem>
                      {tecnicos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" {...register('endereco')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observações" multiline rows={3} {...register('observacoes')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
