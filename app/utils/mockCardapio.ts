import type { RestaurantePublico, CategoriaProduto, ProdutoPublico } from '../../shared/types/cardapio'

// Mock de restaurante
export const mockRestaurante: RestaurantePublico = {
  id: '1',
  slug: 'pizzaria-do-ze',
  nome: 'Pizzaria do Zé',
  descricao: 'As melhores pizzas artesanais da cidade! Massa fina e crocante, ingredientes frescos e entrega rápida.',
  telefone: '(11) 98765-4321',
  whatsapp: '5511987654321',
  endereco: 'Rua das Pizzas, 123 - Centro',
  imagem_banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop',
  logo: 'https://ui-avatars.com/api/?name=Pizzaria+do+Ze&size=200&background=FF6B35&color=fff',
  cor_tema: '#FF6B35',
  cardapio_ativo: true,
  aceita_pedidos_online: true,
  taxa_entrega: 5.00,
  pedido_minimo: 20.00,
  tempo_preparo_min: 40,
  raio_entrega_km: 5,
  horario_funcionamento: [
    { dia: 0, abertura: '18:00', fechamento: '23:00', aberto: true }, // Domingo
    { dia: 1, abertura: '18:00', fechamento: '23:00', aberto: false }, // Segunda (fechado)
    { dia: 2, abertura: '18:00', fechamento: '23:00', aberto: true }, // Terça
    { dia: 3, abertura: '18:00', fechamento: '23:00', aberto: true }, // Quarta
    { dia: 4, abertura: '18:00', fechamento: '23:00', aberto: true }, // Quinta
    { dia: 5, abertura: '18:00', fechamento: '00:00', aberto: true }, // Sexta
    { dia: 6, abertura: '18:00', fechamento: '00:00', aberto: true }, // Sábado
  ]
}

// Mock de categorias
export const mockCategorias: CategoriaProduto[] = [
  {
    id: '1',
    nome: 'Pizzas Salgadas',
    descricao: 'Nossas deliciosas pizzas tradicionais',
    ordem: 1,
    ativa: true,
    imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    nome: 'Pizzas Doces',
    descricao: 'Sobremesas irresistíveis',
    ordem: 2,
    ativa: true,
    imagem: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    nome: 'Bebidas',
    descricao: 'Refrigerantes, sucos e cervejas',
    ordem: 3,
    ativa: true,
    imagem: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    nome: 'Porções',
    descricao: 'Acompanhamentos deliciosos',
    ordem: 4,
    ativa: true,
    imagem: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop'
  }
]

// Mock de produtos
export const mockProdutos: ProdutoPublico[] = [
  // Pizzas Salgadas
  {
    id: '1',
    nome: 'Pizza Margherita',
    descricao: 'Molho de tomate, mussarela, tomate, manjericão e azeite',
    imagem: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop',
    categoria_id: '1',
    categoria_nome: 'Pizzas Salgadas',
    tipo: 'pizza',
    tamanhos: [
      { tamanho: 'P', preco: 25.90 },
      { tamanho: 'G', preco: 42.90 },
      { tamanho: 'F', preco: 59.90 }
    ],
    ativo: true,
    destaque: true,
    grupos_complementos: [
      {
        id: '1',
        nome: 'Borda',
        obrigatorio: false,
        minimo: 0,
        maximo: 1,
        complementos: [
          { id: '1', nome: 'Catupiry', preco: 5.00, disponivel: true },
          { id: '2', nome: 'Cheddar', preco: 5.00, disponivel: true },
          { id: '3', nome: 'Chocolate', preco: 6.00, disponivel: true }
        ]
      }
    ]
  },
  {
    id: '2',
    nome: 'Pizza Calabresa',
    descricao: 'Molho de tomate, mussarela, calabresa, cebola e azeitonas',
    imagem: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop',
    categoria_id: '1',
    categoria_nome: 'Pizzas Salgadas',
    tipo: 'pizza',
    tamanhos: [
      { tamanho: 'P', preco: 28.90 },
      { tamanho: 'G', preco: 45.90 },
      { tamanho: 'F', preco: 62.90 }
    ],
    ativo: true,
    destaque: true,
    grupos_complementos: [
      {
        id: '1',
        nome: 'Borda',
        obrigatorio: false,
        minimo: 0,
        maximo: 1,
        complementos: [
          { id: '1', nome: 'Catupiry', preco: 5.00, disponivel: true },
          { id: '2', nome: 'Cheddar', preco: 5.00, disponivel: true },
          { id: '3', nome: 'Chocolate', preco: 6.00, disponivel: true }
        ]
      }
    ]
  },
  {
    id: '3',
    nome: 'Pizza Portuguesa',
    descricao: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas e ervilha',
    imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
    categoria_id: '1',
    categoria_nome: 'Pizzas Salgadas',
    tipo: 'pizza',
    preco_promocional: 38.90,
    promocao_ativa: true,
    tamanhos: [
      { tamanho: 'P', preco: 32.90 },
      { tamanho: 'G', preco: 49.90 },
      { tamanho: 'F', preco: 66.90 }
    ],
    ativo: true,
    destaque: false,
    grupos_complementos: [
      {
        id: '1',
        nome: 'Borda',
        obrigatorio: false,
        minimo: 0,
        maximo: 1,
        complementos: [
          { id: '1', nome: 'Catupiry', preco: 5.00, disponivel: true },
          { id: '2', nome: 'Cheddar', preco: 5.00, disponivel: true },
          { id: '3', nome: 'Chocolate', preco: 6.00, disponivel: true }
        ]
      }
    ]
  },
  {
    id: '4',
    nome: 'Pizza Frango com Catupiry',
    descricao: 'Molho de tomate, mussarela, frango desfiado e catupiry',
    imagem: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=600&h=400&fit=crop',
    categoria_id: '1',
    categoria_nome: 'Pizzas Salgadas',
    tipo: 'pizza',
    tamanhos: [
      { tamanho: 'P', preco: 30.90 },
      { tamanho: 'G', preco: 47.90 },
      { tamanho: 'F', preco: 64.90 }
    ],
    ativo: true,
    destaque: true,
    grupos_complementos: [
      {
        id: '1',
        nome: 'Borda',
        obrigatorio: false,
        minimo: 0,
        maximo: 1,
        complementos: [
          { id: '1', nome: 'Catupiry', preco: 5.00, disponivel: true },
          { id: '2', nome: 'Cheddar', preco: 5.00, disponivel: true }
        ]
      }
    ]
  },

  // Pizzas Doces
  {
    id: '5',
    nome: 'Pizza de Brigadeiro',
    descricao: 'Massa doce coberta com brigadeiro e granulado',
    imagem: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=400&fit=crop',
    categoria_id: '2',
    categoria_nome: 'Pizzas Doces',
    tipo: 'pizza',
    tamanhos: [
      { tamanho: 'P', preco: 29.90 },
      { tamanho: 'G', preco: 44.90 },
      { tamanho: 'F', preco: 59.90 }
    ],
    ativo: true,
    destaque: true
  },
  {
    id: '6',
    nome: 'Pizza de Nutella com Morango',
    descricao: 'Massa doce, nutella e morangos frescos',
    imagem: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop',
    categoria_id: '2',
    categoria_nome: 'Pizzas Doces',
    tipo: 'pizza',
    tamanhos: [
      { tamanho: 'P', preco: 34.90 },
      { tamanho: 'G', preco: 51.90 },
      { tamanho: 'F', preco: 68.90 }
    ],
    ativo: true,
    destaque: false
  },

  // Bebidas
  {
    id: '7',
    nome: 'Coca-Cola 2L',
    descricao: 'Refrigerante Coca-Cola 2 litros',
    imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=400&fit=crop',
    categoria_id: '3',
    categoria_nome: 'Bebidas',
    tipo: 'comum',
    preco: 12.00,
    ativo: true,
    destaque: false
  },
  {
    id: '8',
    nome: 'Guaraná Antarctica 2L',
    descricao: 'Refrigerante Guaraná Antarctica 2 litros',
    imagem: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&h=400&fit=crop',
    categoria_id: '3',
    categoria_nome: 'Bebidas',
    tipo: 'comum',
    preco: 10.00,
    preco_promocional: 8.50,
    promocao_ativa: true,
    ativo: true,
    destaque: true
  },
  {
    id: '9',
    nome: 'Suco de Laranja Natural 500ml',
    descricao: 'Suco de laranja natural feito na hora',
    imagem: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=400&fit=crop',
    categoria_id: '3',
    categoria_nome: 'Bebidas',
    tipo: 'comum',
    preco: 8.00,
    ativo: true,
    destaque: false
  },

  // Porções
  {
    id: '10',
    nome: 'Batata Frita Grande',
    descricao: 'Porção de batata frita crocante - serve 2 pessoas',
    imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop',
    categoria_id: '4',
    categoria_nome: 'Porções',
    tipo: 'comum',
    preco: 18.00,
    ativo: true,
    destaque: true
  },
  {
    id: '11',
    nome: 'Calabresa Acebolada',
    descricao: 'Calabresa artesanal com cebola - serve 2 pessoas',
    imagem: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop',
    categoria_id: '4',
    categoria_nome: 'Porções',
    tipo: 'comum',
    preco: 25.00,
    ativo: true,
    destaque: false
  }
]
