# Pozzer - DePIN Protocol for Real-World Web3 Applications

⚠️ Replace <https://github.com/henriquebuilder > with your actual GitHub username after pushing.

[![Build](https://github.com/henriquebuilder/pozzer-depin-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/henriquebuilder/pozzer-depin-platform/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/henriquebuilder/pozzer-depin-platform)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/henriquebuilder/pozzer-depin-platform)](./package.json)

Full-stack Web3 DePIN protocol with multi-chain wallet integration, gamification, and enterprise-level security, built with React, TypeScript, Cloudflare Workers, and edge-native data architecture.

## Overview

Pozzer is a portfolio-ready DePIN (Decentralized Physical Infrastructure Network) platform that enables users to participate in decentralized infrastructure through wallet-based interaction, mission validation, and reward distribution.

The project uses an edge-first architecture with Cloudflare Workers to deliver low-latency API responses, scalable backend logic, and secure multi-chain integration.

## Demo

No public live demo yet. Demo visuals and public environment links will be added soon.

## Screenshots

⚠️ Screenshots represent the current testnet/demo interface.

Use this ready layout and replace image files as you capture your screens:

| Home | Explorer | Testnet |
|------|----------|---------|
| ![Home](docs/screenshots/home.png) | ![Explorer](docs/screenshots/explorer.png) | ![Testnet](docs/screenshots/testnet.png) |

Recommended image names:
- `docs/screenshots/home.png`
- `docs/screenshots/explorer.png`
- `docs/screenshots/testnet.png`
- `docs/screenshots/tokenomics.png` (optional)

## User Flow

1. User connects wallet (WalletConnect/Web3Modal).
2. User performs missions and platform interactions.
3. Backend processes requests through REST APIs.
4. Node/verification logic validates actions.
5. Rewards and progression are updated based on participation.

## Core Components

- Web3 authentication (nonce + signature verification)
- API layer (Cloudflare Workers + Hono)
- Node logic (Worker / Verifier / Delegator simulation)
- Reward and gamification system
- Multi-chain integration layer
- Admin dashboard (review, moderation, security monitoring)

## Architecture

- **Frontend:** React + TypeScript + React Router + Tailwind + UI components
- **Backend:** Cloudflare Workers (edge functions)
- **Database:** Cloudflare D1 (edge-native relational DB)
- **Storage:** Cloudflare R2
- **Protocol Layer:** Multi-chain interaction (Ethereum, Polygon, BSC, Arbitrum)

## What I Built

- Full-stack Web3 architecture (frontend + worker backend + API)
- Wallet-based authentication with signature verification
- Reward distribution and mission progression logic
- Multi-chain wallet onboarding and interaction layer
- Edge-first backend for low-latency request handling
- Security-first API with rate limiting, logging, and admin JWT auth

## Technical Challenges Solved

- Secure wallet authentication without private key exposure
- Low-latency request handling in edge/serverless environments
- Scalable reward mechanics with anti-abuse controls
- Multi-chain compatibility in a unified UX
- Node-based participation and verification model design

## Project Highlights

- 20+ REST API endpoints
- 13 relational database tables
- 25+ React components
- Multi-wallet support via WalletConnect
- Edge deployment architecture (Cloudflare)
- Security-focused backend design and monitoring

## Security

- Wallet signature verification (nonce-based)
- JWT authentication + bcrypt password hashing (admin)
- Multi-layer rate limiting (IP and wallet)
- Request logging and suspicious activity tracking
- Input sanitization + strict endpoint controls

## Demo/Testnet Environment

This portfolio version includes a testnet/demo environment with:

- Simulated node distribution for UX and visualization
- Real backend architecture and API design
- Wallet-based auth and reward logic

Focus: architecture quality, system design, scalability, and Web3 integration.

## Documentation

Technical docs are available in the `docs` folder:

- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/routes.md`

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Windows (PowerShell):

```powershell
npm install
copy .env.example .env
npm run dev
```

## Environment Variables (`.env`)

Use `.env.example` as the source of truth.

```bash
VITE_WALLETCONNECT_PROJECT_ID=
ADMIN_JWT_SECRET=
AUTHORIZED_ADMIN_EMAILS=admin@example.com,admin2@example.com
TESTNET_UNLOCK_DATE=2025-04-01T00:00:00Z
TESTNET_EARLY_ACCESS_PASSWORD=
API_KEY=
```

## Limitations

- This is a portfolio-adapted version of a broader system.
- Part of the node network behavior is simulated for demo usability.
- It is not a fully decentralized production network.

## Status

Testnet in development - Portfolio-ready codebase available.

## Tokenomics (Overview)

- Tiered participation model (Explorer -> Genesis Operator)
- Reward multipliers
- Mission-based progression
- NFT-related reward concepts for top participants

## Tags

`web3` `depin` `cloudflare-workers` `react` `typescript` `walletconnect` `decentralized` `fullstack`

## Suggested One-Line Description

Full-stack Web3 DePIN protocol with multi-chain wallet integration, gamification, and security-first edge architecture built on React, TypeScript, and Cloudflare Workers.

## Short Version for LinkedIn

Built a full-stack Web3 DePIN protocol using React, TypeScript, and Cloudflare Workers, with wallet signature authentication, mission-based gamification, and edge-native API architecture. Designed for scalability, low-latency processing, and secure multi-chain user participation.

## Short Version for Resume

Developed a full-stack Web3 DePIN platform (React + TypeScript + Cloudflare Workers + D1) featuring wallet signature auth, mission/reward mechanics, admin moderation flows, and edge-optimized API services with security controls (JWT, bcrypt, rate limiting).
