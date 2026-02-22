/**
 * Bot Investment Redux Slice
 * 
 * Manages bot trading investment state including creation, fetching, and updates.
 * 
 * Requirements: 8.1, 8.2
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { botAPI } from '../../api/client';

export interface BotInvestment {
  id: string;
  userId: string;
  cryptocurrency: string;
  principalAmount: number;
  tradingPeriodHours: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  currentValue: number;
  finalValue?: number;
  profit?: number;
  commission?: number;
  riskAcknowledgedAt: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  totalPortfolioValue: number;
  lifetimeProfit: number;
  lifetimeCommission: number;
}

interface BotInvestmentState {
  investments: BotInvestment[];
  activeInvestments: BotInvestment[];
  completedInvestments: BotInvestment[];
  currentInvestment: BotInvestment | null;
  portfolioSummary: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: BotInvestmentState = {
  investments: [],
  activeInvestments: [],
  completedInvestments: [],
  currentInvestment: null,
  portfolioSummary: null,
  loading: false,
  error: null,
};

// Async thunks
export const createInvestment = createAsyncThunk(
  'botInvestment/create',
  async (
    data: {
      cryptocurrency: string;
      principalAmount: number;
      tradingPeriodHours: number;
      riskAcknowledgedAt: Date;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await botAPI.createInvestment(data);
      return response.data.investment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Yatırım oluşturulamadı');
    }
  }
);

export const fetchInvestments = createAsyncThunk(
  'botInvestment/fetchAll',
  async (status?: 'active' | 'completed' | 'cancelled', { rejectWithValue }) => {
    try {
      const response = await botAPI.getInvestments(status);
      return response.data.investments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Yatırımlar alınamadı');
    }
  }
);

export const fetchInvestmentDetail = createAsyncThunk(
  'botInvestment/fetchDetail',
  async (investmentId: string, { rejectWithValue }) => {
    try {
      const response = await botAPI.getInvestmentById(investmentId);
      return response.data.investment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Yatırım detayı alınamadı');
    }
  }
);

export const cancelInvestment = createAsyncThunk(
  'botInvestment/cancel',
  async (
    investmentIdOrData: string | { investmentId: string; reason?: string },
    { rejectWithValue }
  ) => {
    const { investmentId, reason } = typeof investmentIdOrData === 'string' 
      ? { investmentId: investmentIdOrData, reason: undefined }
      : investmentIdOrData;
    try {
      const response = await botAPI.cancelInvestment(investmentId, reason);
      return response.data.investment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Yatırım iptal edilemedi');
    }
  }
);

export const fetchPortfolioSummary = createAsyncThunk(
  'botInvestment/fetchPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const response = await botAPI.getPortfolioSummary();
      return response.data.summary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Portföy özeti alınamadı');
    }
  }
);

const botInvestmentSlice = createSlice({
  name: 'botInvestment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateInvestmentValue: (state, action: PayloadAction<{ id: string; currentValue: number }>) => {
      // Update investment value in real-time (from WebSocket)
      const investment = state.investments.find((inv) => inv.id === action.payload.id);
      if (investment) {
        investment.currentValue = action.payload.currentValue;
      }
      
      const activeInvestment = state.activeInvestments.find((inv) => inv.id === action.payload.id);
      if (activeInvestment) {
        activeInvestment.currentValue = action.payload.currentValue;
      }
      
      if (state.currentInvestment?.id === action.payload.id) {
        state.currentInvestment.currentValue = action.payload.currentValue;
      }
    },
    setCurrentInvestment: (state, action: PayloadAction<BotInvestment | null>) => {
      state.currentInvestment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create investment
    builder.addCase(createInvestment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createInvestment.fulfilled, (state, action: PayloadAction<BotInvestment>) => {
      state.loading = false;
      state.investments.push(action.payload);
      if (action.payload.status === 'active') {
        state.activeInvestments.push(action.payload);
      }
    });
    builder.addCase(createInvestment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch investments
    builder.addCase(fetchInvestments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInvestments.fulfilled, (state, action: PayloadAction<BotInvestment[]>) => {
      state.loading = false;
      state.investments = action.payload;
      state.activeInvestments = action.payload.filter((inv) => inv.status === 'active');
      state.completedInvestments = action.payload.filter((inv) => inv.status === 'completed');
    });
    builder.addCase(fetchInvestments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch investment detail
    builder.addCase(fetchInvestmentDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInvestmentDetail.fulfilled, (state, action: PayloadAction<BotInvestment>) => {
      state.loading = false;
      state.currentInvestment = action.payload;
    });
    builder.addCase(fetchInvestmentDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Cancel investment
    builder.addCase(cancelInvestment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelInvestment.fulfilled, (state, action: PayloadAction<BotInvestment>) => {
      state.loading = false;
      // Update investment in lists
      const index = state.investments.findIndex((inv) => inv.id === action.payload.id);
      if (index !== -1) {
        state.investments[index] = action.payload;
      }
      // Remove from active investments
      state.activeInvestments = state.activeInvestments.filter((inv) => inv.id !== action.payload.id);
      // Update current investment if it's the cancelled one
      if (state.currentInvestment?.id === action.payload.id) {
        state.currentInvestment = action.payload;
      }
    });
    builder.addCase(cancelInvestment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch portfolio summary
    builder.addCase(fetchPortfolioSummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPortfolioSummary.fulfilled, (state, action: PayloadAction<PortfolioSummary>) => {
      state.loading = false;
      state.portfolioSummary = action.payload;
    });
    builder.addCase(fetchPortfolioSummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, updateInvestmentValue, setCurrentInvestment } = botInvestmentSlice.actions;
export default botInvestmentSlice.reducer;
