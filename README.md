# Pozzer - DePIN Protocol for Real-World Web3 Applications

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0-61DAFB)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)

Full-stack Web3 DePIN protocol with multi-chain wallet integration, gamification, and enterprise-level security, built with React, TypeScript, Cloudflare Workers, and edge-native data architecture.

## 🌟 Overview

Pozzer is a portfolio-ready DePIN (Decentralized Physical Infrastructure Network) platform that enables users to participate in decentralized infrastructure through wallet-based interaction, mission validation, and reward distribution. The project uses an edge-first architecture with Cloudflare Workers to deliver low-latency API responses, scalable backend logic, and secure multi-chain integration.

## 🚀 Demo

No public live demo yet. Demo visuals and public environment links will be added soon.

## 📸 Screenshots

⚠️ Screenshots represent the current testnet/demo interface.

| Home | Explorer | Testnet |
|------|----------|---------|
| ![Home](docs/screenshots/home.png) | ![Explorer](docs/screenshots/explorer.png) | ![Testnet](docs/screenshots/testnet.png) |

## 🔄 User Flow

- Wallet Connection: User connects wallet (WalletConnect/Web3Modal).
- Participation: User performs missions and platform interactions.
- Backend Processing: Requests handled via REST APIs on the Edge.
- Validation: Node/verification logic validates actions.
- Rewards: progression and rewards are updated based on participation.

## 🛠️ Core Components

- Web3 Authentication: Nonce + signature verification.
- API Layer: Cloudflare Workers + Hono.
- Node Logic: Worker / Verifier / Delegator simulation.
- Gamification: Reward distribution and progression system.
- Integration: Multi-chain layer (Ethereum, Polygon, BSC, Arbitrum).
- Admin Dashboard: Review, moderation, and security monitoring.

## 🏗️ Architecture

- Frontend: React + TypeScript + React Router + Tailwind + UI components.
- Backend: Cloudflare Workers (edge functions).
- Database: Cloudflare D1 (edge-native relational DB).
- Storage: Cloudflare R2.
- Protocol Layer: Multi-chain interaction layer.

## 👨‍💻 What I Built

- Full-stack Web3 architecture (frontend + worker backend + API).
- Wallet-based authentication with signature verification.
- Reward distribution and mission progression logic.
- Multi-chain wallet onboarding and interaction layer.
- Edge-first backend for low-latency request handling.
- Security-first API with rate limiting, logging, and admin JWT auth.

## ⚡ Technical Challenges Solved

- Secure Auth: Wallet authentication without private key exposure.
- Performance: Low-latency handling in serverless environments.
- Scalability: Anti-abuse controls for reward mechanics.
- UX: Multi-chain compatibility in a unified interface.
- Modeling: Node-based participation and verification design.

## 📊 Project Highlights

- 20+ REST API endpoints.
- 13 relational database tables.
- 25+ React components.
- Multi-wallet support via WalletConnect.
- Edge deployment architecture (Cloudflare).

## 🔐 Security

- Wallet signature verification (nonce-based).
- JWT authentication + bcrypt password hashing (admin).
- Multi-layer rate limiting (IP and wallet).
- Request logging and suspicious activity tracking.
- Input sanitization + strict endpoint controls.

## 📂 Documentation

Technical docs are available in the docs folder:

- docs/ARCHITECTURE.md
- docs/SECURITY.md
- docs/routes.md

## 💻 Run Locally

### Windows (PowerShell)
```powershell
npm install
copy .env.example .env
npm run dev
```
##    Linux/Mac
```npm install
cp .env.example .env
npm run dev
````

🌐 Environment Variables (.env)

Use .env.example as the source of truth.
VITE_WALLETCONNECT_PROJECT_ID=your_id_here
ADMIN_JWT_SECRET=your_secret_here
AUTHORIZED_ADMIN_EMAILS=admin@example.com
TESTNET_UNLOCK_DATE=2025-04-01T00:00:00Z


⚠️ Limitations

This is a portfolio-adapted version of a broader system.

Part of the node network behavior is simulated for demo usability.

It is not a fully decentralized production network.

📈 Tokenomics (Overview)

Tiered participation model (Explorer -> Genesis Operator).

Reward multipliers and mission-based progression.

NFT-related reward concepts for top participants.

🤝 Community & Support

Twitter: @pozzer_depin
Telegram: t.me/pozzerpt

Status: Testnet in development.

Email: contato@pozzer.io
