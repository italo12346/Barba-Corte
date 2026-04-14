import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Service } from './serviceSlice';

export interface Appointment {
  id: string;
  salonId: string;
  salonName: string;
  services: Service[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  totalDurationMinutes: number;
}

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Partial<Appointment> | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/appointments?userId=${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar agendamentos');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointment/create',
  async (appointment: Omit<Appointment, 'id' | 'status'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (!response.ok) throw new Error('Erro ao criar agendamento');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Erro ao cancelar agendamento');
      return appointmentId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setCurrentAppointment: (state, action: PayloadAction<Partial<Appointment>>) => {
      state.currentAppointment = action.payload;
    },
    updateCurrentAppointment: (state, action: PayloadAction<Partial<Appointment>>) => {
      state.currentAppointment = { ...state.currentAppointment, ...action.payload };
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch appointments
    builder.addCase(fetchAppointments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAppointments.fulfilled, (state, action) => {
      state.loading = false;
      state.appointments = action.payload;
    });
    builder.addCase(fetchAppointments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create appointment
    builder.addCase(createAppointment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAppointment.fulfilled, (state, action) => {
      state.loading = false;
      state.appointments.push(action.payload);
      state.currentAppointment = null;
    });
    builder.addCase(createAppointment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Cancel appointment
    builder.addCase(cancelAppointment.fulfilled, (state, action) => {
      const index = state.appointments.findIndex((a) => a.id === action.payload);
      if (index !== -1) {
        state.appointments[index].status = 'cancelled';
      }
    });
    builder.addCase(cancelAppointment.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  setCurrentAppointment,
  updateCurrentAppointment,
  clearCurrentAppointment,
  clearError,
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
