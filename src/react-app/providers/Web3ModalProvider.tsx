import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { ReactNode } from 'react';

// WalletConnect Project ID (configured via environment variable)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID";

// Chain configurations
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://eth.llamarpc.com'
};

const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon.llamarpc.com'
};

const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org'
};

const arbitrum = {
  chainId: 42161,
  name: 'Arbitrum One',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io',
  rpcUrl: 'https://arb1.arbitrum.io/rpc'
};

const metadata = {
  name: 'Pozzer',
  description: 'Pozzer DePIN Network - Democratizing the Future of Computing',
  url: 'https://pozzer.io',
  icons: ["/logo.png"]
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  // Social login options (no email or Google)
  auth: {
    email: false,
    socials: ['x', 'discord', 'github', 'apple', 'facebook'],
    showWallets: true,
    walletFeatures: true,
  },
});

// Initialize Web3Modal
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, polygon, bsc, arbitrum],
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#10b981',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#10b981',
    '--w3m-border-radius-master': '12px',
  },
  allWallets: 'SHOW',
});

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
