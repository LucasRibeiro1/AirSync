import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome / Razão Social *" {...register('nome', { required: true })} error={!!errors.nome} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="CPF / CNPJ" {...register('cpfCnpj')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Responsável" {...register('responsavel')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefone" {...register('telefone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="E-mail" type="email" {...register('email')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" {...register('endereco')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Cidade" {...register('cidade')} />
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
