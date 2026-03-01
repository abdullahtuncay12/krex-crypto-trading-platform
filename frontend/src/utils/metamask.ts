// MetaMask utility functions for Web3 integration

export interface MetaMaskError {
  code: number;
  message: string;
}

export interface NetworkInfo {
  chainId: string;
  chainName: string;
  isSupported: boolean;
}

// Supported networks
export const SUPPORTED_NETWORKS = {
  ETHEREUM: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
  },
  POLYGON: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
  },
  BSC: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
  },
} as const;

/**
 * Check if MetaMask is installed
 * @returns true if MetaMask is installed, false otherwise
 */
export const isMetaMaskInstalled = (): boolean => {
  const { ethereum } = window as any;
  return Boolean(ethereum && ethereum.isMetaMask);
};

/**
 * Request wallet connection from MetaMask
 * @returns Promise with wallet address
 * @throws MetaMaskError if user rejects or error occurs
 */
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const { ethereum } = window as any;
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      // User rejected the request
      throw new Error('User rejected wallet connection');
    }
    throw error;
  }
};

/**
 * Get current connected wallet address
 * @returns Promise with wallet address or null if not connected
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const { ethereum } = window as any;
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    });

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Get current network chain ID
 * @returns Promise with chain ID in hex format
 */
export const getCurrentChainId = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  const chainId = await ethereum.request({
    method: 'eth_chainId',
  });

  return chainId;
};

/**
 * Get network information
 * @param chainId Chain ID in hex format
 * @returns Network information
 */
export const getNetworkInfo = (chainId: string): NetworkInfo => {
  const networks = Object.values(SUPPORTED_NETWORKS);
  const network = networks.find((n) => n.chainId === chainId);

  if (network) {
    return {
      chainId,
      chainName: network.chainName,
      isSupported: true,
    };
  }

  return {
    chainId,
    chainName: 'Unknown Network',
    isSupported: false,
  };
};

/**
 * Check if current network is supported
 * @returns Promise with boolean indicating if network is supported
 */
export const isSupportedNetwork = async (): Promise<boolean> => {
  try {
    const chainId = await getCurrentChainId();
    const networkInfo = getNetworkInfo(chainId);
    return networkInfo.isSupported;
  } catch (error) {
    console.error('Error checking network support:', error);
    return false;
  }
};

/**
 * Format wallet address to shortened format (0x1234...5678)
 * @param address Full wallet address
 * @returns Shortened address format
 */
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) {
    return address;
  }

  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Validate Ethereum address format
 * @param address Address to validate
 * @returns true if valid Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Listen for account changes
 * @param callback Function to call when account changes
 * @returns Cleanup function to remove listener
 */
export const onAccountsChanged = (
  callback: (accounts: string[]) => void
): (() => void) => {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const { ethereum } = window as any;
  ethereum.on('accountsChanged', callback);

  // Return cleanup function
  return () => {
    ethereum.removeListener('accountsChanged', callback);
  };
};

/**
 * Listen for network changes
 * @param callback Function to call when network changes
 * @returns Cleanup function to remove listener
 */
export const onChainChanged = (
  callback: (chainId: string) => void
): (() => void) => {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const { ethereum } = window as any;
  ethereum.on('chainChanged', callback);

  // Return cleanup function
  return () => {
    ethereum.removeListener('chainChanged', callback);
  };
};

/**
 * Request network switch
 * @param chainId Target chain ID in hex format
 */
export const switchNetwork = async (chainId: string): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const { ethereum } = window as any;
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error('Network not added to MetaMask');
    }
    throw error;
  }
};

/**
 * Get wallet balance in ETH
 * @param address Wallet address
 * @returns Promise with balance in ETH as string
 */
export const getBalance = async (address: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  const balance = await ethereum.request({
    method: 'eth_getBalance',
    params: [address, 'latest'],
  });

  // Convert from Wei to ETH
  const balanceInEth = parseInt(balance, 16) / 1e18;
  return balanceInEth.toFixed(4);
};

/**
 * Disconnect wallet (clear local state)
 * Note: MetaMask doesn't have a programmatic disconnect method
 * This is just for clearing local application state
 */
export const disconnectWallet = (): void => {
  // MetaMask doesn't support programmatic disconnect
  // This function is for clearing application state only
  console.log('Wallet disconnected from application');
};
