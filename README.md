# Clash Bet - Bot de Apostas para Clash Royale

> [!NOTE] 
> Este projeto utiliza o framework [Constatic](https://github.com/rinckodev/constatic) para desenvolvimento de bots Discord modernos.
> Documentação completa: https://constatic-docs.vercel.app/docs/discord/start

Bot de apostas para Clash Royale desenvolvido com TypeScript e framework Constatic. Permite criar filas de apostas, gerenciar carteiras virtuais e organizar partidas 1v1.

> [!WARNING]
> [NodeJs](https://nodejs.org/en) versão necessária: 20.12 ou superior

## 🚀 Funcionalidades

### 🎮 Sistema de Apostas
- **Filas de Apostas**: Criação de filas para partidas 1v1
- **Sistema de Pagamento**: Pagamento automático com moedas virtuais
- **Gerenciamento de Filas**: Visualização e limpeza de filas ativas

### 💰 Sistema de Carteira
- **Carteira Virtual**: Cada usuário possui uma carteira com moedas
- **Transações**: Sistema completo de adicionar/remover moedas
- **Histórico**: Logs de todas as transações

### 👑 Comandos Administrativos
- **Gerenciamento de Moedas**: Adicionar/remover moedas de usuários
- **Configuração**: Setup de canais de logs e configurações
- **Moderação**: Limpeza e gerenciamento de filas

## 📋 Comandos Disponíveis

### Comandos Públicos
- `/ajuda` - Mostra todos os comandos disponíveis
- `/carteira [usuário]` - Verifica saldo da carteira
- `/filas` - Lista filas de apostas ativas
- `/estatisticas` - Mostra estatísticas do servidor
- `/ping` - Verifica latência do bot
- `/counter` - Comando de exemplo

### Comandos de Administração
- `/fila` - Cria nova fila de apostas
- `/adicionar_moedas` - Adiciona moedas a um usuário
- `/remover_moedas` - Remove moedas de um usuário
- `/limpar_fila` - Limpa filas de apostas
- `/configurar` - Configura canais do bot

## 🛠️ Scripts

- `dev`: Executa o bot em modo de desenvolvimento
- `build`: Compila o projeto
- `watch`: Executa em modo watch
- `start`: Executa o bot compilado

## 🏗️ Estrutura do Projeto

- **Commands**: Comandos slash do Discord
- **Responders**: Handlers para botões, menus e modais
- **Events**: Eventos do Discord (mensagens, interações, etc.)
- **Database**: Schemas do MongoDB para dados persistentes
- **Functions**: Funções utilitárias e menus

## 🔧 Configuração

### 🐳 Usando Docker (Recomendado)

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd clash-mvp
   ```

2. **Execute o script de configuração**
   
   **Windows:**
   ```cmd
   scripts\docker-setup.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x scripts/docker-setup.sh
   ./scripts/docker-setup.sh
   ```

3. **Configure o arquivo `.env`**
   ```env
   BOT_TOKEN=seu_token_do_bot
   MONGO_URI=mongodb://clash_bot:bot_password_123@localhost:27017/clash_bet
   ```

4. **Acesse as interfaces**
   - **MongoDB**: `localhost:27017`
   - **Mongo Express**: `http://localhost:8081` (admin/admin123)

### 💻 Desenvolvimento Local

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure o MongoDB localmente**
   ```bash
   # Usando Docker apenas para o banco
   docker-compose -f docker-compose.dev.yml up -d mongodb
   ```

3. **Configure as variáveis de ambiente**
   ```env
   BOT_TOKEN=seu_token_do_bot
   MONGO_URI=mongodb://clash_bot:bot_password_123@localhost:27017/clash_bet
   ```

4. **Execute em desenvolvimento**
   ```bash
   npm run dev
   ```

### 🚀 Comandos Docker Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs do bot
docker-compose logs -f bot

# Parar todos os serviços
docker-compose down

# Reconstruir e reiniciar
docker-compose up -d --build

# Apenas o banco de dados
docker-compose up -d mongodb mongo-express

# Desenvolvimento (apenas MongoDB)
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d

# Monitoramento (Prometheus + Grafana)
docker-compose -f monitoring/docker-compose.monitoring.yml up -d
```

### 🔧 Scripts de Utilidade

```bash
# Configuração automática
scripts/docker-setup.sh        # Linux/Mac
scripts\docker-setup.bat       # Windows

# Verificação de saúde
scripts/health-check.sh        # Linux/Mac
scripts\health-check.bat       # Windows

# Backup do banco de dados
scripts/backup-mongodb.sh      # Linux/Mac
scripts\backup-mongodb.bat     # Windows
```

### 📊 Monitoramento

- **Mongo Express**: `http://localhost:8081` - Interface web para MongoDB
- **Prometheus**: `http://localhost:9090` - Métricas do sistema
- **Grafana**: `http://localhost:3000` - Dashboards (admin/admin123)

## 📚 Documentação

- [Constatic Docs](https://constatic-docs.vercel.app/docs/discord/start)
- [Discord.js](https://discord.js.org/)
- [MongoDB](https://www.mongodb.com/)

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.