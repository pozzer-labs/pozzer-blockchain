import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect as useWeb3ModalDisconnect, useWeb3ModalProvider } from '@web3modal/ethers/react';

interface UserData {
  id: number;
  wallet_address: string;
  chain_type: string;
  pzr_balance: number;
  node_rewards: number;
  invite_rewards: number;
  social_rewards: number;
  referral_code: string;
  referred_by: string | null;
  total_missions_completed: number;
  is_whitelisted: boolean;
}

interface WalletState {
  address: string | null;
  chainType: 'evm' | 'solana' | null;
  isConnecting: boolean;
  isConnected: boolean;
  userData: UserData | null;
  referralCount: number;
}

interface WalletContextType extends WalletState {
  connectEVM: () => Promise<void>;
  connectSolana: () => Promise<void>;
  disconnect: () => void;
  shortAddress: string;
  refreshUserData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { open } = useWeb3Modal();
  const { address: web3Address, isConnected: web3Connected } = useWeb3ModalAccount();
  const { disconnect: web3Disconnect } = useWeb3ModalDisconnect();
  const { walletProvider } = useWeb3ModalProvider();
  
  const [state, setState] = useState<WalletState>({
    address: null,
    chainType: null,
    isConnecting: false,
    isConnected: false,
    userData: null,
    referralCount: 0,
  });

  const fetchUserData = useCallback(async (address: string) => {
    try {
      const response = await fetch(`/api/testnet/user/${address}`);
      if (response.ok) {
        const data = await response.json();
        setState(s => ({
          ...s,
          userData: data.user,
          referralCount: data.referral_count || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const signEVMMessage = useCallback(async (message: string): Promise<string | null> => {
    try {
      const { BrowserProvider } = await import('ethers');
      
      // Use Web3Modal provider if available, fallback to window.ethereum
      const provider = walletProvider || (window as any).ethereum;
      
      if (!provider) {
        throw new Error('No wallet provider found');
      }
      
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const signature = await signer.signMessage(message);
      
      return signature;
    } catch (error) {
      console.error('EVM signature error:', error);
      return null;
    }
  }, [walletProvider]);

  const registerUser = useCallback(async (address: string, chainType: 'evm' | 'solana') => {
    const urlParams = new URLSearchParams(window.location.search);
    const referredBy = urlParams.get('invite_by');
    
    try {
      // Step 1: Request nonce for signature
      const nonceResponse = await fetch('/api/auth/request-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });
      
      if (!nonceResponse.ok) {
        console.error('Failed to get nonce from server');
        return null;
      }
      
      const { nonce, message } = await nonceResponse.json();
      
      // Step 2: Sign message with wallet
      let signature: string | null = null;
      
      if (chainType === 'evm') {
        signature = await signEVMMessage(message);
        if (!signature) {
          console.error('Failed to sign EVM message');
          return null;
        }
      } else if (chainType === 'solana') {
        try {
          const solana = (window as any).solana;
          if (!solana?.signMessage) {
            throw new Error('Solana wallet does not support signing');
          }
          const encodedMessage = new TextEncoder().encode(message);
          const signedMessage = await solana.signMessage(encodedMessage, 'utf8');
          signature = Buffer.from(signedMessage.signature).toString('hex');
        } catch (signError) {
          console.error('Solana signature error:', signError);
          return null;
        }
      }
      
      if (!signature) {
        console.error('Failed to get signature from wallet');
        return null;
      }

      // Step 3: Register with signature
      const response = await fetch('/api/testnet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          chain_type: chainType,
          referred_by: referredBy,
          signature,
          nonce,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(s => ({
          ...s,
          userData: data.user,
        }));
        return data.user;
      } else {
        const error = await response.json();
        console.error('Registration failed:', error.error);
        return null;
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }, [signEVMMessage]);

  // Sync with Web3Modal state for EVM
  useEffect(() => {
    if (web3Connected && web3Address) {
      const addressLower = web3Address.toLowerCase();
      localStorage.setItem('wallet_address', addressLower);
      localStorage.setItem('wallet_chain', 'evm');
      
      setState(s => ({
        ...s,
        address: addressLower,
        chainType: 'evm',
        isConnecting: false,
        isConnected: true,
      }));
      
      // Check if user exists first, only register if new
      const checkAndRegister = async () => {
        try {
          const response = await fetch(`/api/testnet/user/${addressLower}`);
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              // User exists - just update state with their data
              setState(s => ({
                ...s,
                userData: data.user,
                referralCount: data.referral_count || 0,
              }));
            } else {
              // New user - register with signature verification
              await registerUser(addressLower, 'evm');
            }
          } else {
            // User doesn't exist - register with signature verification
            await registerUser(addressLower, 'evm');
          }
        } catch (error) {
          console.error('Error checking user:', error);
          // On error, try to register
          await registerUser(addressLower, 'evm');
        }
      };
      
      checkAndRegister();
    } else if (!web3Connected && state.chainType === 'evm') {
      // Only clear if it was an EVM connection
      const savedChain = localStorage.getItem('wallet_chain');
      if (savedChain === 'evm') {
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('wallet_chain');
        setState({
          address: null,
          chainType: null,
          isConnecting: false,
          isConnected: false,
          userData: null,
          referralCount: 0,
        });
      }
    }
  }, [web3Connected, web3Address, registerUser, state.chainType]);

  // Check for saved Solana wallet on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    const savedChain = localStorage.getItem('wallet_chain') as 'evm' | 'solana' | null;
    
    // Only restore Solana connections on mount (EVM is handled by Web3Modal)
    if (savedAddress && savedChain === 'solana') {
      setState(s => ({
        ...s,
        address: savedAddress,
        chainType: savedChain,
        isConnecting: false,
        isConnected: true,
      }));
      fetchUserData(savedAddress);
    }
  }, [fetchUserData]);

  const connectEVM = useCallback(async () => {
    setState(s => ({ ...s, isConnecting: true }));
    try {
      await open();
    } catch (error) {
      console.error('EVM connection error:', error);
    }
    setState(s => ({ ...s, isConnecting: false }));
  }, [open]);

  const connectSolana = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const solana = (window as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; on: (event: string, handler: () => void) => void } }).solana;
    
    if (!solana?.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    setState(s => ({ ...s, isConnecting: true }));

    try {
      const response = await solana.connect();
      const address = response.publicKey.toString();
      
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('wallet_chain', 'solana');
      
      setState(s => ({
        ...s,
        address,
        chainType: 'solana',
        isConnecting: false,
        isConnected: true,
      }));

      // Check if user exists first, only register if new
      try {
        const response = await fetch(`/api/testnet/user/${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // User exists - just update state with their data
            setState(s => ({
              ...s,
              userData: data.user,
              referralCount: data.referral_count || 0,
            }));
          } else {
            // New user - register (Solana doesn't require signature)
            await registerUser(address, 'solana');
          }
        } else {
          // User doesn't exist - register
          await registerUser(address, 'solana');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        // On error, try to register
        await registerUser(address, 'solana');
      }

      solana.on('disconnect', () => {
        disconnect();
      });

    } catch (error) {
      console.error('Solana connection error:', error);
      setState(s => ({ ...s, isConnecting: false }));
    }
  }, [registerUser]);

  const disconnect = useCallback(() => {
    // Disconnect Web3Modal for EVM
    if (state.chainType === 'evm') {
      web3Disconnect();
    }
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_chain');
    setState({
      address: null,
      chainType: null,
      isConnecting: false,
      isConnected: false,
      userData: null,
      referralCount: 0,
    });
  }, [state.chainType, web3Disconnect]);

  const refreshUserData = useCallback(async () => {
    if (state.address) {
      await fetchUserData(state.address);
    }
  }, [state.address, fetchUserData]);

  const shortAddress = state.address 
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : '';

  return (
    <WalletContext.Provider value={{
      ...state,
      connectEVM,
      connectSolana,
      disconnect,
      shortAddress,
      refreshUserData,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
