import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import botInvestmentReducer from './slices/botInvestmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    botInvestment: botInvestmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
