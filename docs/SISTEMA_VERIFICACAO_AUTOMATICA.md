# 🔍 Sistema de Verificação Automática de Partidas

## 📋 Visão Geral

O sistema de verificação automática permite que o bot detecte automaticamente quem ganhou uma partida consultando a API oficial do Clash Royale, eliminando a necessidade de confirmação manual dos jogadores.

## 🏗️ Arquitetura

### Componentes Principais

#### 1. **ClashRoyaleService** (`src/functions/clash-royale/service.ts`)
- Conecta com a API oficial do Clash Royale
- Busca histórico de batalhas dos jogadores
- Identifica partidas entre dois jogadores específicos
- Extrai resultados (vencedor, coroas, troféus)

#### 2. **MatchRuleEngine** (`src/functions/clash-royale/rules.ts`)
- Sistema de regras configurável para validar partidas
- Permite adicionar/remover regras facilmente
- Executa validações em ordem de prioridade

#### 3. **MockClashRoyaleService** (`src/functions/clash-royale/mock.ts`)
- Sistema de testes com cenários pré-definidos
- Permite testar diferentes situações sem jogar partidas reais
- Ideal para desenvolvimento e debugging

#### 4. **MatchVerificationService** (`src/functions/clash-royale/index.ts`)
- Orchestrador principal que combina todos os componentes
- Gerencia configurações (mock vs real, timeouts, etc.)
- Interface unificada para verificação

## 🚀 Como Usar

### Modo de Desenvolvimento (Mock)

```bash
# O modo mock é ativado automaticamente em desenvolvimento
NODE_ENV=development npm run dev
```

### Comandos Staff

#### `/clash-test status`
Mostra o status atual do sistema:
- ✅/❌ API Real (online/offline)
- ✅/❌ Mock (disponível/indisponível) 
- ⚙️ Modo atual (Real/Mock)
- 🕐 Timeout configurado
- ✅ Status da validação

#### `/clash-test mock`
Ativa o modo mock para testes
```
/clash-test mock
```

#### `/clash-test real`
Ativa o modo real (API oficial)
```
/clash-test real
```

#### `/clash-test scenarios`
Lista todos os cenários mock disponíveis
```
/clash-test scenarios
```

#### `/clash-test set_scenario`
Define qual cenário usar nos testes
```
/clash-test set_scenario PLAYER1_WINS_3_0
```

#### `/clash-test verify`
Testa a verificação entre duas tags
```
/clash-test verify #PLAYER1 #PLAYER2
```

#### `/clash-test validate`
Valida se duas tags existem na API
```
/clash-test validate #ABC123 #DEF456
```

#### `/clash-test rules`
Lista todas as regras de validação ativas
```
/clash-test rules
```

## 🔒 Verificação Obrigatória

### Princípio Fundamental
**ZERO CONFIANÇA NO USUÁRIO** - O sistema só aceita resultados que podem ser verificados na API oficial do Clash Royale.

### Como Funciona

1. **Jogador clica "Finalizar Partida"**
   - Sistema busca imediatamente na API
   - Mostra "Verificando resultado na API do Clash Royale..."

2. **Se a partida for encontrada:**
   - ✅ Premia o vencedor automaticamente
   - 📝 Registra no histórico
   - 🏆 Exibe resultado detalhado
   - ⏰ Agenda exclusão do canal em 30s

3. **Se a partida NÃO for encontrada:**
   - ❌ Exibe motivos possíveis
   - 🔄 Oferece botão "Tentar Novamente"
   - 📊 Mostra contador de tentativas (máx. 10)
   - ⏰ Sugere aguardar 2-3 minutos

4. **Tentativas esgotadas:**
   - 🚫 Remove botão "Tentar Novamente"
   - ❌ Só permite cancelar a partida
   - 💰 Reembolsa ambos os jogadores

### Vantagens

- **🛡️ Anti-fraude:** Impossível mentir sobre vitórias
- **📊 Dados precisos:** Resultados sempre corretos
- **⚖️ Justiça:** Sistema imparcial e transparente
- **🔄 Auto-retry:** Permite várias tentativas
- **⏰ Paciência:** Aguarda o jogador jogar a partida

### Casos de Uso

#### ✅ Casos que Funcionam
- Partidas em Ladder
- Classic/Grand Challenges
- Friendly Battles
- Tournaments válidos
- Jogadas dentro de 30 minutos

#### ❌ Casos que Falham
- Party Mode (2v2, etc.)
- Partidas muito antigas (>30min)
- Jogadores com perfil privado
- Modos especiais não suportados
- Tags incorretas ou alteradas

## 🎮 Fluxo da Partida

### 1. Confirmação da Partida
- Jogadores aceitam a partida no canal privado
- Sistema cria entrada na base `ActiveMatch`
- Verificação automática é **habilitada por padrão**

### 2. Durante a Partida
- Jogadores jogam normalmente no Clash Royale
- Sistema aguarda até 30 minutos pela conclusão

### 3. Finalização
### 3. Finalização
- Jogador clica em "Finalizar Partida"
- Sistema busca automaticamente na API do Clash Royale
- Se encontrar a partida: premia o vencedor imediatamente
- Se não encontrar: oferece botão "Tentar Novamente" até 10 tentativas
- **Verificação é OBRIGATÓRIA** - sem API, sem finalização

## ⚙️ Configuração Avançada

### Regras de Negócio

As regras estão em `src/functions/clash-royale/rules.ts` e podem ser facilmente modificadas:

```typescript
// Exemplo: Adicionar regra que só aceita vitórias perfeitas
addCustomRule({
    name: 'PERFECT_VICTORY_ONLY',
    description: 'Só aceita vitórias perfeitas (3 coroas)',
    priority: 85,
    validator: (result) => {
        if (!result.winner) return false;
        const winner = result.winner === result.player1.tag ? 
            result.player1 : result.player2;
        return winner.crowns === 3;
    }
});

// Remover regra que proíbe empates
removeRule('MUST_HAVE_WINNER');
```

### Regras Padrão Ativas

1. **MUST_HAVE_WINNER** - Deve haver um vencedor (não empate)
2. **WINNER_MORE_CROWNS** - Vencedor deve ter mais coroas
3. **MIN_ONE_CROWN** - Pelo menos um jogador deve ter 1+ coroa
4. **VALID_GAME_MODE** - Modo de jogo deve ser válido para apostas
5. **MAX_CROWNS_LIMIT** - Máximo 3 coroas por jogador
6. **VALID_CROWN_COUNT** - Contagem de coroas deve ser válida (0-3)

### Modos de Jogo Válidos

- Ladder
- Classic Challenge  
- Grand Challenge
- Friendly Battle
- Tournament
- PvP

## 🧪 Cenários de Teste

### Cenários Mock Disponíveis

1. **PLAYER1_WINS_3_0** - Player1 vence 3x0 (aprovado)
2. **PLAYER2_WINS_2_1** - Player2 vence 2x1 (aprovado)
3. **DRAW_1_1** - Empate 1x1 (rejeitado pelas regras)
4. **INVALID_BATTLE** - Dados inválidos (rejeitado)
5. **INVALID_GAME_MODE** - Modo não permitido (rejeitado)
6. **NO_MATCH_FOUND** - Nenhuma partida encontrada

### Como Testar

1. **Ative o modo mock:**
   ```
   /clash-test mock
   ```

2. **Defina um cenário:**
   ```
   /clash-test set_scenario PLAYER1_WINS_3_0
   ```

3. **Teste a verificação:**
   ```
   /clash-test verify #PLAYER1 #PLAYER2
   ```

4. **Ou crie uma partida real e teste o botão "Finalizar"**

## 📊 Monitoramento

### Logs Importantes

```bash
# Partida ativa criada
✅ Partida ativa criada para canal 123456789

# Verificação automática bem-sucedida
🔍 Verificação automática: PLAYER1 venceu vs PLAYER2

# Falha na verificação
❌ Verificação falhou: Nenhuma partida encontrada

# Erro na API
❌ Erro na API do Clash Royale: 429 Too Many Requests
```

### Base de Dados

#### Tabela `ActiveMatch`
```typescript
{
  channelId: string,           // ID do canal da partida
  player1UserId: string,       // ID Discord do jogador 1
  player2UserId: string,       // ID Discord do jogador 2  
  player1Tag: string,          // Tag Clash Royale do jogador 1
  player2Tag: string,          // Tag Clash Royale do jogador 2
  price: number,               // Valor da aposta (centavos)
  startTime: Date,             // Quando a partida foi confirmada
  status: string,              // 'confirmed', 'in_progress', 'finished', 'cancelled'
  autoVerificationEnabled: boolean, // Se verificação automática está ativa
  verificationAttempts: number,     // Quantas tentativas já foram feitas
  lastVerificationAttempt: Date,    // Última tentativa de verificação
  timeoutMinutes: number            // Timeout para encontrar a partida
}
```

## 🔧 Troubleshooting

### Problemas Comuns

#### "API Error: 429 - Too Many Requests"
- A API do Clash Royale tem rate limit
- Aguarde alguns minutos antes de tentar novamente
- Use modo mock para testes intensivos

#### "Nenhuma partida encontrada"
- Jogadores podem não ter jogado ainda
- Partida pode ter sido em modo não válido (Party Mode)
- Verifique se as tags estão corretas

#### "Regra violada: Modo de jogo inválido"
- Jogadores jogaram em modo não permitido
- Considere adicionar o modo às regras se apropriado

#### "Tags não encontradas"
- Tags podem estar incorretas
- Jogadores podem ter mudado de nome
- Use `/clash-test validate` para verificar

### Debug

```typescript
// Ativar logs detalhados
console.log('Debug: Verificando partida...', {
    player1Tag,
    player2Tag,
    matchStartTime,
    timeoutMinutes
});
```

## 🔒 Segurança

### Rate Limiting
- API do Clash Royale: ~100 requests/minute
- Verificações automáticas: máximo 10 tentativas por partida
- Intervalo mínimo entre tentativas: 2 minutos

### Validações
- Tags são validadas antes de consultar a API
- Resultados passam por múltiplas regras de validação
- Modo mock completamente isolado da API real

## 📈 Extensibilidade

### Adicionando Novos Cenários Mock

```typescript
// Em src/functions/clash-royale/mock.ts
addMockScenario({
    name: 'CUSTOM_SCENARIO',
    description: 'Meu cenário personalizado',
    player1Tag: '#PLAYER1',
    player2Tag: '#PLAYER2',
    result: {
        winner: '#PLAYER1',
        player1: { tag: '#PLAYER1', name: 'Player1', crowns: 3, trophyChange: 30 },
        player2: { tag: '#PLAYER2', name: 'Player2', crowns: 1, trophyChange: -30 },
        battleTime: new Date().toISOString(),
        gameMode: 'Ladder',
        arena: 'Arena Lendária',
        valid: true
    }
});
```

### Adicionando Novas Regras

```typescript
// Em src/functions/clash-royale/rules.ts
addCustomRule({
    name: 'MIN_TROPHY_CHANGE',
    description: 'Mudança de troféus deve ser maior que 20',
    priority: 75,
    validator: (result) => {
        const winner = result.winner === result.player1.tag ? 
            result.player1 : result.player2;
        return Math.abs(winner.trophyChange || 0) >= 20;
    }
});
```

## 📝 Exemplo Completo

```bash
# 1. Verificar status
/clash-test status

# 2. Ativar modo mock
/clash-test mock

# 3. Ver cenários disponíveis  
/clash-test scenarios

# 4. Definir cenário de teste
/clash-test set_scenario PLAYER1_WINS_3_0

# 5. Testar verificação
/clash-test verify #PLAYER1 #PLAYER2

# 6. Criar partida real e testar botão "Finalizar"
# (ou aguardar verificação automática em background)

# 7. Voltar para modo real em produção
/clash-test real
```

---

**⚠️ Importante:** Sempre teste em modo mock primeiro antes de usar a API real em produção!