import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
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
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Controller
              name="clienteId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.clienteId} sx={{ gridColumn: 'span 2' }}>
                  <InputLabel>Cliente *</InputLabel>
                  <Select {...field} label="Cliente *">
                    {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            {cliente && (
              <TextField fullWidth size="medium" label="Telefone" value={cliente.telefone} disabled />
            )}
            <Controller
              name="tipo"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.tipo} sx={!cliente ? { gridColumn: 'span 2' } : {}}>
                  <InputLabel>Tipo de Atendimento *</InputLabel>
                  <Select {...field} label="Tipo de Atendimento *">
                    {tiposAtendimento.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <TextField fullWidth size="medium" label="Data *" type="date" InputLabelProps={{ shrink: true }}
              {...register('data', { required: true })} error={!!errors.data} />
            <TextField fullWidth size="medium" label="Horário *" type="time" InputLabelProps={{ shrink: true }}
              {...register('horario', { required: true })} error={!!errors.horario} />
            <Controller
              name="tecnicoId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium">
                  <InputLabel>Técnico Responsável</InputLabel>
                  <Select {...field} label="Técnico Responsável">
                    <MenuItem value="">Nenhum</MenuItem>
                    {tecnicos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium">
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <TextField fullWidth size="medium" label="Endereço" {...register('endereco')} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="Observações" multiline rows={3} {...register('observacoes')} sx={{ gridColumn: 'span 2' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
