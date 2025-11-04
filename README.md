# 🚀 Agzap Delivery - Sistema de Delivery

Sistema completo de gestão para delivery desenvolvido com Nuxt 4, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Gestão de Cardápio**: Criação e edição de produtos, categorias e complementos
- **Gestão de Pedidos**: Controle completo de pedidos com status e filtros
- **Gestão de Clientes**: Cadastro e controle de clientes
- **Autenticação**: Sistema seguro de login e registro
- **Relatórios**: Exportação em PDF e Excel
- **Dashboard**: Visão geral do negócio
- **Configurações**: Personalização da empresa

## 🛠️ Tecnologias

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Ícones**: Font Awesome

## 📋 Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto com as credenciais do Supabase:

```env
NUXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NUXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

⚠️ **Observações importantes**:
- Variáveis iniciadas com `NUXT_PUBLIC_` são expostas no cliente (uso no navegador)
- Nunca coloque a Service Role Key no cliente
- Se precisar usar a Service Role Key, mantenha-a apenas no servidor

## � Instalação e Execução

### Instalação de dependências

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Servidor de desenvolvimento

Inicie o servidor de desenvolvimento em `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Build para produção

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

## 📝 Convenções de Commit

Este projeto usa convenções de commit em português. Consulte o arquivo [COMMIT_CONVENTIONS.md](./COMMIT_CONVENTIONS.md) para detalhes.

### Scripts de commit rápido

Para facilitar commits, use os scripts disponíveis:

```powershell
# PowerShell (Windows)
.\commit.ps1 "adiciona: nova funcionalidade de relatórios"
```

```bash
# Bash (Linux/Mac)  
./commit.sh "adiciona: nova funcionalidade de relatórios"
```

## 📚 Documentação

Consulte a [documentação do Nuxt](https://nuxt.com/docs/getting-started/introduction) para mais informações.

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
