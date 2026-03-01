import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import botInvestmentReducer from './slices/botInvestmentSlice';
import cryptoPaymentReducer from './slices/cryptoPaymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    botInvestment: botInvestmentReducer,
    cryptoPayment: cryptoPaymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
