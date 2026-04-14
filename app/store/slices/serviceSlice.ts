import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

interface ServiceState {
  services: Service[];
  selectedServices: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  selectedServices: [],
  loading: false,
  error: null,
};

export const fetchServicesBySalon = createAsyncThunk(
  'service/fetchBySalon',
  async (salonId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/salons/${salonId}/services`);
      if (!response.ok) throw new Error('Erro ao buscar serviços');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    addSelectedService: (state, action: PayloadAction<Service>) => {
      const exists = state.selectedServices.find((s) => s.id === action.payload.id);
      if (!exists) {
        state.selectedServices.push(action.payload);
      }
    },
    removeSelectedService: (state, action: PayloadAction<string>) => {
      state.selectedServices = state.selectedServices.filter((s) => s.id !== action.payload);
    },
    clearSelectedServices: (state) => {
      state.selectedServices = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchServicesBySalon.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchServicesBySalon.fulfilled, (state, action) => {
      state.loading = false;
      state.services = action.payload;
    });
    builder.addCase(fetchServicesBySalon.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  addSelectedService,
  removeSelectedService,
  clearSelectedServices,
  clearError,
} = serviceSlice.actions;
export default serviceSlice.reducer;
