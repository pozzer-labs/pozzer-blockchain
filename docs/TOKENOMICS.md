# Pozzer Tokenomics

**Token**: PZR (Pozzer Token)  
**Type**: Utility Token  
**Total Supply**: TBD (Mainnet launch)  
**Network**: Multi-chain (Ethereum, Polygon, BSC, Arbitrum)

---

## 1. Token Distribution

### 1.1 Allocation Breakdown

| Category | Allocation | Vesting | Purpose |
|----------|------------|---------|---------|
| **Testnet Rewards** | 15% | Immediate (airdrop) | Early adopter incentives |
| **Node Operators** | 30% | 4-year linear | DePIN infrastructure providers |
| **Team & Development** | 20% | 4-year with 1-year cliff | Core team, advisors |
| **Community Treasury** | 15% | DAO-governed | Ecosystem grants, bounties |
| **Liquidity Provision** | 10% | Immediate | DEX liquidity pools |
| **Strategic Partnerships** | 5% | 2-year linear | Integration partners |
| **Reserve Fund** | 5% | Unlocked as needed | Emergency, market stabilization |

**Total**: 100%

---

## 2. Testnet Airdrop Program

### 2.1 XP System (Current Phase)

During testnet, users earn **XP (Experience Points)** which will convert to **PZR tokens** at mainnet launch.

**Conversion Rate**: TBD (announced before mainnet)  
**Snapshot Date**: TBD (minimum 30 days notice)

### 2.2 XP Earning Opportunities

#### Node Operation Missions

| Mission | XP Reward | Requirements |
|---------|-----------|--------------|
| **Provider Node** | 1,000 XP | Run compute provider node |
| **Validator Node** | 2,000 XP | Operate validator node (high stake) |
| **Worker Node** | 700 XP | Run worker/edge compute node |
| **Delegate Stake** | 400 XP | Delegate to existing validator |

**Limit**: Maximum 3 node missions per wallet (anti-Sybil)

#### Social Engagement Missions

| Mission | XP Reward | Requirements |
|---------|-----------|--------------|
| **Follow Twitter** | 50 XP | Follow [@pozzer_depin](https://x.com/pozzer_depin) |
| **Join Telegram** | 50 XP | Join [t.me/pozzerpt](https://t.me/pozzerpt) |
| **Share Post** | 150 XP | Retweet/share content (manual review) |
| **Daily Check-in** | 10 XP | Daily login (unlimited) |

#### Referral Program

| Action | XP Reward | Conditions |
|--------|-----------|------------|
| **Invite User** | 200 XP | Referred user must complete 1+ mission |

**Referral Counting**: Only users who complete at least 1 mission count toward referral stats.

---

## 3. Tier-Based Mainnet Rewards

### 3.1 User Tiers

Users are classified into 4 tiers based on total XP earned during testnet. Each tier receives different benefits at mainnet launch.

| Tier | XP Required | % of Users (est.) | Allocation Boost | NFT Benefits |
|------|-------------|-------------------|------------------|--------------|
| **Explorer** | 500 XP | ~70% | 1.0x (baseline) | None |
| **Operator** | 1,500 XP | ~20% | 1.3x | Top 100: 80% NFT discount |
| **Validator** | 3,000 XP | ~8% | 1.6x | Top 500: 50% NFT discount |
| **Genesis Operator** | 6,000 XP | ~2% | 2.0x | Top 21: FREE NFT license |

### 3.2 Allocation Boost Explained

**Base Airdrop Formula**:
```
User Airdrop = (User XP / Total XP) × Testnet Allocation Pool × Tier Boost
```

**Example**:
```
User XP: 3,500 (Validator tier, 1.6x boost)
Total XP: 1,000,000
Testnet Pool: 150,000,000 PZR (15% of supply)

Without boost: (3,500 / 1,000,000) × 150,000,000 = 525 PZR
With 1.6x boost: 525 × 1.6 = 840 PZR

Final airdrop: 840 PZR
```

### 3.3 NFT License System

**Purpose**: NFT licenses grant access to premium DePIN features:
- Priority node selection for tasks
- Higher reward multipliers
- Governance voting rights
- Exclusive validator slots

**Distribution**:
- **Top 21** (Genesis Operators): FREE NFT + guaranteed validator slot
- **Top 22-500** (Validators): 50% discount on NFT mint
- **Top 501-1000** (Operators): 80% discount on NFT mint

**NFT Mint Price**: TBD (announced before mainnet)

---

## 4. Token Utility

### 4.1 Network Operations

1. **Staking**
   - Validators must stake PZR to secure slots
   - Delegators stake to earn portion of validator rewards
   - Minimum stake: TBD

2. **Compute Payments**
   - Users pay PZR for compute resources
   - Node operators earn PZR for providing capacity
   - Automatic settlement via smart contracts

3. **Governance**
   - 1 PZR = 1 vote (or quadratic voting)
   - Proposals for protocol upgrades
   - Treasury fund allocation decisions

### 4.2 Incentive Mechanisms

**Node Operator Rewards**:
```
Base Reward = Network Emission Rate × (Node Uptime / Total Network Uptime)
Boosted Reward = Base Reward × NFT Multiplier (if applicable)
```

**Performance Multipliers**:
- 99.9%+ uptime: 1.2x rewards
- 98-99.9% uptime: 1.0x rewards
- <98% uptime: 0.8x rewards

---

## 5. Vesting Schedules

### 5.1 Testnet Airdrop (15%)

- **Unlock**: 100% at mainnet launch (cliff unlock)
- **Reasoning**: Reward early adopters immediately

### 5.2 Node Operators (30%)

- **Unlock**: Linear over 4 years
- **Distribution**: Ongoing emissions based on compute provided
- **Formula**: `Monthly Emission = (Total Node Allocation / 48 months) × Network Utilization Factor`

### 5.3 Team & Development (20%)

- **Cliff**: 1-year lockup (0% unlocked)
- **Vesting**: Linear over 4 years after cliff
- **Monthly**: (Total Team Allocation / 36 months) starting month 13

### 5.4 Community Treasury (15%)

- **Unlock**: Immediate (but DAO-governed)
- **Spending**: Requires governance proposals
- **Budget**: Quarterly allocations voted by token holders

### 5.5 Liquidity Provision (10%)

- **Unlock**: 100% at mainnet launch
- **Purpose**: Seed DEX liquidity pools (Uniswap, PancakeSwap, etc.)
- **Pairing**: PZR/ETH, PZR/USDC, PZR/BNB

---

## 6. Token Economics Model

### 6.1 Supply Dynamics

**Initial Circulating Supply** (at mainnet):
```
Testnet Airdrop: 15%
Liquidity Pools: 10%
---
Total: 25% of max supply
```

**Emissions Schedule**:
- **Year 1**: 25% initial + 10% emissions = 35% circulating
- **Year 2**: 35% + 8% = 43% circulating
- **Year 3**: 43% + 6% = 49% circulating
- **Year 4**: 49% + 4% = 53% circulating

### 6.2 Deflationary Mechanisms

1. **Compute Fee Burns**
   - 5% of all compute payments burned
   - Reduces circulating supply over time

2. **Staking Lock-ups**
   - Validators lock PZR for minimum 6 months
   - Reduces liquid supply, increases scarcity

3. **NFT Minting**
   - 50% of NFT mint fees burned
   - Creates demand-driven deflation

---

## 7. Comparison vs. Competitors

| Project | Total Supply | Airdrop % | Node Rewards | Governance | DePIN Focus |
|---------|--------------|-----------|--------------|------------|-------------|
| **Pozzer** | TBD | 15% | 30% (4yr) | DAO | ✅ Latin America |
| Filecoin | 2B FIL | 0% | 55% (6yr) | Limited | Storage only |
| Akash | 388M AKT | 0% | 54% (10yr) | DAO | Compute only |
| Render | 530M RNDR | 0% | N/A | Limited | GPU render only |

**Pozzer Advantages**:
- Higher airdrop allocation (15% vs 0%)
- Faster node reward vesting (4yr vs 6-10yr)
- Full DAO governance from launch
- Unified DePIN platform (compute + storage + bandwidth)

---

## 8. Economic Security Model

### 8.1 Validator Economics

**Requirements**:
- Minimum stake: TBD (e.g., 10,000 PZR)
- Uptime requirement: 99%+
- Hardware specs: 16GB RAM, 4+ cores, 1TB SSD

**Revenue**:
- Block rewards: 50% of network emissions
- Compute task fees: 10% commission
- Delegator fees: 5-20% (validator-set)

**Penalties** (slashing):
- Downtime >1%: 5% stake slashed
- Double-signing: 50% stake slashed
- Malicious behavior: 100% stake slashed

### 8.2 Attack Cost Analysis

**51% Attack Cost**:
```
Assumption: 1,000 validators with avg 50,000 PZR staked each
Total Staked: 50,000,000 PZR

To control 51%: Need 25,500,000 PZR staked
At $1/PZR: $25,500,000 cost

Plus:
- Hardware: 510 servers × $5,000 = $2,550,000
- Operational: 510 servers × $200/mo = $102,000/mo

Total upfront: ~$28,000,000
Monthly burn: ~$100,000

Risk: Slashing = lose entire stake ($25.5M)
```

**Conclusion**: Economically irrational to attack.

---

## 9. Roadmap

### Phase 1: Testnet (Current)
- ✅ XP earning system
- ✅ Referral program
- ✅ Tier-based rewards
- 🔄 Ongoing: Community building

### Phase 2: Pre-Mainnet (Q2 2025)
- Token generation event (TGE)
- DEX listing announcements
- Airdrop snapshot
- NFT minting opens

### Phase 3: Mainnet Launch (Q3 2025)
- Airdrop distribution
- Liquidity pool seeding
- Validator node onboarding
- Governance activation

### Phase 4: Ecosystem Growth (Q4 2025+)
- DApp integrations
- Enterprise partnerships
- Global expansion
- Cross-chain bridges

---

## 10. Risk Disclosures

### 10.1 Investment Risks

⚠️ **This is not financial advice. PZR tokens carry risk.**

**Risks**:
- Market volatility (crypto asset)
- Regulatory uncertainty (DePIN classification)
- Technology risks (smart contract bugs)
- Adoption risks (network effects required)

**Mitigations**:
- Professional smart contract audit (pre-launch)
- Legal compliance review (jurisdiction-specific)
- Bug bounty program (ongoing)
- Community-driven governance (reduces centralization)

### 10.2 Token Concentration

**Anti-Whale Measures**:
- Max 3 node missions per wallet (reduces Sybil)
- Linear vesting for team/investors (prevents dumps)
- DAO treasury controls (prevents insider manipulation)

**Launch Safeguards**:
- Gradual liquidity unlocks (prevents rug-pulls)
- Multi-sig treasury (3-of-5 governance)
- Transparent on-chain reporting (Dune Analytics dashboards)

---

## 11. Governance Framework

### 11.1 DAO Structure

**Voting Power**: 1 PZR = 1 vote (or quadratic: √PZR for anti-plutocracy)

**Proposal Types**:
1. **Treasury Spending** (quorum: 10%, threshold: 66%)
2. **Protocol Upgrades** (quorum: 15%, threshold: 75%)
3. **Emergency Actions** (quorum: 5%, threshold: 90%)

**Voting Period**: 7 days (with 3-day discussion phase)

### 11.2 Community Treasury Allocation

**Budget Categories**:
- Developer grants: 40%
- Marketing/growth: 30%
- Security audits: 15%
- Community events: 10%
- Reserve: 5%

**Decision Process**:
1. Forum discussion (pozzer.io/governance)
2. Formal proposal submission
3. Snapshot vote (off-chain)
4. On-chain execution (if passed)

---

## 12. FAQ

**Q: When is the airdrop?**  
A: TBD. Minimum 30 days notice before snapshot.

**Q: What's the XP to PZR conversion rate?**  
A: Will be announced before mainnet to ensure fair distribution.

**Q: Can I transfer XP?**  
A: No. XP is non-transferable and tied to wallets.

**Q: What happens to unclaimed airdrops?**  
A: 90-day claim window. Unclaimed tokens return to Community Treasury.

**Q: Is PZR deflationary?**  
A: Yes. 5% of compute fees burned + NFT mint burns.

**Q: Where can I trade PZR?**  
A: Post-mainnet: DEXes (Uniswap, PancakeSwap). CEX listings TBD.

---

## 13. Resources

- **Website**: [pozzer.io](https://pozzer.io)
- **Whitepaper**: Coming soon
- **Governance Forum**: Coming soon
- **Token Tracker**: Coming soon (post-mainnet)
- **Audits**: Coming soon (pre-mainnet)

---

**Disclaimer**: This tokenomics document is subject to change based on community feedback, regulatory requirements, and market conditions. Final parameters will be announced before mainnet launch.

**Last Updated**: March 2025  
**Version**: 2.0  
**Contact**: [pozzerinc@gmail.com](mailto:pozzerinc@gmail.com)
