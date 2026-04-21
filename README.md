# Pozzer - DePIN Protocol for Real-World Web3 Applications

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0-61DAFB)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)

Full-stack Web3 DePIN protocol with multi-chain wallet integration, gamification, and enterprise-level security, built with React, TypeScript, Cloudflare Workers, and edge-native data architecture.

---

## 🚀 Project Summary

Pozzer is a **full-stack DePIN protocol** designed to simulate and validate real-world decentralized infrastructure participation.

It combines:
- Wallet-based authentication (Web3)
- Edge-native backend (Cloudflare Workers)
- Multi-chain interaction
- Gamified participation and reward system

Built as a **production-oriented portfolio project**, focusing on scalability, security, and real-world architecture patterns used in Web3 systems.

---

## 🌟 Overview

Pozzer is a portfolio-ready DePIN (Decentralized Physical Infrastructure Network) platform that enables users to participate in decentralized infrastructure through wallet-based interaction, mission validation, and reward distribution.

The project uses an edge-first architecture with Cloudflare Workers to deliver low-latency API responses, scalable backend logic, and secure multi-chain integration.

---

## 🧠 Key Engineering Highlights

- Designed and implemented **20+ REST API endpoints**
- Structured **13 relational database tables (Cloudflare D1)**
- Built **25+ reusable React components**
- Implemented **wallet-based authentication (signature + nonce)**
- Developed **edge-first backend architecture (low latency, serverless)**
- Applied **rate limiting, logging, and security layers**

---

## 🔄 User Flow

1. **Wallet Connection:** User connects wallet (WalletConnect/Web3Modal)  
2. **Participation:** User performs missions and platform interactions  
3. **Backend Processing:** Requests handled via REST APIs on the Edge  
4. **Validation:** Node/verification logic validates actions  
5. **Rewards:** progression and rewards are updated based on participation  

---

## 🛠️ Core Components

- **Web3 Authentication:** Nonce + signature verification  
- **API Layer:** Cloudflare Workers + Hono  
- **Node Logic:** Worker / Verifier / Delegator simulation  
- **Gamification:** Reward distribution and progression system  
- **Integration:** Multi-chain layer (Ethereum, Polygon, BSC, Arbitrum)  
- **Admin Dashboard:** Review, moderation, and security monitoring  

---

## 🏗️ Architecture

- **Frontend:** React + TypeScript + React Router + Tailwind + UI components  
- **Backend:** Cloudflare Workers (edge functions)  
- **Database:** Cloudflare D1 (edge-native relational DB)  
- **Storage:** Cloudflare R2  
- **Protocol Layer:** Multi-chain interaction layer  

---

## ⚡ Technical Challenges Solved

- **Secure Auth:** Wallet authentication without private key exposure  
- **Performance:** Low-latency handling in serverless environments  
- **Scalability:** Anti-abuse controls for reward mechanics  
- **UX:** Multi-chain compatibility in a unified interface  
- **Modeling:** Node-based participation and verification design  

---

## 🔐 Security

- Wallet signature verification (nonce-based)  
- JWT authentication + bcrypt password hashing (admin)  
- Multi-layer rate limiting (IP and wallet)  
- Request logging and suspicious activity tracking  
- Input sanitization + strict endpoint controls  

---

## 📊 Project Highlights

- 20+ REST API endpoints  
- 13 relational database tables  
- 25+ React components  
- Multi-wallet support via WalletConnect  
- Edge deployment architecture (Cloudflare)  

---

## 🚀 Live Demo

Testnet environment is live and accessible:

🔗 https://www.pozzer.io/

The platform allows wallet connection, interaction with missions, and real-time backend validation.

---

## 📂 Documentation

Technical docs are available in the `docs` folder:

- docs/ARCHITECTURE.md  
- docs/SECURITY.md  
- docs/routes.md  

---

## 💻 Run Locally

### Windows (PowerShell)
```powershell
npm install
copy .env.example .env
npm run dev
```

### Linux/Mac
```
npm install
cp .env.example .env
npm run dev
```

## 🌐 Environment Variables (.env)

Use .env.example as the source of truth.
```
VITE_WALLETCONNECT_PROJECT_ID=your_id_here
ADMIN_JWT_SECRET=your_secret_here
AUTHORIZED_ADMIN_EMAILS=admin@example.com
TESTNET_UNLOCK_DATE=2025-04-01T00:00:00Z
```
## ⚠️ Limitations

This is a portfolio-adapted version of a broader system.

Part of the node network behavior is simulated for demo usability.

It is not a fully decentralized production network.

## 📈 Tokenomics (Overview)

Tiered participation model (Explorer -> Genesis Operator).

Reward multipliers and mission-based progression.

NFT-related reward concepts for top participants.

## 🤝 Community & Support

Twitter: @pozzer_depin
Telegram: t.me/pozzerpt

Status: Testnet in development.

Email: contato@pozzer.io
