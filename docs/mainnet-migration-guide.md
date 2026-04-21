# Guia de Migração: Testnet → Mainnet

## ✅ O QUE JÁ ESTÁ PRONTO PARA MAINNET

### 🔒 Segurança (Production-Ready)
- ✅ SQL Injection: Totalmente protegido com prepared statements
- ✅ Verificação de Assinatura: EVM e Solana wallet signatures
- ✅ Sistema de Nonce: Previne replay attacks
- ✅ Rate Limiting: Por IP e wallet
- ✅ CORS Policy: Apenas domínios autorizados
- ✅ Sanitização de Inputs: Validação completa
- ✅ Admin JWT: Autenticação segura
- ✅ Logging e Monitoramento: Request tracking e security alerts

### 📊 Banco de Dados (Escalável)
- ✅ Índices de Performance: Otimizado para 100k+ usuários
- ✅ Cache System: Reduz reads em 80-90%
- ✅ Anti-Sybil: 3 nodes por wallet, signature verification
- ✅ Schema Simples: Escalável e manutenível

### 🎯 Sistema de Missões (Funcional)
- ✅ Node Missions: Provider, Validator, Worker, Delegate
- ✅ Social Missions: Twitter, Telegram, Posts, Daily
- ✅ Códigos Dinâmicos: Únicos por usuário/missão
- ✅ Verificação Manual: Posts/retweets via admin
- ✅ Sistema de XP: Níveis e tier rewards

### 👥 Sistema de Referral (Completo)
- ✅ Códigos Únicos: PZR_XXXXXX format
- ✅ Tracking: Conta apenas invites que completam missão
- ✅ Rewards: 200 XP quando invitee completa primeira missão
- ✅ Leaderboard: Ranking por total XP (min 200 XP)

---

## 🔄 O QUE PRECISA MUDAR PARA MAINNET

### 1. TOKEN REAL vs XP de Teste

**Testnet (Atual):**
```typescript
// XP armazenado como número no banco
pzr_balance: REAL DEFAULT 0
node_rewards: REAL DEFAULT 0
```

**Mainnet (Necessário):**
```solidity
// Smart contract no Polygon/BSC/Ethereum
contract PozzerToken {
  mapping(address => uint256) balances;
  
  function claimTestnetRewards(
    address user,
    uint256 amount,
    bytes signature
  ) external {
    // Verify signature from backend
    // Mint tokens baseado no XP da testnet
  }
}
```

**AÇÕES:**
- [ ] Criar smart contract PZR token (ERC-20)
- [ ] Deploy em mainnet (Polygon recomendado - menor gas)
- [ ] Backend assina claims baseados no XP da testnet
- [ ] Frontend chama contract.claimTestnetRewards()
- [ ] Snapshot final da testnet antes do TGE

---

### 2. NODES REAIS vs Simulados

**Testnet (Atual):**
```typescript
// User clica "Provider Node" e ganha 1000 XP
// Não tem node real rodando
user_nodes table: apenas registro simulado
```

**Mainnet (Necessário):**
```typescript
// Verificação real de nodes
- Worker Node: Verifica uptime via heartbeat API
- Provider Node: Verifica recursos provisionados
- Validator Node: Verifica stake mínimo no contrato
- Delegate Node: Verifica delegação no staking contract
```

**AÇÕES:**
- [ ] API de Heartbeat: Nodes reportam status a cada 5 min
- [ ] Verificação de Stake: Integrar com staking contract
- [ ] Verificação de Hardware: CPU/GPU/RAM metrics
- [ ] Dashboard Real: Uptime, earnings, performance
- [ ] Penalidades: Downtime reduz rewards

---

### 3. PAGAMENTOS REAIS vs Simulados

**Testnet (Atual):**
```typescript
// Earnings calculator mostra "~120 PZR/day"
// Apenas estimativa, sem pagamentos reais
```

**Mainnet (Necessário):**
```typescript
// Smart contract distribui rewards baseado em:
- Uptime real do node
- Trabalho processado (transactions, computação)
- Stake delegado
- Performance vs outros nodes

// Pagamento on-chain a cada epoch (24h)
```

**AÇÕES:**
- [ ] Rewards Contract: Calcula earnings por node
- [ ] Epoch System: Distribuições diárias/semanais
- [ ] Claim Function: Users retiram PZR acumulado
- [ ] Treasury: Pool de tokens para distribuição

---

### 4. VERIFICAÇÕES SOCIAIS vs Manual

**Testnet (Atual):**
```typescript
// Posts/retweets → Admin aprova manualmente
// Twitter/Telegram → Código fixo (POZZER2024, DEPIN2024)
```

**Mainnet (Necessário):**
```typescript
// Integrar APIs oficiais:
- Twitter API v2: Verificar follows, retweets automáticos
- Telegram Bot API: Verificar membership em grupo
- Discord API: Verificar roles em servidor

// Reduzir trabalho manual do admin
```

**AÇÕES:**
- [ ] Twitter API Integration: Auto-verify follows/retweets
- [ ] Telegram Bot: Auto-verify group membership
- [ ] Discord Bot: Auto-verify server join
- [ ] Códigos Dinâmicos: Manter para posts criativos
- [ ] Webhook System: Updates em tempo real

---

### 5. LEADERBOARD FINAL vs Contínuo

**Testnet (Atual):**
```typescript
// Leaderboard contínuo, sempre atualizando
// Sem snapshot final
```

**Mainnet (Necessário):**
```typescript
// Snapshot da testnet antes do TGE
- Top 100: Free NFT license
- Top 1000: 80% NFT discount
- Top 5000: 50% NFT discount
- All users: Airdrop baseado em tier (1x, 1.3x, 1.6x, 2x)

// Freeze testnet database
// Mainnet leaderboard reinicia do zero
```

**AÇÕES:**
- [ ] Data Snapshot: Export testnet users + XP + tiers
- [ ] Merkle Tree: Para proof de airdrop eligibility
- [ ] Claim Period: 30-60 dias para claimar tokens
- [ ] NFT Distribution: Whitelist baseada em rank
- [ ] New Leaderboard: Sistema separado para mainnet

---

### 6. CLOUDFLARE D1 vs Production Database

**Testnet (Atual):**
```
Cloudflare D1 (SQLite)
- Free: 1,000 writes/day, 500 MB
- Paid: 100,000 writes/day, 10 GB
- Suficiente para 50k-100k usuários
```

**Mainnet (Recomendado):**
```
Opção 1: Cloudflare D1 Paid ($5/mês)
✅ Simples, já está pronto
✅ Suporta 100k usuários
❌ Limite de writes ainda pode ser problema

Opção 2: PostgreSQL (Supabase/Neon)
✅ Sem limite de writes
✅ Melhor para analytics
✅ Suporta 1M+ usuários
❌ Precisa migração do código

Opção 3: Hybrid Approach
✅ D1 para reads rápidas (cache)
✅ PostgreSQL para writes críticas
✅ Melhor performance e escalabilidade
❌ Mais complexo
```

**AÇÕES:**
- [ ] Avaliar crescimento esperado na mainnet
- [ ] Se <100k users: Manter D1 Paid
- [ ] Se >100k users: Migrar para PostgreSQL
- [ ] Monitorar uso de writes nos primeiros 30 dias

---

### 7. EMAIL RESTRICTIONS (Dev Mode)

**Testnet (Atual):**
```typescript
// Emails só para pozzerinc@gmail.com e henriquesmbc@gmail.com
// Dev mode mostra código na resposta
```

**Mainnet (Necessário):**
```typescript
// Remover restrições de email
// Remover dev_code da resposta
// Emails para qualquer endereço autorizado
```

**AÇÕES:**
- [ ] Configurar email service para produção
- [ ] Remover AUTHORIZED_ADMIN_EMAILS restriction
- [ ] Remover dev_code fallback nos endpoints
- [ ] Configurar domínio próprio (@pozzer.io)

---

### 8. WALLET CONNECT (Social Login)

**Testnet (Atual):**
```typescript
// WalletConnect com social logins (X, Discord, etc)
// Cria wallet EVM automático
```

**Mainnet (Verificar):**
```typescript
// Social login wallets são CUSTODIAL
// WalletConnect guarda as chaves, não o usuário
// Para mainnet com dinheiro real, pode ser arriscado

// Considerar:
✅ Manter social login para onboarding fácil
⚠️ Avisar usuários sobre custódia
⚠️ Recomendar migrar para wallet própria (MetaMask, Trust)
```

**AÇÕES:**
- [ ] Adicionar disclaimer: "Social wallets são custodiais"
- [ ] Criar fluxo de migração: Social → MetaMask/Trust
- [ ] Opção de export/backup da seed phrase
- [ ] Educar usuários sobre self-custody

---

## 📋 CHECKLIST PRÉ-MAINNET

### Fase 1: Smart Contracts (2-4 semanas)
- [ ] PZR Token (ERC-20)
- [ ] Staking Contract
- [ ] Rewards Distribution Contract
- [ ] NFT License Contract
- [ ] Audit de Segurança (CertiK, Hacken, etc)

### Fase 2: Node Infrastructure (4-6 semanas)
- [ ] Heartbeat API
- [ ] Node Registration System
- [ ] Resource Verification (CPU/GPU/RAM)
- [ ] Uptime Monitoring
- [ ] Earnings Calculator (real)
- [ ] Dashboard com métricas reais

### Fase 3: Testnet Freeze (1 semana)
- [ ] Anunciar data de snapshot
- [ ] Snapshot final dos dados
- [ ] Calcular tiers e airdrops
- [ ] Gerar Merkle Tree
- [ ] Freeze testnet database (read-only)

### Fase 4: TGE & Airdrop (2-3 semanas)
- [ ] Deploy contracts na mainnet
- [ ] Abrir claim period (30-60 dias)
- [ ] Distribuir NFTs (Top 100)
- [ ] Publicar merkle proofs
- [ ] Monitor claim progress

### Fase 5: Mainnet Launch (Ongoing)
- [ ] Novos usuários conectam wallets
- [ ] Nodes reais começam a rodar
- [ ] Earnings distribuídos daily/weekly
- [ ] Upgrade D1 → PostgreSQL se necessário
- [ ] Marketing e growth

---

## 💰 ESTIMATIVA DE CUSTOS

### Smart Contracts
- Development: $10k-20k (se terceirizar) ou in-house
- Audit: $15k-50k (obrigatório para segurança)
- Deploy gas fees: $500-2k (Polygon é barato)

### Infrastructure
- Database (PostgreSQL): $25-100/mês
- Cloudflare Workers: $5/mês (já tem)
- Node monitoring: $50-200/mês
- Total: ~$80-300/mês

### Marketing & Legal
- Legal/Compliance: $5k-20k (depende da jurisdição)
- Marketing: Budget variável

---

## 🎯 CONCLUSÃO

**O que você construiu está 90% pronto para mainnet!**

✅ **Pode usar direto:**
- Todo sistema de segurança
- Banco de dados e cache
- Sistema de missões e XP
- Referral tracking
- Admin dashboard
- Frontend e UX

🔄 **Precisa adicionar:**
- Smart contracts (PZR token, staking, rewards)
- Node monitoring real
- APIs de verificação social
- Testnet snapshot/freeze
- Airdrop claim system

📊 **Timeline estimado:**
- Desenvolvimento: 2-3 meses
- Audit + Deploy: 1 mês
- TGE + Airdrop: 1 mês
- **TOTAL: 4-5 meses até mainnet**

O trabalho mais difícil (segurança, UX, anti-bot) já está feito. O que falta é principalmente integração com blockchain e verificação real de nodes.
