export const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export const formatDate = (d) => {
  if (!d) return '-';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export const statusColor = (status) => {
  const map = {
    Agendado: 'info',
    Confirmado: 'primary',
    'Em atendimento': 'warning',
    'Em Andamento': 'warning',
    Concluído: 'success',
    Concluída: 'success',
    Cancelado: 'error',
    Cancelada: 'error',
    Aberto: 'info',
    Aprovado: 'success',
    Recebido: 'success',
    Pago: 'success',
    Vencido: 'error',
    Pendente: 'warning',
    Recusado: 'error',
  };
  return map[status] || 'default';
};

export const tiposAtendimento = [
  'Instalação',
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Higienização',
  'Visita Técnica',
  'Orçamento',
];

export const perfis = ['Administrador', 'Comercial', 'Financeiro', 'Técnico', 'Gestor'];

export const checklistInstalacao = [
  'Tubulação instalada',
  'Isolamento aplicado',
  'Teste de pressão realizado',
  'Vácuo realizado',
  'Equipamento funcionando',
  'Fixação da condensadora',
  'Fixação da evaporadora',
  'Drenagem verificada',
];

export const checklistManutencao = [
  'Limpeza dos filtros',
  'Limpeza da evaporadora',
  'Limpeza da condensadora',
  'Verificação elétrica',
  'Verificação de gás refrigerante',
  'Verificação da drenagem',
  'Verificação do capacitor',
  'Teste de funcionamento',
];
