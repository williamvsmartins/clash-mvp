# 🛠️ Guia de Boas Práticas - Desenvolvimento com @magicyan/discord

## 📋 Índice
- [Introdução](#introdução)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Comandos (Commands)](#comandos-commands)
- [Responders (Botões e Modals)](#responders-botões-e-modals)
- [Eventos (Events)](#eventos-events)
- [Banco de Dados](#banco-de-dados)
- [Configurações e Ambiente](#configurações-e-ambiente)
- [TypeScript e Imports](#typescript-e-imports)
- [Tratamento de Erros](#tratamento-de-erros)
- [Performance e Otimização](#performance-e-otimização)
- [Segurança](#segurança)
- [Deploy e Produção](#deploy-e-produção)

## 🎯 Introdução

Este guia apresenta as melhores práticas para desenvolvimento de bots Discord usando a biblioteca **@magicyan/discord** em conjunto com **Discord.js**. Baseado na arquitetura do projeto ClashBet, ele fornece diretrizes para criar código limpo, escalável e maintível.

### Principais Benefícios da Arquitetura
- ✅ **Separação de responsabilidades** clara
- ✅ **TypeScript** com tipagem forte
- ✅ **Hot reload** para desenvolvimento ágil
- ✅ **Sistema de rotas** para responders
- ✅ **Auto-discovery** de arquivos
- ✅ **Configuração centralizada**

## 🏗️ Arquitetura do Projeto

### Estrutura Base Recomendada
```
src/
├── discord/
│   ├── base/           # Arquitetura base (NÃO EDITAR)
│   ├── commands/       # Comandos slash
│   │   ├── public/     # Comandos para usuários
│   │   └── staff/      # Comandos para staff
│   ├── events/         # Eventos do Discord
│   │   └── common/     # Eventos compartilhados
│   └── responders/     # Botões, modals e selects
│       ├── buttons/    # Responders de botões
│       ├── modals/     # Responders de modais
│       └── bet/        # Responders específicos
├── database/           # Schemas e conexão
│   └── schemas/        # Modelos do banco
├── functions/          # Lógica de negócio
│   ├── discord/        # Utilitários Discord
│   ├── use_cases/      # Casos de uso
│   └── utils/          # Funções auxiliares
├── settings/           # Configurações
└── types/              # Tipos TypeScript
```

### Princípios da Arquitetura
1. **Single Responsibility**: Cada arquivo tem uma responsabilidade específica
2. **Domain-Driven**: Organização por domínio/funcionalidade
3. **Layered Architecture**: Separação clara entre camadas
4. **Dependency Injection**: Uso de imports modulares

## 📝 Padrões de Desenvolvimento

### 1. Nomenclatura de Arquivos
```bash
# Comandos
src/discord/commands/public/registro.ts     # kebab-case
src/discord/commands/staff/queue.ts

# Responders
src/discord/responders/buttons/wallet.ts   # função do componente
src/discord/responders/bet/queue.ts        # agrupado por contexto

# Schemas
src/database/schemas/user.ts               # singular
src/database/schemas/Transaction.ts        # PascalCase para classes

# Functions
src/functions/use_cases/money.ts           # caso de uso
src/functions/discord/reply.ts             # por categoria
```

### 2. Padrão de Imports
```typescript
// ✅ CORRETO - Imports organizados
import { Command } from '#base';
import { ApplicationCommandType, ChannelType } from 'discord.js';
import { Guild } from '#database';
import { env } from '#settings';

// ❌ EVITAR - Imports bagunçados
import { env } from '#settings';
import { Command } from '#base';
import { Guild } from '#database';
import { ApplicationCommandType } from 'discord.js';
```

### 3. Padrão de Exports
```typescript
// ✅ CORRETO - Export no final do arquivo
export const getMoney = async (userId: string) => { ... };
export const deposito = async (id: string, valor: number) => { ... };

// ✅ CORRETO - Index file para módulos
// src/functions/index.ts
export * from "./discord/reply.js";
export * from './use_cases/money.js';
export * from './use_cases/confirmation.js';
```

## 🎮 Comandos (Commands)

### Estrutura Básica
```typescript
import { Command } from '#base';
import { ApplicationCommandType, ChannelType } from 'discord.js';

new Command({
    name: 'exemplo',
    description: 'Descrição do comando',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'parametro',
            description: 'Descrição do parâmetro',
            type: 7, // CHANNEL
            required: true
        }
    ],
    async run(interaction) {
        // Lógica do comando
    }
});
```

### Boas Práticas para Comandos

#### 1. Validação de Entrada
```typescript
async run(interaction) {
    const channelOption = interaction.options.getChannel('canal', true);

    // ✅ Validar tipo de canal
    if (channelOption.type !== ChannelType.GuildText) {
        await interaction.reply({
            content: 'Por favor, selecione um canal de texto!',
            ephemeral: true
        });
        return;
    }

    // ✅ Validar existência
    const channel = await interaction.guild!.channels.fetch(channelOption.id);
    if (!channel || !channel.isTextBased()) {
        await interaction.reply({
            content: 'Canal inválido!',
            ephemeral: true
        });
        return;
    }
}
```

#### 2. Separação por Nível de Acesso
```typescript
// src/discord/commands/public/  - Comandos para todos
// src/discord/commands/staff/   - Comandos para administradores
// src/discord/commands/owner/   - Comandos para donos (se houver)
```

#### 3. Uso de Opções Typed
```typescript
// ✅ CORRETO - Usar getters tipados
const valor = interaction.options.getInteger('valor', true);
const canal = interaction.options.getChannel('canal', true);
const usuario = interaction.options.getUser('usuario', false);

// ❌ EVITAR - Usar get genérico
const valor = interaction.options.get('valor')?.value;
```

## 🎛️ Responders (Botões e Modals)

### Sistema de Rotas
O @magicyan/discord oferece um sistema de rotas poderoso para responders:

```typescript
// ✅ Rota simples
new Responder({
    customId: 'deposito',
    type: ResponderType.Button,
    cache: 'cached',
    run(interaction) { ... }
});

// ✅ Rota com parâmetros
new Responder({
    customId: 'remind/:date',
    type: ResponderType.Button,
    parse: params => ({ date: new Date(params.date) }),
    run(interaction, { date }) { ... }
});

// ✅ Rota complexa
new Responder({
    customId: 'bet/queue/:action',
    type: ResponderType.Button,
    run(interaction, { action }) { ... }
});
```

### Organização de Responders

#### 1. Por Tipo de Componente
```typescript
// src/discord/responders/buttons/wallet.ts
new Responder({
    customId: 'deposito',
    type: ResponderType.Button,
    // ...
});

// src/discord/responders/modals/deposit-modal.ts
new Responder({
    customId: 'deposito_modal',
    type: ResponderType.Modal,
    // ...
});
```

#### 2. Por Contexto/Funcionalidade
```typescript
// src/discord/responders/bet/queue.ts
new Responder({
    customId: 'bet/queue/enter_bet',
    // ...
});

new Responder({
    customId: 'bet/queue/leave_bet',
    // ...
});
```

### Boas Práticas para Responders

#### 1. Validações de Entrada
```typescript
new Responder({
    customId: 'deposito_modal',
    type: ResponderType.Modal,
    async run(interaction) {
        const valorInput = interaction.fields.getTextInputValue("depositoModal");

        // ✅ Validar formato
        const regex = /^[0-9]+([.,][0-9]{1,2})?$/;
        if (!regex.test(valorInput)) {
            await interaction.reply({
                content: "O valor inserido é inválido. Use o formato '10.50' ou '10,50'.",
                ephemeral: true,
            });
            return;
        }

        // ✅ Validar range
        const valorCentavos = Math.round(parseFloat(valorInput.replace(",", ".")) * 100);
        if (valorCentavos < 100) {
            await interaction.reply({
                content: "O valor deve ser maior ou igual a R$ 1,00.",
                ephemeral: true,
            });
            return;
        }
    }
});
```

#### 2. Tratamento de Estados
```typescript
// ✅ Usar defer para operações longas
async run(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    // Operação demorada...
    await processSomething();
    
    await interaction.followUp({
        content: "Operação concluída!",
        ephemeral: true,
    });
}

// ✅ Usar update para modificar mensagem
async run(interaction) {
    await interaction.update(newMessageContent);
}
```

## 📡 Eventos (Events)

### Estrutura Básica
```typescript
import { Event } from '#base';

new Event({
    name: 'Nome do evento',
    event: 'eventName',
    once: false, // ou true para eventos únicos
    async run(...args) {
        // Lógica do evento
    }
});
```

### Eventos Essenciais

#### 1. Ready Event
```typescript
// src/discord/events/ready.ts
import { Event } from '#base';
import { connectDatabase } from '#database';

new Event({
    name: 'ready',
    event: 'ready',
    once: true,
    async run(client) {
        console.log(`🤖 Bot está online como ${client.user.tag}`);
        
        // ✅ Conectar dependências
        await connectDatabase();
        
        console.log('✅ Todos os sistemas operacionais!');
    }
});
```

#### 2. Error Handling
```typescript
// src/discord/events/common/error.ts
import { Event } from "#base";
import { log } from "#settings";

new Event({
    name: "Error handler",
    event: "error",
    async run(error) {
        log.error(error);
        // ✅ Adicionar logging personalizado
    },
});
```

## 🗄️ Banco de Dados

### Schemas com Mongoose

#### 1. Estrutura Básica
```typescript
// src/database/schemas/user.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    clashTag: String,
    moedas: { type: Number, default: 0.0 }
});

export const User = mongoose.model('User', userSchema);
```

#### 2. Schemas Complexos
```typescript
// src/database/schemas/transaction.ts
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['depósito', 'saque', 'desconto', 'premio']
    },
    amount: { type: Number, required: true }, // em centavos
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

// ✅ Adicionar índices para performance
transactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
```

### Use Cases para Banco de Dados

#### 1. Funções Puras
```typescript
// src/functions/use_cases/money.ts
import { User, Transaction } from '#database';

export const getMoney = async (userId: string): Promise<number> => {
    try {
        const user = await User.findOne({ userId });
        return user?.moedas ?? 0;
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        return 0;
    }
};

export const deposito = async (id: string, valor: number) => {
    try {
        // ✅ Usar transações para operações críticas
        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ userId: id }).session(session);
        if (user) {
            user.moedas += valor;
            await user.save({ session });

            await Transaction.create([{
                userId: id,
                type: 'depósito',
                amount: valor,
                description: 'Depósito realizado',
            }], { session });
        }

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        console.log('Erro ao realizar depósito:', error);
        // ✅ Fazer rollback em caso de erro
        await session.abortTransaction();
        session.endSession();
    }
};
```

## ⚙️ Configurações e Ambiente

### Validação de Ambiente com Zod
```typescript
// src/settings/env.ts
import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string().min(1, "Discord Bot Token is required"),
    GUILD_ID: z.string().min(1, "Guild ID is required"),
    MONGO_URI: z.string().min(1, "MongoDB URI is required"),
    API_TOKEN: z.string().min(1, "Clash Royale API Token is required"),
    
    // ✅ Usar optional com defaults
    MERCADO_PAGO_TOKEN: z.string().optional().default(""),
    RATE: z.string().transform(Number).default("10"),
});

// ✅ Validar na inicialização
const parsed = envSchema.parse(process.env);
export const env = parsed;
```

### Settings Centralizadas
```typescript
// src/settings/index.ts
import settingsJson from "../settings.json" with { type: "json" };

export const settings = settingsJson;

// settings.json
{
  "colors": {
    "primary": "#5865F2",
    "success": "#57F287",
    "danger": "#ED4245"
  },
  "emojis": {
    "success": "✅",
    "error": "❌"
  }
}
```

## 📦 TypeScript e Imports

### Path Mapping
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "#database": ["./database/index.ts"],
      "#base": ["./discord/base/index.ts"],
      "#functions": ["./functions/index.ts"],
      "#settings": ["./settings/index.ts"]
    }
  }
}

// package.json
{
  "imports": {
    "#database": ["./build/database/index.js"],
    "#base": ["./build/discord/base/index.js"],
    "#functions": ["./build/functions/index.js"],
    "#settings": ["./build/settings/index.js"]
  }
}
```

### Tipos Personalizados
```typescript
// src/types/metadata.ts
import { Client, Guild, GuildTextBasedChannel } from "discord.js";

export interface QueueMetadata {
    client: Client<true>;
    guild: Guild;
    channel: GuildTextBasedChannel;
}

// Uso em funções
export const processQueue = (metadata: QueueMetadata) => {
    // ✅ Tipagem forte garante segurança
};
```

## 🚨 Tratamento de Erros

### Global Error Handling
```typescript
// src/settings/error.ts
export async function onError(error: any, client: Client<true>) {
    log.error(error);

    // ✅ Log para webhook se configurado
    if (process.env.WEBHOOK_LOGS_URL) {
        const embed = createEmbed({
            color: settings.colors.danger,
            description: codeBlock("ts", error.stack),
        });

        new WebhookClient({ url: process.env.WEBHOOK_LOGS_URL })
            .send({ embeds: [embed] }).catch(log.error);
    }
}
```

### Try-Catch Patterns
```typescript
// ✅ CORRETO - Try-catch com logs específicos
export const getMoney = async (userId: string): Promise<number> => {
    try {
        const user = await User.findOne({ userId });
        return user?.moedas ?? 0;
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        return 0; // ✅ Valor padrão seguro
    }
};

// ✅ CORRETO - Try-catch em responders
new Responder({
    customId: 'deposito_modal',
    type: ResponderType.Modal,
    async run(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            
            // Lógica principal...
            
            await interaction.followUp({
                content: "Sucesso!",
                ephemeral: true,
            });
        } catch (error) {
            console.error('Erro no depósito:', error);
            
            // ✅ Feedback para usuário
            await interaction.followUp({
                content: "Erro interno. Tente novamente.",
                ephemeral: true,
            }).catch(() => {});
        }
    }
});
```

## 🚀 Performance e Otimização

### Cache Strategy
```typescript
// ✅ Usar cache em responders
new Responder({
    customId: 'saldo',
    type: ResponderType.Button,
    cache: 'cached', // ✅ Cache automático
    async run(interaction) {
        // ...
    }
});
```

### Database Optimization
```typescript
// ✅ Usar select para buscar apenas campos necessários
const user = await User.findOne({ userId }).select('moedas');

// ✅ Usar índices apropriados
transactionSchema.index({ userId: 1, date: -1 });

// ✅ Usar agregações para operações complexas
const totalDeposits = await Transaction.aggregate([
    { $match: { type: 'depósito' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
]);
```

### Memory Management
```typescript
// ✅ Limpar Maps quando necessário
export const matchData = new Map<string, MatchData>();

// Após uso
confirmations.delete(channelId);
matchData.delete(channelId);
```

## 🔐 Segurança

### Validação de Permissões
```typescript
new Responder({
    customId: "bet/match/accept",
    type: ResponderType.Button,
    async run(interaction) {
        // ✅ Validar se usuário pode executar ação
        if (userId !== user1 && userId !== user2) {
            await interaction.reply({
                content: '❌ Você não é um dos jogadores desta partida!',
                ephemeral: true
            });
            return;
        }
    }
});
```

### Sanitização de Dados
```typescript
// ✅ Validar e sanitizar entrada
let clashTag = interaction.fields.getTextInputValue('clashTag');

if (clashTag.startsWith('#')) {
    clashTag = clashTag.slice(1);
}

clashTag = clashTag.toUpperCase();

// ✅ Validar com regex
if (!/^[A-Z0-9]{8,}$/.test(clashTag)) {
    await interaction.reply({
        content: 'Tag inválida! Use o formato correto.',
        ephemeral: true
    });
    return;
}
```

### Rate Limiting
```typescript
// ✅ Implementar cooldowns para ações críticas
const cooldowns = new Map<string, number>();

new Responder({
    customId: 'deposito',
    type: ResponderType.Button,
    async run(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        
        if (cooldowns.has(userId)) {
            const timeLeft = cooldowns.get(userId)! - now;
            if (timeLeft > 0) {
                await interaction.reply({
                    content: `Aguarde ${Math.ceil(timeLeft / 1000)}s antes de tentar novamente.`,
                    ephemeral: true
                });
                return;
            }
        }
        
        cooldowns.set(userId, now + 30000); // 30s cooldown
        
        // Lógica principal...
    }
});
```

## 🚀 Deploy e Produção

### Environment Setup
```bash
# .env.production
NODE_ENV=production
BOT_TOKEN=prod_token
MONGO_URI=mongodb+srv://...
NODE_OPTIONS="--no-warnings --no-deprecation"
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Process Management
```bash
# Usar PM2 para produção
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'clash-bot',
    script: './build/index.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};

pm2 start ecosystem.config.js
```

## 📚 Snippets VS Code

O projeto inclui snippets úteis em `.vscode/project.code-snippets`:

```typescript
// new.command - Criar comando básico
new Command({
    name: "exemplo",
    description: "Descrição",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        // ...
    }
});

// new.responder - Criar responder
new Responder({
    customId: "example/component/button",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        // ...
    },
});

// new.event - Criar evento
new Event({
    name: "Nome do evento",
    event: "eventName",
    async run(...args) {
        // ...
    }
});
```

## 🎯 Checklist de Qualidade

### ✅ Antes de Fazer Commit
- [ ] Código segue padrões de nomenclatura
- [ ] Imports organizados corretamente
- [ ] Tratamento de erros implementado
- [ ] Validações de entrada presentes
- [ ] Tipos TypeScript corretos
- [ ] Logs apropriados adicionados
- [ ] Performance considerada
- [ ] Segurança validada

### ✅ Antes de Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Build gerado sem erros
- [ ] Testes básicos realizados
- [ ] Backup do banco de dados
- [ ] Monitoramento configurado
- [ ] Rollback plan definido

## 📖 Recursos Adicionais

### Documentações Oficiais
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Ferramentas Recomendadas
- **VS Code** com extensões Discord.js
- **MongoDB Compass** para gerenciar banco
- **Postman** para testar APIs
- **PM2** para produção
- **Docker** para containerização

---

**Este guia deve ser atualizado conforme o projeto evolui. Contribuições são bem-vindas!** 🚀