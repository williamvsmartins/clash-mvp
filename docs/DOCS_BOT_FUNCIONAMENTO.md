# 🎮 ClashBet - Bot de Apostas Clash Royale

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Fluxo de Apostas](#fluxo-de-apostas)
- [Sistema de Carteira](#sistema-de-carteira)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Sistema de Suporte](#sistema-de-suporte)
- [Arquitetura do Banco de Dados](#arquitetura-do-banco-de-dados)
- [Integrações Externas](#integrações-externas)
- [Configuração e Instalação](#configuração-e-instalação)

## 🎯 Visão Geral

O **ClashBet** é um bot Discord completo para apostas em partidas de Clash Royale. Ele permite que usuários registrem suas tags do Clash Royale, depositem dinheiro, apostem em partidas 1v1 e saquem seus ganhos através de PIX.

### Características Principais:
- ✅ Sistema completo de apostas 1v1
- 💰 Carteira digital com depósito/saque via PIX
- 🛡️ Validação de tags do Clash Royale via API oficial
- 🎫 Sistema de suporte com tickets
- 📊 Histórico completo de transações
- 🔄 Automação completa do fluxo de apostas

## 🚀 Funcionalidades Principais

### 1. **Registro de Usuários**
- Validação de tag do Clash Royale via API oficial
- Atribuição automática de cargo de "registrado"
- Criação de perfil no banco de dados

### 2. **Sistema de Fila de Apostas**
- Criação de filas com valores personalizados
- Entrada/saída automática da fila
- Pareamento automático de jogadores
- Canais privados para cada partida

### 3. **Gerenciamento Financeiro**
- Depósitos via PIX (integração preparada para Mercado Pago)
- Saques via PIX com validação de chave
- Controle de saldo em tempo real
- Histórico completo de transações

### 4. **Sistema de Suporte**
- Tickets categorizados (Denúncia, Reembolso, Dúvidas)
- Canais privados automáticos
- Integração com equipe de suporte

## 🎮 Fluxo de Apostas

### Passo 1: Registro
```
🔸 Usuário usa /registro em um canal
🔸 Clica no botão "Adicionar Tag do Clash Royale"
🔸 Insere sua tag (ex: #ABC123)
🔸 Bot valida via API oficial do Clash Royale
🔸 Usuário recebe cargo de "registrado"
```

### Passo 2: Depósito
```
🔸 Usuário acessa canal de carteira
🔸 Clica em "Depositar"
🔸 Insere valor (mínimo R$ 1,25 incluindo taxa)
🔸 Recebe instruções de pagamento PIX
🔸 Saldo é creditado após confirmação
```

### Passo 3: Entrada na Fila
```
🔸 Staff cria fila com /fila [valor] [canal]
🔸 Usuário clica em "Entrar na Fila"
🔸 Bot verifica saldo suficiente
🔸 Usuário é adicionado à fila
🔸 Quando 2 jogadores entram, partida é criada
```

### Passo 4: Confirmação da Partida
```
🔸 Canal privado é criado para os 2 jogadores
🔸 Ambos devem clicar em "Aceitar"
🔸 Valor da aposta é descontado de ambos
🔸 Jogadores podem enviar link de amizade do Clash
🔸 Partida fica ativa para finalização
```

### Passo 5: Finalização
```
🔸 Vencedor clica em "Finalizar Partida"
🔸 Recebe o dobro do valor apostado
🔸 Histórico é registrado no banco
🔸 Canal é deletado automaticamente
```

## 💰 Sistema de Carteira

### Depósitos
- **Valor mínimo**: R$ 1,25 (incluindo taxa de R$ 0,25)
- **Método**: PIX
- **Validação**: Automática (preparado para Mercado Pago)
- **Registro**: Salvo no Notion para controle

### Saques
- **Valor mínimo**: R$ 5,00
- **Método**: PIX
- **Validação**: Chave PIX é validada antes do saque
- **Prazo**: Até 24h
- **Registro**: Salvo no Notion com dados completos

### Controle de Saldo
- Armazenado em **centavos** para precisão
- Transações registradas com tipo e descrição
- Consulta instantânea via botão "Saldo"

## 🎯 Comandos Disponíveis

### Comandos Públicos
| Comando | Descrição | Parâmetros |
|---------|-----------|------------|
| `/registro` | Cria botão para registro de tag | canal |
| `/carteira` | Cria interface da carteira | canal |
| `/support` | Cria menu de suporte | canal |
| `/values` | Exibe tabela de preços | canal |
| `/ping` | Teste de latência | - |
| `/counter` | Exemplo de contador | - |

### Comandos Staff
| Comando | Descrição | Parâmetros |
|---------|-----------|------------|
| `/fila` | Cria nova fila de apostas | valor, canal |

### Botões e Modais
- **Registro**: `add_tag` → `clash_tag_modal`
- **Carteira**: `deposito`, `saldo`, `sacar` → modals respectivos
- **Apostas**: `bet/queue/enter_bet`, `bet/queue/leave_bet`
- **Confirmação**: `bet/match/accept`, `bet/match/cancel`
- **Suporte**: `ticket_select` → criação de canal privado

## 🎫 Sistema de Suporte

### Tipos de Ticket
1. **Denúncia** → Canal: `denuncia-{username}`
2. **Pagamento Errado** → Canal: `reembolso-{username}`
3. **Dúvidas** → Canal: `duvida-{username}`

### Funcionamento
- Select menu com 3 opções
- Criação automática de canal privado
- Permissões restritas ao usuário e staff
- Notificação automática da equipe

## 🗄️ Arquitetura do Banco de Dados

### Schemas MongoDB

#### User
```typescript
{
  userId: string (unique),
  clashTag: string,
  moedas: number (default: 0)
}
```

#### Transaction
```typescript
{
  userId: string,
  type: string, // 'depósito', 'saque', 'desconto'
  amount: number, // em centavos
  description: string,
  date: Date
}
```

#### Confirmation
```typescript
{
  channelId: string (unique),
  user1: string,
  user2: string,
  messageId: string,
  date: Date,
  price: number
}
```

#### Guild
```typescript
{
  guildId: string (unique),
  fixedMessageId: string
}
```

#### Match
```typescript
{
  channelId: string (unique),
  match: string,
  winner: string,
  date: string
}
```

## 🔗 Integrações Externas

### APIs Utilizadas
1. **Clash Royale API** (`proxy.royaleapi.dev`)
   - Validação de tags de usuário
   - Verificação de existência do jogador

2. **Notion API**
   - Registro de saques para controle manual
   - Registro de depósitos para auditoria

3. **PIX Utils**
   - Geração de códigos PIX
   - Validação de chaves PIX

4. **Mercado Pago** (preparado)
   - Processamento de pagamentos
   - Confirmação automática de depósitos

### Webhooks
- Configurado para logs de erro via webhook Discord

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js 20.12+
- MongoDB
- Token do bot Discord
- API key do Clash Royale
- Chaves das APIs externas (opcional)

### Variáveis de Ambiente
```env
# Discord
BOT_TOKEN=seu_token_aqui
GUILD_ID=id_do_servidor

# MongoDB
MONGO_URI=mongodb://localhost:27017/clash-mvp

# Clash Royale API
API_TOKEN=sua_api_key_aqui

# Mercado Pago (opcional)
MERCADO_PAGO_TOKEN=seu_token_mp

# Notion (opcional)
NOTION_API_KEY=sua_api_key_notion
DATABASE_ID=id_database_saques
DATABASE_DEPOSIT_ID=id_database_depositos

# Discord IDs (opcional)
REGISTERED_ROLE_ID=id_cargo_registrado
SUPORTE_ROLE_ID=id_cargo_suporte

# Configurações
RATE=0.25  # Taxa em reais
```

### Scripts Disponíveis
```bash
npm run dev        # Desenvolvimento
npm run build      # Build do projeto
npm run start      # Produção
npm run watch      # Watch mode
npm run up         # Docker MongoDB
```

### Estrutura de Pastas
```
src/
├── discord/
│   ├── commands/      # Comandos slash
│   ├── events/        # Eventos do Discord
│   ├── responders/    # Botões e modals
│   └── base/          # Arquitetura base
├── database/          # Schemas MongoDB
├── functions/         # Lógica de negócio
└── settings/          # Configurações
```

## 🎯 Tabela de Preços

| Valor Aposta | Prêmio | Taxa |
|--------------|--------|------|
| R$ 1,25 | R$ 2,00 | R$ 0,25 |
| R$ 2,25 | R$ 4,00 | R$ 0,25 |
| R$ 3,25 | R$ 6,00 | R$ 0,25 |
| R$ 5,25 | R$ 10,00 | R$ 0,25 |
| R$ 10,25 | R$ 20,00 | R$ 0,25 |

## 🔒 Segurança e Validações

- ✅ Validação de tags via API oficial
- ✅ Verificação de saldo antes de apostas
- ✅ Validação de chaves PIX
- ✅ Controle de permissões em canais
- ✅ Logs detalhados de transações
- ✅ Sistema de cache para performance
- ✅ Tratamento de erros robusto

## 📞 Suporte

Para dúvidas sobre o funcionamento do bot, use o sistema de tickets integrado ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido por Alysson e Will**