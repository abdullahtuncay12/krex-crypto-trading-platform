import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as metamask from '../../utils/metamask';

export interface Transaction {
  id: string;
  type: 'deposit' | 'subscription';
  amount: number;
  currency: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed' | 'timeout';
  createdAt: string;
  confirmedAt: string | null;
}

export interface CryptoPaymentState {
  // Wallet connection
  walletAddress: string | null;
  chainId: string | null;
  isConnected: boolean;
  balance: string | null;
  
  // Network info
  networkName: string | null;
  isNetworkSupported: boolean;
  
  // Prices
  prices: {
    USDT: number;
    ETH: number;
    lastUpdated: Date | null;
  };
  
  // Transactions
  pendingTransactions: Transaction[];
  transactionHistory: Transaction[];
  
  // UI state
  isConnecting: boolean;
  isLoadingPrices: boolean;
  error: string | null;
}

const initialState: CryptoPaymentState = {
  walletAddress: null,
  chainId: null,
  isConnected: false,
  balance: null,
  networkName: null,
  isNetworkSupported: false,
  prices: {
    USDT: 1.0,
    ETH: 0,
    lastUpdated: null,
  },
  pendingTransactions: [],
  transactionHistory: [],
  isConnecting: false,
  isLoadingPrices: false,
  error: null,
};

// Async thunks
export const connectMetaMask = createAsyncThunk(
  'cryptoPayment/connectMetaMask',
  async (_, { rejectWithValue }) => {
    try {
      if (!metamask.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }

      const address = await metamask.connectWallet();
      const chainId = await metamask.getCurrentChainId();
      const networkInfo = metamask.getNetworkInfo(chainId);
      const balance = await metamask.getBalance(address);

      return {
        address,
        chainId,
        networkName: networkInfo.chainName,
        isNetworkSupported: networkInfo.isSupported,
        balance,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to connect wallet');
    }
  }
);

export const disconnectMetaMask = createAsyncThunk(
  'cryptoPayment/disconnectMetaMask',
  async () => {
    metamask.disconnectWallet();
    return null;
  }
);

export const updateBalance = createAsyncThunk(
  'cryptoPayment/updateBalance',
  async (address: string, { rejectWithValue }) => {
    try {
      const balance = await metamask.getBalance(address);
      return balance;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update balance');
    }
  }
);

export const switchNetwork = createAsyncThunk(
  'cryptoPayment/switchNetwork',
  async (chainId: string, { rejectWithValue }) => {
    try {
      await metamask.switchNetwork(chainId);
      const networkInfo = metamask.getNetworkInfo(chainId);
      return {
        chainId,
        networkName: networkInfo.chainName,
        isNetworkSupported: networkInfo.isSupported,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to switch network');
    }
  }
);

const cryptoPaymentSlice = createSlice({
  name: 'cryptoPayment',
  initialState,
  reducers: {
    // Wallet actions
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.walletAddress = action.payload;
      state.isConnected = !!action.payload;
    },
    
    setChainId: (state, action: PayloadAction<string>) => {
      state.chainId = action.payload;
      const networkInfo = metamask.getNetworkInfo(action.payload);
      state.networkName = networkInfo.chainName;
      state.isNetworkSupported = networkInfo.isSupported;
    },
    
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    
    // Price actions
    updatePrices: (state, action: PayloadAction<{ USDT: number; ETH: number }>) => {
      state.prices.USDT = action.payload.USDT;
      state.prices.ETH = action.payload.ETH;
      state.prices.lastUpdated = new Date();
    },
    
    // Transaction actions
    addPendingTransaction: (state, action: PayloadAction<Transaction>) => {
      state.pendingTransactions.push(action.payload);
    },
    
    updateTransactionStatus: (
      state,
      action: PayloadAction<{ id: string; status: Transaction['status']; confirmedAt?: string }>
    ) => {
      // Update in pending transactions
      const pendingIndex = state.pendingTransactions.findIndex(
        (tx) => tx.id === action.payload.id
      );
      
      if (pendingIndex !== -1) {
        state.pendingTransactions[pendingIndex].status = action.payload.status;
        if (action.payload.confirmedAt) {
          state.pendingTransactions[pendingIndex].confirmedAt = action.payload.confirmedAt;
        }
        
        // Move to history if completed, failed, or timeout
        if (['completed', 'failed', 'timeout'].includes(action.payload.status)) {
          const transaction = state.pendingTransactions.splice(pendingIndex, 1)[0];
          state.transactionHistory.unshift(transaction);
        }
      }
      
      // Update in history
      const historyIndex = state.transactionHistory.findIndex(
        (tx) => tx.id === action.payload.id
      );
      
      if (historyIndex !== -1) {
        state.transactionHistory[historyIndex].status = action.payload.status;
        if (action.payload.confirmedAt) {
          state.transactionHistory[historyIndex].confirmedAt = action.payload.confirmedAt;
        }
      }
    },
    
    setTransactionHistory: (state, action: PayloadAction<Transaction[]>) => {
      state.transactionHistory = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetCryptoPayment: () => initialState,
  },
  extraReducers: (builder) => {
    // Connect MetaMask
    builder
      .addCase(connectMetaMask.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectMetaMask.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.walletAddress = action.payload.address;
        state.chainId = action.payload.chainId;
        state.networkName = action.payload.networkName;
        state.isNetworkSupported = action.payload.isNetworkSupported;
        state.balance = action.payload.balance;
        state.isConnected = true;
        state.error = null;
      })
      .addCase(connectMetaMask.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
        state.isConnected = false;
      });
    
    // Disconnect MetaMask
    builder
      .addCase(disconnectMetaMask.fulfilled, (state) => {
        state.walletAddress = null;
        state.chainId = null;
        state.networkName = null;
        state.isNetworkSupported = false;
        state.balance = null;
        state.isConnected = false;
        state.error = null;
      });
    
    // Update balance
    builder
      .addCase(updateBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      })
      .addCase(updateBalance.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Switch network
    builder
      .addCase(switchNetwork.fulfilled, (state, action) => {
        state.chainId = action.payload.chainId;
        state.networkName = action.payload.networkName;
        state.isNetworkSupported = action.payload.isNetworkSupported;
        state.error = null;
      })
      .addCase(switchNetwork.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setWalletAddress,
  setChainId,
  setBalance,
  updatePrices,
  addPendingTransaction,
  updateTransactionStatus,
  setTransactionHistory,
  setError,
  clearError,
  resetCryptoPayment,
} = cryptoPaymentSlice.actions;

export default cryptoPaymentSlice.reducer;
