import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import salonReducer from './slices/salonSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    salon: salonReducer,
    service: serviceReducer,
    appointment: appointmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
