-- ============================================================
-- AirSync — Schema PostgreSQL
-- Banco: db_airsync
-- ============================================================

BEGIN;

-- ============================================================
-- FUNÇÃO: atualiza coluna atualizado_em automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- EMPRESA (registro único — configurações da empresa)
-- ============================================================
CREATE TABLE IF NOT EXISTS empresa (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(150) NOT NULL DEFAULT 'AirSync Tecnologia',
  slogan      VARCHAR(200)          DEFAULT 'Gestão de Climatização',
  icone       VARCHAR(50)           DEFAULT 'AcUnit',
  logo        TEXT,                 -- base64 ou URL
  criado_em   TIMESTAMPTZ NOT NULL  DEFAULT NOW()
);

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  username      VARCHAR(100) NOT NULL UNIQUE,
  senha         VARCHAR(255) NOT NULL, -- armazenar hash em produção (bcrypt)
  email         VARCHAR(200),
  perfil        VARCHAR(50)  NOT NULL  DEFAULT 'Técnico',
  ativo         BOOLEAN      NOT NULL  DEFAULT TRUE,
  bloqueado     BOOLEAN      NOT NULL  DEFAULT FALSE,
  permissoes    TEXT[]       NOT NULL  DEFAULT '{}',
  criado_em     TIMESTAMPTZ  NOT NULL  DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ  NOT NULL  DEFAULT NOW(),
  CONSTRAINT chk_usuarios_perfil CHECK (
    perfil IN ('Administrador', 'Comercial', 'Financeiro', 'Técnico', 'Gestor')
  )
);

CREATE TRIGGER trg_usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(200) NOT NULL,
  cpf_cnpj      VARCHAR(20),
  telefone      VARCHAR(20),
  email         VARCHAR(200),
  endereco      VARCHAR(300),
  cidade        VARCHAR(100),
  responsavel   VARCHAR(150),
  observacoes   TEXT,
  ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_clientes_atualizado_em
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- EQUIPAMENTOS DO CLIENTE
-- ============================================================
CREATE TABLE IF NOT EXISTS equipamentos_cliente (
  id               SERIAL PRIMARY KEY,
  cliente_id       INT         NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo             VARCHAR(100),
  marca            VARCHAR(100),
  modelo           VARCHAR(150),
  capacidade_btu   VARCHAR(20),
  numero_serie     VARCHAR(100),
  local_instalacao VARCHAR(200),
  data_instalacao  DATE,
  situacao         VARCHAR(50) DEFAULT 'Operacional',
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_equip_cliente_situacao CHECK (
    situacao IN ('Operacional', 'Em Manutenção', 'Inativo', 'Substituído')
  )
);

CREATE TRIGGER trg_equipamentos_cliente_atualizado_em
  BEFORE UPDATE ON equipamentos_cliente
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- TECNICOS
-- ============================================================
CREATE TABLE IF NOT EXISTS tecnicos (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  especialidade VARCHAR(200),
  telefone      VARCHAR(20),
  email         VARCHAR(200),
  ativo         BOOLEAN     NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_tecnicos_atualizado_em
  BEFORE UPDATE ON tecnicos
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- AGENDAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id            SERIAL PRIMARY KEY,
  cliente_id    INT          REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome  VARCHAR(200),
  tipo          VARCHAR(100) NOT NULL,
  data          DATE         NOT NULL,
  horario       TIME         NOT NULL,
  tecnico_id    INT          REFERENCES tecnicos(id) ON DELETE SET NULL,
  tecnico_nome  VARCHAR(150),
  status        VARCHAR(50)  NOT NULL DEFAULT 'Agendado',
  endereco      VARCHAR(300),
  observacoes   TEXT,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_agendamentos_status CHECK (
    status IN ('Agendado', 'Confirmado', 'Em atendimento', 'Concluído', 'Cancelado')
  )
);

CREATE TRIGGER trg_agendamentos_atualizado_em
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- ORDENS DE SERVIÇO
-- ============================================================
CREATE TABLE IF NOT EXISTS ordens_servico (
  id                SERIAL PRIMARY KEY,
  numero            VARCHAR(30)  NOT NULL UNIQUE,
  cliente_id        INT          REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome      VARCHAR(200),
  equipamento       VARCHAR(200),
  marca             VARCHAR(100),
  modelo            VARCHAR(150),
  btus              VARCHAR(20),
  local_instalacao  VARCHAR(150),
  tipo              VARCHAR(100),
  status            VARCHAR(50)  NOT NULL DEFAULT 'Aberto',
  data_abertura     DATE         NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao    DATE,
  tecnico_id        INT          REFERENCES tecnicos(id) ON DELETE SET NULL,
  tecnico_nome      VARCHAR(150),
  problema          TEXT,
  servico_executado TEXT,
  pecas_utilizadas  TEXT,
  materiais         TEXT,
  tempo_gasto       VARCHAR(50),
  valor_servico     NUMERIC(10,2),
  observacoes       TEXT,
  criado_em         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_os_status CHECK (
    status IN ('Aberto', 'Em Andamento', 'Concluída', 'Cancelada')
  )
);

CREATE TRIGGER trg_os_atualizado_em
  BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- FORNECEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS fornecedores (
  id            SERIAL PRIMARY KEY,
  razao_social  VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  cnpj          VARCHAR(20),
  telefone      VARCHAR(20),
  email         VARCHAR(200),
  endereco      VARCHAR(300),
  cidade        VARCHAR(100),
  observacoes   TEXT,
  ativo         BOOLEAN     NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_fornecedores_atualizado_em
  BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- PRODUTOS / ESTOQUE
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos (
  id             SERIAL PRIMARY KEY,
  nome           VARCHAR(200) NOT NULL,
  categoria      VARCHAR(100),
  unidade        VARCHAR(20)  NOT NULL DEFAULT 'un',
  quantidade     NUMERIC(10,3) NOT NULL DEFAULT 0,
  estoque_minimo NUMERIC(10,3) NOT NULL DEFAULT 0,
  preco          NUMERIC(10,2) NOT NULL DEFAULT 0,
  codigo         VARCHAR(50),
  descricao      TEXT,
  ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_produtos_atualizado_em
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- PEDIDOS DE COMPRA
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos_compra (
  id              SERIAL PRIMARY KEY,
  numero          VARCHAR(30)  NOT NULL UNIQUE,
  fornecedor_id   INT          REFERENCES fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome VARCHAR(200),
  data            DATE         NOT NULL DEFAULT CURRENT_DATE,
  status          VARCHAR(50)  NOT NULL DEFAULT 'Aberto',
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes     TEXT,
  criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pedido_status CHECK (
    status IN ('Aberto', 'Aprovado', 'Recebido', 'Cancelado')
  )
);

CREATE TABLE IF NOT EXISTS pedido_compra_itens (
  id             SERIAL PRIMARY KEY,
  pedido_id      INT           NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
  produto_id     INT           REFERENCES produtos(id) ON DELETE SET NULL,
  produto_nome   VARCHAR(200),
  quantidade     NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total    NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED
);

CREATE TRIGGER trg_pedidos_atualizado_em
  BEFORE UPDATE ON pedidos_compra
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- ORÇAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS orcamentos (
  id            SERIAL PRIMARY KEY,
  numero        VARCHAR(30)   NOT NULL UNIQUE,
  cliente_id    INT           REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome  VARCHAR(200),
  data          DATE          NOT NULL DEFAULT CURRENT_DATE,
  pagamento     VARCHAR(100),
  desconto      NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        VARCHAR(50)   NOT NULL DEFAULT 'Pendente',
  observacoes   TEXT,
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_orcamento_status CHECK (
    status IN ('Pendente', 'Aprovado', 'Recusado', 'Convertido')
  )
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id             SERIAL PRIMARY KEY,
  orcamento_id   INT           NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  descricao      VARCHAR(300)  NOT NULL,
  quantidade     NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total    NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED
);

CREATE TRIGGER trg_orcamentos_atualizado_em
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- VENDAS
-- ============================================================
CREATE TABLE IF NOT EXISTS vendas (
  id            SERIAL PRIMARY KEY,
  numero        VARCHAR(30)   NOT NULL UNIQUE,
  orcamento_id  INT           REFERENCES orcamentos(id) ON DELETE SET NULL,
  cliente_id    INT           REFERENCES clientes(id)  ON DELETE SET NULL,
  cliente_nome  VARCHAR(200),
  data          DATE          NOT NULL DEFAULT CURRENT_DATE,
  pagamento     VARCHAR(100),
  desconto      NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        VARCHAR(50)   NOT NULL DEFAULT 'Confirmada',
  observacoes   TEXT,
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venda_itens (
  id             SERIAL PRIMARY KEY,
  venda_id       INT           NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  descricao      VARCHAR(300)  NOT NULL,
  quantidade     NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total    NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED
);

CREATE TRIGGER trg_vendas_atualizado_em
  BEFORE UPDATE ON vendas
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- CONTAS A RECEBER
-- ============================================================
CREATE TABLE IF NOT EXISTS contas_receber (
  id               SERIAL PRIMARY KEY,
  cliente_id       INT           REFERENCES clientes(id)      ON DELETE SET NULL,
  cliente_nome     VARCHAR(200),
  documento        VARCHAR(50),
  os_id            INT           REFERENCES ordens_servico(id) ON DELETE SET NULL,
  vencimento       DATE          NOT NULL,
  valor            NUMERIC(10,2) NOT NULL,
  situacao         VARCHAR(50)   NOT NULL DEFAULT 'Aberto',
  data_recebimento DATE,
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_receber_situacao CHECK (
    situacao IN ('Aberto', 'Recebido', 'Vencido', 'Cancelado')
  )
);

CREATE TRIGGER trg_contas_receber_atualizado_em
  BEFORE UPDATE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- CONTAS A PAGAR
-- ============================================================
CREATE TABLE IF NOT EXISTS contas_pagar (
  id              SERIAL PRIMARY KEY,
  fornecedor_id   INT           REFERENCES fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome VARCHAR(200),
  categoria       VARCHAR(100),
  documento       VARCHAR(50),
  vencimento      DATE          NOT NULL,
  valor           NUMERIC(10,2) NOT NULL,
  situacao        VARCHAR(50)   NOT NULL DEFAULT 'Aberto',
  data_pagamento  DATE,
  observacoes     TEXT,
  criado_em       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pagar_situacao CHECK (
    situacao IN ('Aberto', 'Pago', 'Vencido', 'Cancelado')
  )
);

CREATE TRIGGER trg_contas_pagar_atualizado_em
  BEFORE UPDATE ON contas_pagar
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- PMOC — CONTRATOS
-- ============================================================
CREATE TABLE IF NOT EXISTS contratos_pmoc (
  id              SERIAL PRIMARY KEY,
  numero          VARCHAR(30)   NOT NULL UNIQUE,
  cliente_id      INT           REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome    VARCHAR(200),
  unidade         VARCHAR(200),
  responsavel     VARCHAR(150),
  data_inicio     DATE          NOT NULL,
  data_vencimento DATE          NOT NULL,
  frequencia      VARCHAR(50)   NOT NULL,
  status          VARCHAR(50)   NOT NULL DEFAULT 'Ativo',
  valor           NUMERIC(10,2),
  observacoes     TEXT,
  criado_em       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pmoc_frequencia CHECK (
    frequencia IN ('Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual')
  ),
  CONSTRAINT chk_pmoc_status CHECK (
    status IN ('Ativo', 'Vencido', 'Cancelado', 'Suspenso')
  )
);

CREATE TRIGGER trg_contratos_pmoc_atualizado_em
  BEFORE UPDATE ON contratos_pmoc
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- PMOC — EQUIPAMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS equipamentos_pmoc (
  id               SERIAL PRIMARY KEY,
  contrato_pmoc_id INT         NOT NULL REFERENCES contratos_pmoc(id) ON DELETE CASCADE,
  cliente_id       INT          REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome     VARCHAR(200),
  tipo             VARCHAR(100),
  marca            VARCHAR(100),
  modelo           VARCHAR(150),
  capacidade_btu   VARCHAR(20),
  numero_serie     VARCHAR(100),
  local_instalacao VARCHAR(200),
  data_instalacao  DATE,
  situacao         VARCHAR(50) DEFAULT 'Operacional',
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_equip_pmoc_situacao CHECK (
    situacao IN ('Operacional', 'Em Manutenção', 'Inativo', 'Substituído')
  )
);

CREATE TRIGGER trg_equipamentos_pmoc_atualizado_em
  BEFORE UPDATE ON equipamentos_pmoc
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- PMOC — MANUTENÇÕES / PLANEJAMENTO
-- ============================================================
CREATE TABLE IF NOT EXISTS manutencoes_pmoc (
  id               SERIAL PRIMARY KEY,
  contrato_pmoc_id INT         NOT NULL REFERENCES contratos_pmoc(id)  ON DELETE CASCADE,
  equipamento_id   INT          REFERENCES equipamentos_pmoc(id) ON DELETE SET NULL,
  cliente_nome     VARCHAR(200),
  equipamento_nome VARCHAR(300),
  tipo             VARCHAR(50) NOT NULL DEFAULT 'Preventiva',
  data_agendada    DATE        NOT NULL,
  data_realizacao  DATE,
  status           VARCHAR(50) NOT NULL DEFAULT 'Agendada',
  tecnico_id       INT          REFERENCES tecnicos(id) ON DELETE SET NULL,
  tecnico_nome     VARCHAR(150),
  os_id            INT          REFERENCES ordens_servico(id) ON DELETE SET NULL,
  os_vinculada     VARCHAR(30),
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_manut_tipo CHECK (
    tipo IN ('Preventiva', 'Corretiva', 'Higienização', 'Preditiva')
  ),
  CONSTRAINT chk_manut_status CHECK (
    status IN ('Agendada', 'Realizada', 'Cancelada', 'Atrasada')
  )
);

CREATE TRIGGER trg_manutencoes_pmoc_atualizado_em
  BEFORE UPDATE ON manutencoes_pmoc
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- CHECKLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS checklists (
  id                 SERIAL PRIMARY KEY,
  numero             VARCHAR(30)  NOT NULL UNIQUE,
  ordem_id           INT          REFERENCES ordens_servico(id)  ON DELETE SET NULL,
  os_numero          VARCHAR(30),
  cliente_id         INT          REFERENCES clientes(id)         ON DELETE SET NULL,
  cliente_nome       VARCHAR(200),
  equipamento_id     INT          REFERENCES equipamentos_pmoc(id) ON DELETE SET NULL,
  equipamento_nome   VARCHAR(300),
  tipo               VARCHAR(50)  NOT NULL,
  data_execucao      DATE         NOT NULL DEFAULT CURRENT_DATE,
  tecnico_id         INT          REFERENCES tecnicos(id) ON DELETE SET NULL,
  tecnico_nome       VARCHAR(150),
  observacoes        TEXT,
  recomendacoes      TEXT,
  proxima_manutencao DATE,
  assinatura_tecnico VARCHAR(150),
  assinatura_cliente VARCHAR(150),
  status             VARCHAR(50)  NOT NULL DEFAULT 'Pendente',
  criado_em          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_checklist_tipo CHECK (
    tipo IN ('Preventiva', 'Instalação', 'Corretiva')
  ),
  CONSTRAINT chk_checklist_status CHECK (
    status IN ('Pendente', 'Em Andamento', 'Concluído')
  )
);

CREATE TABLE IF NOT EXISTS checklist_itens (
  id           SERIAL PRIMARY KEY,
  checklist_id INT         NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  descricao    VARCHAR(300) NOT NULL,
  status       VARCHAR(10)  NOT NULL DEFAULT 'N/A',
  observacao   TEXT,
  ordem        SMALLINT     NOT NULL DEFAULT 0,
  CONSTRAINT chk_item_status CHECK (status IN ('OK', 'NOK', 'N/A'))
);

CREATE TRIGGER trg_checklists_atualizado_em
  BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- ÍNDICES
-- ============================================================

-- clientes
CREATE INDEX IF NOT EXISTS idx_clientes_nome        ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj    ON clientes(cpf_cnpj);

-- agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_data     ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente  ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tecnico  ON agendamentos(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status   ON agendamentos(status);

-- ordens de serviço
CREATE INDEX IF NOT EXISTS idx_os_numero             ON ordens_servico(numero);
CREATE INDEX IF NOT EXISTS idx_os_cliente            ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_os_status             ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_os_data_abertura      ON ordens_servico(data_abertura);

-- financeiro
CREATE INDEX IF NOT EXISTS idx_cr_vencimento         ON contas_receber(vencimento);
CREATE INDEX IF NOT EXISTS idx_cr_situacao           ON contas_receber(situacao);
CREATE INDEX IF NOT EXISTS idx_cr_cliente            ON contas_receber(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cp_vencimento         ON contas_pagar(vencimento);
CREATE INDEX IF NOT EXISTS idx_cp_situacao           ON contas_pagar(situacao);

-- produtos
CREATE INDEX IF NOT EXISTS idx_produtos_categoria    ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_nome         ON produtos(nome);

-- orçamentos
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente    ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status     ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data       ON orcamentos(data);

-- PMOC
CREATE INDEX IF NOT EXISTS idx_pmoc_cliente          ON contratos_pmoc(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pmoc_status           ON contratos_pmoc(status);
CREATE INDEX IF NOT EXISTS idx_pmoc_vencimento       ON contratos_pmoc(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_equip_pmoc_contrato   ON equipamentos_pmoc(contrato_pmoc_id);
CREATE INDEX IF NOT EXISTS idx_manut_data_agendada   ON manutencoes_pmoc(data_agendada);
CREATE INDEX IF NOT EXISTS idx_manut_status          ON manutencoes_pmoc(status);
CREATE INDEX IF NOT EXISTS idx_manut_contrato        ON manutencoes_pmoc(contrato_pmoc_id);

-- checklist
CREATE INDEX IF NOT EXISTS idx_checklist_ordem       ON checklists(ordem_id);
CREATE INDEX IF NOT EXISTS idx_checklist_cliente     ON checklists(cliente_id);
CREATE INDEX IF NOT EXISTS idx_checklist_data        ON checklists(data_execucao);
CREATE INDEX IF NOT EXISTS idx_checklist_itens       ON checklist_itens(checklist_id);

-- usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_username     ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil       ON usuarios(perfil);

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Empresa padrão
INSERT INTO empresa (nome, slogan, icone)
VALUES ('AirSync Tecnologia', 'Gestão de Climatização', 'AcUnit')
ON CONFLICT DO NOTHING;

-- Usuário administrador do sistema
-- ATENÇÃO: em produção, substitua a senha por um hash bcrypt
INSERT INTO usuarios (nome, username, senha, email, perfil, ativo, bloqueado, permissoes)
VALUES (
  'Fábio Teste',
  'fabio.teste',
  '123456',
  'fabio@airsync.com',
  'Técnico',
  TRUE,
  FALSE,
  ARRAY[
    'Dashboard','Agenda','Ordens de Serviço','Clientes','PMOC',
    'Checklist Técnico','Ferramentas','Compras','Vendas','Financeiro','Configurador'
  ]
)
ON CONFLICT (username) DO NOTHING;

COMMIT;
