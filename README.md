# ProspectHero - Gamified Sales Prospecting System

ProspectHero é uma plataforma gamificada desenvolvida para equipes de vendas acompanharem sua prospecção de forma divertida e eficiente.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **Gráficos**: Chart.js + react-chartjs-2
- **Estilo**: Tailwind CSS
- **Ícones**: Lucide React
- **Gamificação**: Sistema de níveis, conquistas (badges) e ranking.

## 🛠️ Configuração

1. **Instalação de dependências**:
   ```bash
   npm install
   ```

2. **Configuração do Supabase**:
   - Crie um projeto no [Supabase](https://supabase.com).
   - Execute o script SQL contido em `sql/schema.sql` no SQL Editor do Supabase.
   - Execute o script SQL contido em `sql/seed.sql` para popular dados iniciais.
   - Configure o `.env.local` na raiz do projeto:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
     NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key_do_supabase
     ```

3. **Rodar o projeto**:
   ```bash
   npm run dev
   ```

## 🎮 Gamificação (Regras)

- **Cadastro de Prospect**: +1 ponto
- **Status "Interessado"**: +3 pontos
- **Status "Convertido"**: +10 pontos
- **Sistema de Níveis**:
  - Nível 1: 0-100 pts
  - Nível 2: 101-300 pts
  - Nível 3: 301-600 pts
  - Nível 4: 600+ pts

## 👮 Segurança (RLS)

- **Vendedores**: Podem ver e editar apenas seus próprios prospects.
- **Admin**: Tem visão global de todos os dashboards, rankings e motivos de conversão/perda.

## 📁 Estrutura do Projeto

- `/app`: Páginas e API Routes.
- `/components`: Componentes reutilizáveis (Sidebar, Layouts).
- `/lib`: Configuração do cliente Supabase.
- `/sql`: Scripts de banco de dados.
- `middleware.ts`: Proteção de rotas e controle de acesso.
