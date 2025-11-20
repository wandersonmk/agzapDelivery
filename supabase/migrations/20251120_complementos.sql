-- Tabela de Grupos de Complementos
-- Exemplo: "Adicionais", "Ponto da Carne", "Molhos", "Tamanho"
CREATE TABLE IF NOT EXISTS grupos_complementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  obrigatorio BOOLEAN DEFAULT false, -- Se o cliente PRECISA escolher ao menos 1
  min_opcoes INTEGER DEFAULT 0, -- Mínimo de opções que podem ser escolhidas
  max_opcoes INTEGER DEFAULT NULL, -- Máximo de opções (NULL = ilimitado)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Complementos (os itens dentro dos grupos)
-- Exemplo: "Bacon +R$3", "Cheddar +R$2", "Mal Passado", "Ketchup"
CREATE TABLE IF NOT EXISTS complementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES grupos_complementos(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) DEFAULT 0, -- Preço adicional (pode ser 0 para opções gratuitas)
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0, -- Para ordenar os complementos dentro do grupo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento Produto <-> Grupos de Complementos
-- Define quais grupos de complementos estão disponíveis para cada produto
CREATE TABLE IF NOT EXISTS produto_grupos_complementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES grupos_complementos(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0, -- Ordem de exibição dos grupos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(produto_id, grupo_id) -- Evita duplicação
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_grupos_complementos_empresa ON grupos_complementos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_complementos_grupo ON complementos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_produto_grupos_produto ON produto_grupos_complementos(produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_grupos_grupo ON produto_grupos_complementos(grupo_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grupos_complementos_updated_at
  BEFORE UPDATE ON grupos_complementos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complementos_updated_at
  BEFORE UPDATE ON complementos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE grupos_complementos IS 'Grupos de complementos/adicionais (ex: Adicionais, Molhos, Tamanho)';
COMMENT ON TABLE complementos IS 'Itens dentro dos grupos de complementos (ex: Bacon +R$3, Ketchup)';
COMMENT ON TABLE produto_grupos_complementos IS 'Relacionamento entre produtos e seus grupos de complementos disponíveis';

COMMENT ON COLUMN grupos_complementos.obrigatorio IS 'Se true, cliente precisa escolher ao menos 1 opção deste grupo';
COMMENT ON COLUMN grupos_complementos.min_opcoes IS 'Quantidade mínima de opções que o cliente deve escolher';
COMMENT ON COLUMN grupos_complementos.max_opcoes IS 'Quantidade máxima de opções (NULL = ilimitado)';
COMMENT ON COLUMN complementos.preco IS 'Preço adicional do complemento (0 = gratuito)';
