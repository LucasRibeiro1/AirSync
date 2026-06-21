import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, FormControl, InputLabel, Select, Typography,
  Checkbox, FormControlLabel, Divider, Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useStore } from '../../store';
import { tiposAtendimento, checklistInstalacao, checklistManutencao } from '../../utils';
import { useState } from 'react';

const statusOptions = ['Aberta', 'Em Andamento', 'Aguardando Peças', 'Concluída', 'Cancelada'];
const marcas = ['Samsung', 'LG', 'Daikin', 'Midea', 'Gree', 'Springer', 'Elgin', 'Carrier', 'Hitachi', 'Fujitsu'];
const btusOptions = ['7000', '9000', '12000', '18000', '24000', '30000', '36000', '48000', '60000'];

export default function OSForm({ open, onClose, initial }) {
  const { clientes, tecnicos, addOrdem, updateOrdem } = useStore();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: initial || {
      clienteId: '', equipamento: '', marca: '', modelo: '', btus: '',
      localInstalacao: '', tipo: '', status: 'Aberta', tecnicoId: '',
      problema: '', servicoExecutado: '', pecasUtilizadas: '', materiais: '',
      tempoGasto: '', observacoes: '',
    },
  });
  const [checklist, setChecklist] = useState(initial?.checklist || {});

  const tipo = watch('tipo');
  const checklistItems = tipo === 'Instalação' ? checklistInstalacao : checklistManutencao;

  const toggleCheck = (item) => setChecklist((p) => ({ ...p, [item]: !p[item] }));

  const onSubmit = (data) => {
    const clienteObj = clientes.find((c) => c.id === Number(data.clienteId));
    const tecnico = tecnicos.find((t) => t.id === Number(data.tecnicoId));
    const payload = {
      ...data,
      clienteId: Number(data.clienteId),
      tecnicoId: Number(data.tecnicoId),
      clienteNome: clienteObj?.nome || '',
      tecnicoNome: tecnico?.nome || '',
      checklist,
    };
    if (initial?.id) {
      updateOrdem(initial.id, payload);
    } else {
      addOrdem(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial?.id ? `Editar OS — ${initial.numero}` : 'Nova Ordem de Serviço'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="primary" gutterBottom>Informações Gerais</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Controller
              name="clienteId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.clienteId}>
                  <InputLabel>Cliente *</InputLabel>
                  <Select {...field} label="Cliente *">
                    {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="tecnicoId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium">
                  <InputLabel>Técnico</InputLabel>
                  <Select {...field} label="Técnico">
                    <MenuItem value="">Nenhum</MenuItem>
                    {tecnicos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="tipo"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.tipo}>
                  <InputLabel>Tipo de Serviço *</InputLabel>
                  <Select {...field} label="Tipo de Serviço *">
                    {tiposAtendimento.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="primary" gutterBottom>Dados do Equipamento</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
            <TextField fullWidth size="medium" label="Equipamento" {...register('equipamento')} />
            <Controller
              name="marca"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium">
                  <InputLabel>Marca</InputLabel>
                  <Select {...field} label="Marca">
                    {marcas.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <TextField fullWidth size="medium" label="Modelo" {...register('modelo')} />
            <Controller
              name="btus"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="medium">
                  <InputLabel>BTUs</InputLabel>
                  <Select {...field} label="BTUs">
                    {btusOptions.map((b) => <MenuItem key={b} value={b}>{b} BTUs</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <TextField fullWidth size="medium" label="Local de Instalação" {...register('localInstalacao')}
              sx={{ gridColumn: 'span 2' }} />
          </Box>

          {tipo && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Checklist Técnico</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 2 }}>
                {checklistItems.map((item) => (
                  <FormControlLabel
                    key={item}
                    control={<Checkbox checked={!!checklist[item]} onChange={() => toggleCheck(item)} size="small" />}
                    label={<Typography variant="body2">{item}</Typography>}
                  />
                ))}
              </Box>
            </>
          )}

          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="primary" gutterBottom>Relatório Técnico</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField fullWidth size="medium" label="Problema Encontrado" multiline rows={2}
              {...register('problema')} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="Serviço Executado" multiline rows={2}
              {...register('servicoExecutado')} sx={{ gridColumn: 'span 2' }} />
            <TextField fullWidth size="medium" label="Peças Utilizadas" {...register('pecasUtilizadas')} />
            <TextField fullWidth size="medium" label="Materiais Utilizados" {...register('materiais')} />
            <TextField fullWidth size="medium" label="Tempo Gasto" placeholder="Ex: 2h30min" {...register('tempoGasto')} />
            <TextField fullWidth size="medium" label="Observações Técnicas" multiline rows={2}
              {...register('observacoes')} sx={{ gridColumn: 'span 2' }} />
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
