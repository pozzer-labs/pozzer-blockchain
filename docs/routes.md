# Pozzer - Rotas de Acesso

Documentação completa de todas as rotas e endpoints da plataforma Pozzer.

---

## 🌐 Rotas Públicas (Frontend)

| Rota | Descrição |
|------|-----------|
| `/` | Home - página inicial com visão geral do projeto |
| `/explorer` | DePIN Explorer - monitoramento em tempo real da rede |
| `/testnet` | Testnet - programa de recompensas XP |
| `/tokenomics` | Tokenomics - distribuição e utilidade do token PZR |
| `/roadmap` | Roadmap - fases de desenvolvimento do projeto |
| `/admin` | Painel administrativo (requer login) |

---

## 🔓 APIs Públicas (sem autenticação)

Endpoints acessíveis publicamente para integração externa.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/network-stats` | Estatísticas da rede (uptime, nodes, devices) |
| `GET` | `/api/validators` | Lista completa de validadores |

### Exemplo de uso:
```bash
curl https://pozzer.io/api/network-stats
curl https://pozzer.io/api/validators
```

---

## 🔐 APIs da Testnet (públicas, com rate limiting)

Endpoints para o programa de testnet. Protegidos por rate limiting.

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| `GET` | `/api/testnet/status` | Status de bloqueio/countdown | - |
| `POST` | `/api/testnet/early-access` | Verificar senha de acesso antecipado | - |
| `GET` | `/api/testnet/nonce/:wallet` | Obter nonce para assinatura de carteira | - |
| `POST` | `/api/testnet/connect` | Conectar/registrar carteira | 5/min |
| `GET` | `/api/testnet/user/:wallet` | Dados do usuário (XP, missões, nível) | - |
| `POST` | `/api/testnet/mission/complete` | Completar uma missão | 10/min |
| `GET` | `/api/testnet/leaderboard` | Ranking de usuários (mín. 200 XP) | - |
| `GET` | `/api/testnet/stats` | Estatísticas gerais da testnet | - |

### Parâmetros importantes:

**POST /api/testnet/connect**
```json
{
  "wallet": "0x...",
  "signature": "assinatura da carteira",
  "message": "mensagem assinada",
  "referralCode": "código opcional"
}
```

**POST /api/testnet/mission/complete**
```json
{
  "wallet": "0x...",
  "missionId": "twitter_follow",
  "verificationCode": "POZZER2024"
}
```

---

## 🔒 APIs do Admin (JWT obrigatório)

Endpoints protegidos por autenticação JWT. Requer login em `/admin`.

### Setup e Autenticação

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| `GET` | `/api/admin/check-setup` | Verificar se admin existe | - |
| `POST` | `/api/admin/send-verification-code` | Enviar código por email | 3/15min |
| `POST` | `/api/admin/verify-and-create` | Criar conta admin com código | - |
| `POST` | `/api/admin/login` | Login admin | 5/15min |

### Dashboard e Gestão

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/admin/stats` | Estatísticas do dashboard |
| `GET` | `/api/admin/verifications/pending` | Verificações de missões pendentes |
| `POST` | `/api/admin/verifications/:id/review` | Aprovar/rejeitar verificação |
| `GET` | `/api/admin/users` | Lista paginada de usuários |
| `POST` | `/api/admin/users/:wallet/adjust-xp` | Ajustar XP de usuário |
| `POST` | `/api/admin/users/:wallet/ban` | Banir/desbanir usuário |

### Segurança e Monitoramento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/admin/security/logs` | Logs de requisições |
| `GET` | `/api/admin/security/suspicious` | IPs suspeitos detectados |

### Headers obrigatórios:
```
Authorization: Bearer <jwt_token>
```

---

## 🛡️ Segurança

### Rate Limiting
- Conexão de carteira: 5 tentativas por minuto
- Completar missão: 10 tentativas por minuto
- Login admin: 5 tentativas por 15 minutos
- Envio de código: 3 tentativas por 15 minutos

### CORS
Apenas origens autorizadas:
- `https://pozzer.io`
- `https://www.pozzer.io`
- `https://preview.pozzer.io`
- `http://localhost:5173` e `http://localhost:4173` (desenvolvimento)

### Autenticação
- **Testnet**: Verificação de assinatura de carteira (nonce + signature)
- **Admin**: JWT com expiração de 24 horas + bcrypt para senhas

---

## 📧 Emails Autorizados (Admin)

Apenas estes emails podem criar contas admin:
- `pozzerinc@gmail.com`
- `henriquesmbc@gmail.com`

---

## 🔑 Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `API_KEY` | Chave para APIs protegidas (legado) |
| `ADMIN_JWT_SECRET` | Secret para tokens JWT do admin |
| `TESTNET_UNLOCK_DATE` | Data de desbloqueio da testnet (ISO 8601) |
| `TESTNET_EARLY_ACCESS_PASSWORD` | Senha para acesso antecipado |
| `WALLETCONNECT_PROJECT_ID` | Project ID do WalletConnect |

---

*Última atualização: Março 2025*
