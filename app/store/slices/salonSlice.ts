import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api'; 

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Endereco {
  logradouro?: string;
  cidade?:     string;
  uf?:         string;
  cep?:        string;
  numero?:     string;
  pais?:       string;
}

export interface Geo {
  type:        string;
  coordinates: number[];
}

export interface Salon {
  _id:       string;
  nome:      string;
  foto?:     string;
  capa?:     string;
  email:     string;
  telefone:  string;
  endereco?: Endereco;
  geo?:      Geo;
  createdAt: string;
  updatedAt: string;
}

export interface Servico {
  id:     string;
  titulo: string;
}

interface SalonState {
  salons:        Salon[];
  selectedSalon: Salon | null;
  servicos:      Servico[];   // 👈 lista de serviços do salão selecionado
  loading:       boolean;
  error:         string | null;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: SalonState = {
  salons:        [],
  selectedSalon: null,
  servicos:      [],
  loading:       false,
  error:         null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

/** GET /salao/perfil/:id — busca perfil completo do salão */
export const fetchSalonById = createAsyncThunk(
  'salon/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/salao/perfil/${id}`);
      if (data.error) throw new Error(data.message);
      return data.salao as Salon;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** GET /salao/servico/:salaoId — busca serviços ativos do salão */
export const fetchSalonServicos = createAsyncThunk(
  'salon/fetchServicos',
  async (salaoId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/salao/servico/${salaoId}`);
      if (data.error) throw new Error(data.message);
      return data.servicos as Servico[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const salonSlice = createSlice({
  name: 'salon',
  initialState,
  reducers: {
    selectSalon: (state, action: PayloadAction<Salon>) => {
      state.selectedSalon = action.payload;
    },
    clearSelectedSalon: (state) => {
      state.selectedSalon = null;
      state.servicos      = []; 
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    // ── fetchSalonById ───────────────────────────────────────────────────
    builder
      .addCase(fetchSalonById.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchSalonById.fulfilled, (state, action) => {
        state.loading       = false;
        state.selectedSalon = action.payload;
      })
      .addCase(fetchSalonById.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── fetchSalonServicos ───────────────────────────────────────────────
    builder
      .addCase(fetchSalonServicos.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchSalonServicos.fulfilled, (state, action) => {
        state.loading  = false;
        state.servicos = action.payload;
      })
      .addCase(fetchSalonServicos.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { selectSalon, clearSelectedSalon, clearError } = salonSlice.actions;
export default salonSlice.reducer;