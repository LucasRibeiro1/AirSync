import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';

export default function ClienteForm({ open, onClose, initial }) {
  const { addCliente, updateCliente } = useStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { nome: '', cpfCnpj: '', telefone: '', email: '', endereco: '', cidade: '', responsavel: '' },
  });

  const onSubmit = (data) => {
    if (initial?.id) updateCliente(initial.id, data);
    else addCliente(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField fullWidth size="medium" label="Nome / Razão Social *" {...register('nome', { required: true })} error={!!errors.nome} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="CPF / CNPJ" {...register('cpfCnpj')} />
            <TextField fullWidth size="medium" label="Responsável" {...register('responsavel')} />
            <TextField fullWidth size="medium" label="Telefone" {...register('telefone')} />
            <TextField fullWidth size="medium" label="E-mail" type="email" {...register('email')} />
            <TextField fullWidth size="medium" label="Endereço" {...register('endereco')} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="Cidade" {...register('cidade')} />
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
