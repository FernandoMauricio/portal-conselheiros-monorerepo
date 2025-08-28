# Portal dos Conselheiros

Sistema interno do Senac para gestão de reuniões do conselho, com reconhecimento facial para controle de presença e transmissão ao vivo.

## 📋 Visão Geral

O Portal dos Conselheiros é um sistema completo que inclui:

- **📱 Aplicativo Mobile**: Para tablets corporativos com reconhecimento facial
- **🌐 Painel Web**: Interface administrativa para gestão
- **🔧 API Backend**: Serviços de autenticação, dados e reconhecimento facial
- **📺 Media Gateway**: Serviço de transmissão ao vivo com LiveKit
- **🗄️ Infraestrutura**: PostgreSQL, MinIO, LiveKit e COTURN

## 🏗️ Arquitetura

```
portal-conselheiros-monorepo/
├── apps/
│   ├── mobile/          # React Native (Expo) - Tablets
│   ├── web/             # React + Vite - Painel Admin
│   ├── api/             # Node.js + Express + Prisma
│   └── media-gateway/   # Node.js + LiveKit SDK
├── packages/
│   └── config/          # Configurações compartilhadas
├── infra/               # Docker Compose + Configurações
└── scripts/             # Scripts de automação
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- pnpm
- Docker e Docker Compose
- Git

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd portal-conselheiros-monorepo
   ```

2. **Execute o setup automático**
   ```bash
   ./scripts/setup.sh
   ```

3. **Inicie o ambiente de desenvolvimento**
   ```bash
   ./scripts/dev.sh
   ```

### Acesso às Aplicações

- **Painel Web**: http://localhost:5173
- **API**: http://localhost:3001
- **Media Gateway**: http://localhost:3002
- **MinIO Console**: http://localhost:9001

### Credenciais Padrão

- **Admin**: admin@senac.br / admin123
- **Moderador**: moderator@senac.br / moderator123
- **MinIO**: minioadmin / minioadmin

## 📱 Aplicações

### Mobile (Tablets)
- React Native com Expo
- Reconhecimento facial com react-native-vision-camera
- Transmissão ao vivo com LiveKit
- Interface otimizada para tablets corporativos

### Painel Web
- React com Vite e TypeScript
- Interface administrativa completa
- Gestão de conselheiros, reuniões e dispositivos
- Dashboard com estatísticas em tempo real

### API Backend
- Node.js com Express e TypeScript
- Prisma ORM com PostgreSQL
- Autenticação JWT com refresh tokens
- Upload de arquivos com MinIO
- Reconhecimento facial integrado

### Media Gateway
- Serviço especializado em transmissão
- Integração com LiveKit
- Gestão de salas e tokens
- Gravação de reuniões

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
# Setup inicial completo
./scripts/setup.sh

# Iniciar ambiente de desenvolvimento
./scripts/dev.sh

# Build de produção
./scripts/build.sh

# Limpeza do ambiente
./scripts/clean.sh
```

### Comandos pnpm
```bash
# Instalar dependências
pnpm install

# Desenvolvimento (todos os serviços)
pnpm dev

# Iniciar serviço específico
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter mobile dev
pnpm --filter media-gateway dev

# Build de produção
pnpm build

# Linting
pnpm lint

# Formatação de código
pnpm format
```

## 🗄️ Banco de Dados

### Estrutura Principal
- **users**: Usuários do sistema (admins, moderadores)
- **conselheiros**: Dados dos conselheiros
- **reunioes**: Informações das reuniões
- **presencas**: Controle de presença
- **devices**: Dispositivos autorizados
- **stream_sessions**: Sessões de transmissão

### Migrações
```bash
cd apps/api

# Gerar migração
pnpm prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
pnpm prisma migrate deploy

# Resetar banco (desenvolvimento)
pnpm prisma migrate reset
```

## 🔧 Configuração

### Variáveis de Ambiente

Cada aplicação possui seu arquivo `.env.example`. Copie para `.env` e configure:

#### API (`apps/api/.env`)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/portal_conselheiros"
JWT_SECRET="your-jwt-secret"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

#### Web (`apps/web/.env`)
```env
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_MEDIA_GATEWAY_URL="http://localhost:3002/api"
```

#### Mobile (`apps/mobile/.env`)
```env
EXPO_PUBLIC_API_URL="http://localhost:3001/api"
EXPO_PUBLIC_MEDIA_URL="http://localhost:3002/api"
```

### Infraestrutura

Configure os serviços em `infra/.env`:

```env
POSTGRES_PASSWORD="your-secure-password"
MINIO_ROOT_PASSWORD="your-secure-minio-password"
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
```

## 📦 Deployment

### Desenvolvimento
```bash
# Iniciar todos os serviços
./scripts/dev.sh
```

### Produção

1. **Build das aplicações**
   ```bash
   ./scripts/build.sh
   ```

2. **Configurar ambiente de produção**
   - Configurar variáveis de ambiente
   - Configurar banco de dados
   - Configurar domínios e SSL

3. **Deploy da infraestrutura**
   ```bash
   cd infra
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Deploy das aplicações**
   - API: `cd apps/api && pnpm start`
   - Media Gateway: `cd apps/media-gateway && pnpm start`
   - Web: Servir arquivos estáticos de `apps/web/dist`

### Mobile (Produção)
```bash
cd apps/mobile

# Android
expo build:android

# iOS
expo build:ios
```

## 🔒 Segurança

### Autenticação
- JWT com refresh tokens
- Middleware de autenticação em todas as rotas protegidas
- Controle de acesso baseado em roles (ADMIN, MODERATOR, PRESENTER)

### Dispositivos
- Whitelist de dispositivos autorizados
- Identificação única por hardware
- Autorização manual pelo administrador

### Transmissão
- Tokens temporários para acesso às salas
- Controle de permissões por participante
- Gravação segura com armazenamento local

## 📊 Monitoramento

### Logs
- Logs estruturados em JSON
- Diferentes níveis (error, warn, info, debug)
- Rotação automática de logs

### Métricas
- Health checks em todas as aplicações
- Monitoramento de conexões de banco
- Status dos serviços de mídia

### Alertas
- Notificações para dispositivos não autorizados
- Alertas de falha de reconhecimento facial
- Monitoramento de qualidade de transmissão

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes de integração
pnpm test:integration

# Testes E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📚 Documentação

### API
- Documentação Swagger disponível em `/api/docs`
- Schemas Prisma em `apps/api/prisma/schema.prisma`

### Componentes
- Storybook para componentes React
- Documentação inline com JSDoc

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m \'Add some AmazingFeature\'`) 
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade do Senac e destinado exclusivamente para uso interno.

## 🆘 Suporte

Para suporte técnico:
- **Email**: suporte.ti@senac.br
- **Documentação**: [Wiki interno]
- **Issues**: Use o sistema de issues do repositório

---

**Portal dos Conselheiros** - Sistema interno do Senac  
Versão 1.0.0 - 2024

