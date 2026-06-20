import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const mockClientes = [
  { id: 1, nome: 'João Silva', cpfCnpj: '123.456.789-00', telefone: '(11) 99999-1111', email: 'joao@email.com', endereco: 'Rua das Flores, 123', cidade: 'São Paulo', responsavel: 'João Silva', equipamentos: [] },
  { id: 2, nome: 'Empresa ABC Ltda', cpfCnpj: '12.345.678/0001-00', telefone: '(11) 3333-4444', email: 'contato@abc.com', endereco: 'Av. Paulista, 1000', cidade: 'São Paulo', responsavel: 'Maria Santos', equipamentos: [] },
  { id: 3, nome: 'Carlos Oliveira', cpfCnpj: '987.654.321-00', telefone: '(11) 88888-2222', email: 'carlos@email.com', endereco: 'Rua do Comércio, 45', cidade: 'São Paulo', responsavel: 'Carlos Oliveira', equipamentos: [] },
];

const mockTecnicos = [
  { id: 1, nome: 'André Técnico', especialidade: 'Instalação e Manutenção' },
  { id: 2, nome: 'Bruno Técnico', especialidade: 'Manutenção Preventiva' },
  { id: 3, nome: 'Carlos Técnico', especialidade: 'Instalação' },
];

const mockAgendamentos = [
  { id: 1, clienteId: 1, clienteNome: 'João Silva', tipo: 'Manutenção Preventiva', data: new Date().toISOString().split('T')[0], horario: '09:00', tecnicoId: 1, tecnicoNome: 'André Técnico', status: 'Agendado', endereco: 'Rua das Flores, 123', observacoes: '' },
  { id: 2, clienteId: 2, clienteNome: 'Empresa ABC Ltda', tipo: 'Instalação', data: new Date().toISOString().split('T')[0], horario: '14:00', tecnicoId: 2, tecnicoNome: 'Bruno Técnico', status: 'Confirmado', endereco: 'Av. Paulista, 1000', observacoes: '' },
  { id: 3, clienteId: 3, clienteNome: 'Carlos Oliveira', tipo: 'Manutenção Corretiva', data: new Date(Date.now() + 86400000).toISOString().split('T')[0], horario: '10:00', tecnicoId: 1, tecnicoNome: 'André Técnico', status: 'Agendado', endereco: 'Rua do Comércio, 45', observacoes: '' },
];

const mockOS = [
  { id: 1, numero: 'OS-2024-001', clienteId: 1, clienteNome: 'João Silva', equipamento: 'Split 12000 BTUs', marca: 'Samsung', modelo: 'WindFree', btus: '12000', localInstalacao: 'Sala', tipo: 'Manutenção Preventiva', status: 'Concluída', dataAbertura: '2024-01-15', tecnicoNome: 'André Técnico', problema: 'Manutenção de rotina', servicoExecutado: 'Limpeza completa', pecasUtilizadas: 'Filtro', materiais: '', tempoGasto: '2h', observacoes: '' },
  { id: 2, numero: 'OS-2024-002', clienteId: 2, clienteNome: 'Empresa ABC Ltda', equipamento: 'Cassete 24000 BTUs', marca: 'LG', modelo: 'Multi V', btus: '24000', localInstalacao: 'Escritório', tipo: 'Instalação', status: 'Em Andamento', dataAbertura: new Date().toISOString().split('T')[0], tecnicoNome: 'Bruno Técnico', problema: '', servicoExecutado: '', pecasUtilizadas: '', materiais: 'Tubulação, suporte', tempoGasto: '', observacoes: '' },
];

const mockFornecedores = [
  { id: 1, razaoSocial: 'Distribuidora Clima Total', nomeFantasia: 'Clima Total', cnpj: '11.222.333/0001-44', telefone: '(11) 2222-3333', email: 'vendas@climatotal.com' },
  { id: 2, razaoSocial: 'Peças & Cia Ltda', nomeFantasia: 'Peças & Cia', cnpj: '44.555.666/0001-77', telefone: '(11) 4444-5555', email: 'compras@pecasecia.com' },
];

const mockProdutos = [
  { id: 1, nome: 'Split 9000 BTUs Samsung', categoria: 'Equipamento', unidade: 'un', quantidade: 5, preco: 1200.00 },
  { id: 2, nome: 'Split 12000 BTUs LG', categoria: 'Equipamento', unidade: 'un', quantidade: 8, preco: 1450.00 },
  { id: 3, nome: 'Tubo de Cobre 1/4"', categoria: 'Material', unidade: 'm', quantidade: 200, preco: 12.50 },
  { id: 4, nome: 'Gás R410A', categoria: 'Material', unidade: 'kg', quantidade: 30, preco: 85.00 },
  { id: 5, nome: 'Suporte para Condensadora', categoria: 'Material', unidade: 'un', quantidade: 20, preco: 45.00 },
];

const mockContasReceber = [
  { id: 1, clienteNome: 'João Silva', documento: 'OS-2024-001', vencimento: '2024-02-15', valor: 350.00, situacao: 'Recebido' },
  { id: 2, clienteNome: 'Empresa ABC Ltda', documento: 'VD-2024-010', vencimento: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], valor: 4500.00, situacao: 'Aberto' },
  { id: 3, clienteNome: 'Carlos Oliveira', documento: 'OS-2024-015', vencimento: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], valor: 280.00, situacao: 'Vencido' },
];

const mockContasPagar = [
  { id: 1, fornecedorNome: 'Clima Total', categoria: 'Fornecedor', vencimento: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], valor: 8500.00, situacao: 'Aberto' },
  { id: 2, fornecedorNome: 'Aluguel', categoria: 'Despesa Fixa', vencimento: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], valor: 2500.00, situacao: 'Aberto' },
  { id: 3, fornecedorNome: 'Peças & Cia', categoria: 'Fornecedor', vencimento: '2024-01-30', valor: 1200.00, situacao: 'Pago' },
];

// ── PMOC ──────────────────────────────────────────────────────────────────────
const _d = (days) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

const mockContratosPMOC = [
  {
    id: 1, numero: 'PMOC-2024-001', clienteId: 1, clienteNome: 'João Silva',
    unidade: 'Residência Principal', responsavel: 'João Silva',
    dataInicio: '2024-01-01', dataVencimento: '2024-12-31',
    frequencia: 'Mensal', status: 'Ativo', valor: 350.00,
    observacoes: 'Contrato anual de manutenção preventiva',
  },
  {
    id: 2, numero: 'PMOC-2024-002', clienteId: 2, clienteNome: 'Empresa ABC Ltda',
    unidade: 'Sede Administrativa', responsavel: 'Maria Santos',
    dataInicio: '2024-01-15', dataVencimento: _d(25),
    frequencia: 'Trimestral', status: 'Ativo', valor: 1200.00,
    observacoes: '',
  },
  {
    id: 3, numero: 'PMOC-2023-015', clienteId: 3, clienteNome: 'Carlos Oliveira',
    unidade: 'Loja Centro', responsavel: 'Carlos Oliveira',
    dataInicio: '2023-06-01', dataVencimento: '2024-06-01',
    frequencia: 'Semestral', status: 'Vencido', valor: 680.00,
    observacoes: '',
  },
];

const mockEquipamentosPMOC = [
  {
    id: 1, contratoPMOCId: 1, clienteId: 1, clienteNome: 'João Silva',
    tipo: 'Split Hi-Wall', marca: 'Samsung', modelo: 'WindFree 12000',
    capacidadeBTU: '12000', numeroSerie: 'SN-2024-0001',
    localInstalacao: 'Sala de Estar', dataInstalacao: '2023-06-15',
    situacao: 'Operacional',
  },
  {
    id: 2, contratoPMOCId: 1, clienteId: 1, clienteNome: 'João Silva',
    tipo: 'Split Hi-Wall', marca: 'LG', modelo: 'Dual Inverter 9000',
    capacidadeBTU: '9000', numeroSerie: 'SN-2024-0002',
    localInstalacao: 'Quarto Principal', dataInstalacao: '2023-06-15',
    situacao: 'Operacional',
  },
  {
    id: 3, contratoPMOCId: 2, clienteId: 2, clienteNome: 'Empresa ABC Ltda',
    tipo: 'Cassete', marca: 'Daikin', modelo: 'Sky Air 24000',
    capacidadeBTU: '24000', numeroSerie: 'SN-2024-0003',
    localInstalacao: 'Escritório Principal', dataInstalacao: '2023-03-20',
    situacao: 'Operacional',
  },
  {
    id: 4, contratoPMOCId: 2, clienteId: 2, clienteNome: 'Empresa ABC Ltda',
    tipo: 'Cassete', marca: 'Daikin', modelo: 'Sky Air 24000',
    capacidadeBTU: '24000', numeroSerie: 'SN-2024-0004',
    localInstalacao: 'Sala de Reuniões', dataInstalacao: '2023-03-20',
    situacao: 'Em Manutenção',
  },
];

const mockManutencoesPMOC = [
  {
    id: 1, contratoPMOCId: 1, equipamentoId: 1,
    clienteNome: 'João Silva', equipamentoNome: 'Split Samsung 12000 — Sala',
    tipo: 'Preventiva', dataAgendada: _d(7), dataRealizacao: null,
    status: 'Agendada', tecnicoNome: 'André Técnico', osVinculada: null, observacoes: '',
  },
  {
    id: 2, contratoPMOCId: 1, equipamentoId: 2,
    clienteNome: 'João Silva', equipamentoNome: 'Split LG 9000 — Quarto',
    tipo: 'Preventiva', dataAgendada: _d(7), dataRealizacao: null,
    status: 'Agendada', tecnicoNome: 'André Técnico', osVinculada: null, observacoes: '',
  },
  {
    id: 3, contratoPMOCId: 2, equipamentoId: 3,
    clienteNome: 'Empresa ABC Ltda', equipamentoNome: 'Cassete Daikin 24000 — Escritório',
    tipo: 'Preventiva', dataAgendada: _d(30), dataRealizacao: null,
    status: 'Agendada', tecnicoNome: 'Bruno Técnico', osVinculada: null, observacoes: '',
  },
  {
    id: 4, contratoPMOCId: 2, equipamentoId: 4,
    clienteNome: 'Empresa ABC Ltda', equipamentoNome: 'Cassete Daikin 24000 — Sala Reuniões',
    tipo: 'Preventiva', dataAgendada: _d(30), dataRealizacao: null,
    status: 'Agendada', tecnicoNome: 'Bruno Técnico', osVinculada: null, observacoes: '',
  },
  {
    id: 5, contratoPMOCId: 1, equipamentoId: 1,
    clienteNome: 'João Silva', equipamentoNome: 'Split Samsung 12000 — Sala',
    tipo: 'Preventiva', dataAgendada: _d(-30), dataRealizacao: _d(-30),
    status: 'Realizada', tecnicoNome: 'André Técnico', osVinculada: 'OS-2024-001',
    observacoes: 'Manutenção concluída conforme programação',
  },
];

const mockChecklists = [
  {
    id: 1, numero: 'CKL-2024-001', ordemId: 1, osNumero: 'OS-2024-001',
    clienteId: 1, clienteNome: 'João Silva',
    equipamentoId: 1, equipamentoNome: 'Split Samsung WindFree 12000 — Sala',
    tipo: 'Preventiva', dataExecucao: _d(-30), tecnicoNome: 'André Técnico',
    itens: [
      { id: 1, descricao: 'Limpeza dos filtros', status: 'OK', observacao: '' },
      { id: 2, descricao: 'Limpeza da evaporadora', status: 'OK', observacao: '' },
      { id: 3, descricao: 'Limpeza da condensadora', status: 'OK', observacao: '' },
      { id: 4, descricao: 'Medição elétrica', status: 'OK', observacao: 'Tensão 220V — Normal' },
      { id: 5, descricao: 'Medição de temperatura', status: 'OK', observacao: 'Delta T = 10°C' },
      { id: 6, descricao: 'Inspeção visual geral', status: 'OK', observacao: '' },
    ],
    observacoes: 'Manutenção concluída sem intercorrências.',
    recomendacoes: 'Substituir filtros no próximo semestre.',
    proximaManutencao: _d(0),
    assinaturaTecnico: 'André Técnico',
    assinaturaCliente: 'João Silva',
    status: 'Concluído',
  },
];

export const useStore = create(
  persist(
    (set, get) => ({
      // Configurações da Empresa
      empresa: {
        nome: 'AirSync Tecnologia',
        slogan: 'Gestão de Climatização',
        icone: 'AcUnit',
        logo: null,
      },
      updateEmpresa: (dados) => set((s) => ({ empresa: { ...s.empresa, ...dados } })),

      // Auth
      usuario: { id: 1, nome: 'Administrador', email: 'admin@airsync.com', perfil: 'Administrador' },
      tema: 'light',
      setTema: (tema) => set({ tema }),

      // Clientes
      clientes: mockClientes,
      addCliente: (c) => set((s) => ({ clientes: [...s.clientes, { ...c, id: Date.now() }] })),
      updateCliente: (id, d) => set((s) => ({ clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...d } : c)) })),
      deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

      // Tecnicos
      tecnicos: mockTecnicos,
      addTecnico: (t) => set((s) => ({ tecnicos: [...s.tecnicos, { ...t, id: Date.now() }] })),

      // Agendamentos
      agendamentos: mockAgendamentos,
      addAgendamento: (ag) => set((s) => ({ agendamentos: [...s.agendamentos, { ...ag, id: Date.now() }] })),
      updateAgendamento: (id, d) => set((s) => ({ agendamentos: s.agendamentos.map((a) => (a.id === id ? { ...a, ...d } : a)) })),
      deleteAgendamento: (id) => set((s) => ({ agendamentos: s.agendamentos.filter((a) => a.id !== id) })),

      // Ordens de Serviço
      ordens: mockOS,
      addOrdem: (os) => {
        const numero = `OS-${new Date().getFullYear()}-${String(get().ordens.length + 1).padStart(3, '0')}`;
        set((s) => ({ ordens: [...s.ordens, { ...os, id: Date.now(), numero, dataAbertura: new Date().toISOString().split('T')[0] }] }));
      },
      updateOrdem: (id, d) => set((s) => ({ ordens: s.ordens.map((o) => (o.id === id ? { ...o, ...d } : o)) })),
      deleteOrdem: (id) => set((s) => ({ ordens: s.ordens.filter((o) => o.id !== id) })),

      // Fornecedores
      fornecedores: mockFornecedores,
      addFornecedor: (f) => set((s) => ({ fornecedores: [...s.fornecedores, { ...f, id: Date.now() }] })),
      updateFornecedor: (id, d) => set((s) => ({ fornecedores: s.fornecedores.map((f) => (f.id === id ? { ...f, ...d } : f)) })),
      deleteFornecedor: (id) => set((s) => ({ fornecedores: s.fornecedores.filter((f) => f.id !== id) })),

      // Produtos / Estoque
      produtos: mockProdutos,
      addProduto: (p) => set((s) => ({ produtos: [...s.produtos, { ...p, id: Date.now() }] })),
      updateProduto: (id, d) => set((s) => ({ produtos: s.produtos.map((p) => (p.id === id ? { ...p, ...d } : p)) })),
      deleteProduto: (id) => set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) })),

      // Contas a Receber
      contasReceber: mockContasReceber,
      addContaReceber: (c) => set((s) => ({ contasReceber: [...s.contasReceber, { ...c, id: Date.now() }] })),
      updateContaReceber: (id, d) => set((s) => ({ contasReceber: s.contasReceber.map((c) => (c.id === id ? { ...c, ...d } : c)) })),
      deleteContaReceber: (id) => set((s) => ({ contasReceber: s.contasReceber.filter((c) => c.id !== id) })),

      // Contas a Pagar
      contasPagar: mockContasPagar,
      addContaPagar: (c) => set((s) => ({ contasPagar: [...s.contasPagar, { ...c, id: Date.now() }] })),
      updateContaPagar: (id, d) => set((s) => ({ contasPagar: s.contasPagar.map((c) => (c.id === id ? { ...c, ...d } : c)) })),
      deleteContaPagar: (id) => set((s) => ({ contasPagar: s.contasPagar.filter((c) => c.id !== id) })),

      // Orcamentos
      orcamentos: [],
      addOrcamento: (o) => {
        const numero = `ORC-${new Date().getFullYear()}-${String(get().orcamentos.length + 1).padStart(3, '0')}`;
        set((s) => ({ orcamentos: [...s.orcamentos, { ...o, id: Date.now(), numero, data: new Date().toISOString().split('T')[0], status: 'Pendente' }] }));
      },
      updateOrcamento: (id, d) => set((s) => ({ orcamentos: s.orcamentos.map((o) => (o.id === id ? { ...o, ...d } : o)) })),
      deleteOrcamento: (id) => set((s) => ({ orcamentos: s.orcamentos.filter((o) => o.id !== id) })),

      // Usuarios
      usuarios: [
        { id: 1, nome: 'Administrador', email: 'admin@airsync.com', perfil: 'Administrador', ativo: true },
        { id: 2, nome: 'André Técnico', email: 'andre@airsync.com', perfil: 'Técnico', ativo: true },
        { id: 3, nome: 'Comercial 01', email: 'comercial@airsync.com', perfil: 'Comercial', ativo: true },
      ],
      addUsuario: (u) => set((s) => ({ usuarios: [...s.usuarios, { ...u, id: Date.now(), ativo: true }] })),
      updateUsuario: (id, d) => set((s) => ({ usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, ...d } : u)) })),

      // ── PMOC — Contratos ──────────────────────────────────────────────────
      contratosPMOC: mockContratosPMOC,
      addContratoPMOC: (c) => {
        const numero = `PMOC-${new Date().getFullYear()}-${String(get().contratosPMOC.length + 1).padStart(3, '0')}`;
        set((s) => ({ contratosPMOC: [...s.contratosPMOC, { ...c, id: Date.now(), numero, status: 'Ativo' }] }));
      },
      updateContratoPMOC: (id, d) => set((s) => ({ contratosPMOC: s.contratosPMOC.map((c) => (c.id === id ? { ...c, ...d } : c)) })),
      deleteContratoPMOC: (id) => set((s) => ({ contratosPMOC: s.contratosPMOC.filter((c) => c.id !== id) })),

      // ── PMOC — Equipamentos ───────────────────────────────────────────────
      equipamentosPMOC: mockEquipamentosPMOC,
      addEquipamentoPMOC: (e) => set((s) => ({ equipamentosPMOC: [...s.equipamentosPMOC, { ...e, id: Date.now() }] })),
      updateEquipamentoPMOC: (id, d) => set((s) => ({ equipamentosPMOC: s.equipamentosPMOC.map((e) => (e.id === id ? { ...e, ...d } : e)) })),
      deleteEquipamentoPMOC: (id) => set((s) => ({ equipamentosPMOC: s.equipamentosPMOC.filter((e) => e.id !== id) })),

      // ── PMOC — Manutenções ────────────────────────────────────────────────
      manutencoesPMOC: mockManutencoesPMOC,
      addManutencaoPMOC: (m) => set((s) => ({ manutencoesPMOC: [...s.manutencoesPMOC, { ...m, id: Date.now() }] })),
      updateManutencaoPMOC: (id, d) => set((s) => ({ manutencoesPMOC: s.manutencoesPMOC.map((m) => (m.id === id ? { ...m, ...d } : m)) })),
      deleteManutencaoPMOC: (id) => set((s) => ({ manutencoesPMOC: s.manutencoesPMOC.filter((m) => m.id !== id) })),

      // ── Checklists ────────────────────────────────────────────────────────
      checklists: mockChecklists,
      addChecklist: (ck) => {
        const numero = `CKL-${new Date().getFullYear()}-${String(get().checklists.length + 1).padStart(3, '0')}`;
        set((s) => ({ checklists: [...s.checklists, { ...ck, id: Date.now(), numero, dataExecucao: new Date().toISOString().split('T')[0] }] }));
      },
      updateChecklist: (id, d) => set((s) => ({ checklists: s.checklists.map((c) => (c.id === id ? { ...c, ...d } : c)) })),
      deleteChecklist: (id) => set((s) => ({ checklists: s.checklists.filter((c) => c.id !== id) })),
    }),
    { name: 'airsync-storage' }
  )
);
