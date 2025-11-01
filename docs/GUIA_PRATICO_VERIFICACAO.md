# 🎮 Guia Prático - Sistema de Verificação de Partidas

## 🚀 Como Testar o Sistema (Passo a Passo)

### 1. Preparação Inicial

1. **Inicie o bot em modo desenvolvimento:**
   ```bash
   npm run dev
   ```
   > O modo mock é ativado automaticamente em desenvolvimento

2. **Verifique o status do sistema:**
   ```
   /clash-test status
   ```
   Deve mostrar:
   - 🎭 Modo atual: Mock
   - ✅ Mock: Disponível
   - 🕐 Timeout: 30 minutos

### 2. Explorando os Cenários Mock

1. **Liste os cenários disponíveis:**
   ```
   /clash-test scenarios
   ```

2. **Cenários para testar:**
   - `PLAYER1_WINS_3_0` - Vitória perfeita (deve funcionar)
   - `PLAYER2_WINS_2_1` - Vitória normal (deve funcionar)
   - `DRAW_1_1` - Empate (deve ser rejeitado)
   - `INVALID_GAME_MODE` - Modo inválido (deve ser rejeitado)

### 3. Testando Verificação Manual

1. **Defina um cenário de sucesso:**
   ```
   /clash-test set_scenario PLAYER1_WINS_3_0
   ```

2. **Teste a verificação:**
   ```
   /clash-test verify #PLAYER1 #PLAYER2
   ```

3. **Resultado esperado:**
   ```
   ✅ Sucesso: Sim
   🏆 Vencedor: #PLAYER1
   👤 Player 1: TestPlayer1 (3 👑)
   👤 Player 2: TestPlayer2 (0 👑)
   🎮 Modo: Ladder
   📋 Validação: ✅ Aprovada
   📜 Regra: ALL_RULES_PASSED
   ```

### 4. Testando Cenário de Falha

1. **Defina um cenário que deve falhar:**
   ```
   /clash-test set_scenario DRAW_1_1
   ```

2. **Teste novamente:**
   ```
   /clash-test verify #PLAYER1 #PLAYER2
   ```

3. **Resultado esperado:**
   ```
   ✅ Sucesso: Não
   📋 Validação: ❌ Rejeitada
   📜 Regra: MUST_HAVE_WINNER
   ❌ Erro: Regra violada: A partida deve ter um vencedor (não pode ser empate)
   ```

### 5. Testando Partida Real no Discord

1. **Volte para um cenário de sucesso:**
   ```
   /clash-test set_scenario PLAYER1_WINS_3_0
   ```

2. **Crie uma fila de apostas:**
   ```
   /fila 125 #canal-apostas
   ```

3. **Entre na fila com dois usuários diferentes**

4. **Aceite a partida com ambos os jogadores**
   > Isso criará um canal privado e um registro `ActiveMatch`

5. **No canal da partida, clique em "Finalizar Partida"**

6. **Resultado esperado:**
   ```
   🎉 Partida Verificada e Finalizada!
   🏆 Vencedor: @PLAYER1
   ⚔️ Resultado: 3 x 0
   🎮 Modo: Ladder
   🏟️ Arena: Legendary Arena
   💰 Prêmio: R$ 2,00
   ✅ Resultado confirmado via API oficial do Clash Royale!
   ```

7. **Se a partida não for encontrada:**
   ```
   ❌ Não Foi Possível Verificar a Partida
   Motivo: Nenhuma partida encontrada no período especificado
   
   Possíveis causas:
   • Partida ainda não foi jogada
   • Partida foi jogada em modo não válido (Party Mode, etc.)
   • Partida não atende às regras de validação
   
   [🔄 Tentar Novamente] [❌ Cancelar Partida]
   ```

### 6. Testando Modo Real (Produção)

⚠️ **Cuidado:** Só faça isso se tiver tags reais do Clash Royale!

1. **Ative o modo real:**
   ```
   /clash-test real
   ```

2. **Valide suas tags primeiro:**
   ```
   /clash-test validate #SUATAG #OUTRATAGREAL
   ```

3. **Se as tags forem válidas, teste a verificação:**
   ```
   /clash-test verify #SUATAG #OUTRATAGREAL
   ```
   > Isso vai buscar partidas reais das últimas 30 minutos

## 🔧 Modificando Regras de Negócio

### Exemplo 1: Aceitar apenas vitórias perfeitas

```typescript
// Em src/functions/clash-royale/rules.ts, adicione:
addCustomRule({
    name: 'PERFECT_VICTORY_ONLY',
    description: 'Só aceita vitórias de 3 coroas',
    priority: 85,
    validator: (result) => {
        if (!result.winner) return false;
        const winner = result.winner === result.player1.tag ? 
            result.player1 : result.player2;
        return winner.crowns === 3;
    }
});
```

**Para testar:**
1. Reinicie o bot
2. Use `/clash-test set_scenario PLAYER2_WINS_2_1` (vitória 2x1)
3. Use `/clash-test verify #PLAYER1 #PLAYER2`
4. Deve falhar com "Só aceita vitórias de 3 coroas"

### Exemplo 2: Permitir empates

```typescript
// Em src/functions/clash-royale/rules.ts, remova a regra:
removeRule('MUST_HAVE_WINNER');
```

**Para testar:**
1. Reinicie o bot
2. Use `/clash-test set_scenario DRAW_1_1`
3. Use `/clash-test verify #PLAYER1 #PLAYER2`
4. Agora deve passar na validação

### Exemplo 3: Adicionar novos modos de jogo

```typescript
// Em src/functions/clash-royale/rules.ts, modifique a regra VALID_GAME_MODE:
const validModes = [
    'Ladder',
    'Classic Challenge',
    'Grand Challenge', 
    'Friendly Battle',
    'Tournament',
    'PvP',
    'Party Mode' // <- Novo modo adicionado
];
```

## 🎭 Criando Cenários Mock Personalizados

### Exemplo: Vitória com overtime

```typescript
// Em src/functions/clash-royale/mock.ts, adicione:
addMockScenario({
    name: 'OVERTIME_WIN',
    description: 'Vitória no overtime (1x0)',
    player1Tag: '#PLAYER1',
    player2Tag: '#PLAYER2',
    result: {
        winner: '#PLAYER1',
        player1: {
            tag: '#PLAYER1',
            name: 'TestPlayer1',
            crowns: 1,
            trophyChange: 28
        },
        player2: {
            tag: '#PLAYER2', 
            name: 'TestPlayer2',
            crowns: 0,
            trophyChange: -28
        },
        battleTime: new Date().toISOString(),
        gameMode: 'Ladder',
        arena: 'Legendary Arena',
        valid: true
    }
});
```

**Para usar:**
```
/clash-test set_scenario OVERTIME_WIN
/clash-test verify #PLAYER1 #PLAYER2
```

## 📊 Logs e Debugging

### Logs Importantes para Acompanhar

```bash
# Terminal do bot mostrará:
✅ Partida ativa criada para canal 1234567890
🔍 Tentativa de verificação automática #1
✅ Verificação bem-sucedida: #PLAYER1 venceu
💰 Prêmio de R$ 2,00 concedido a @user123
🗑️ Canal será deletado em 30 segundos
```

### Em Caso de Problemas

1. **"Partida não encontrada":**
   - Verifique se está no modo mock correto
   - Confirme que o cenário foi definido
   - Tags devem corresponder exatamente ao cenário

2. **"Erro na API":**
   - Se no modo real, pode ser rate limit
   - Mude para modo mock temporariamente
   - Verifique sua API key do Clash Royale

3. **"Regra violada":**
   - Use `/clash-test rules` para ver regras ativas
   - Escolha um cenário compatível
   - Ou modifique as regras conforme necessário

## 🎯 Cenários de Uso Real

### Para Desenvolvimento
```bash
# Sempre use modo mock
/clash-test mock
/clash-test set_scenario PLAYER1_WINS_3_0
```

### Para Testes com Usuários
```bash
# Use cenários variados para testar edge cases
/clash-test set_scenario DRAW_1_1          # Testa rejeição de empates
/clash-test set_scenario INVALID_GAME_MODE # Testa validação de modo
/clash-test set_scenario NO_MATCH_FOUND    # Testa quando não há partida
```

### Para Produção
```bash
# Modo real com validação total
/clash-test real
# (sem definir cenários - usa API real)
```

## ⚡ Dicas de Performance

1. **Use mock para desenvolvimento:** Evita rate limits da API
2. **Cache de validação:** O sistema já implementa cache automático
3. **Timeout apropriado:** 30 minutos é um bom padrão
4. **Máximo 10 tentativas:** Evita loops infinitos

---

**🎉 Pronto!** Agora você tem um sistema completo de verificação automática de partidas que é:
- ✅ **Fácil de testar** (modo mock)
- ✅ **Configurável** (regras modificáveis)
- ✅ **Extensível** (novos cenários/regras)
- ✅ **Robusto** (validações múltiplas)
- ✅ **Monitorável** (logs detalhados)