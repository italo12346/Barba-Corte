import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Endereco {
  logradouro: string;
  cidade:     string;
  uf:         string;
  cep:        string;
  numero:     string;
  pais:       string;
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
  endereco:  Endereco;
  geo:       Geo;
  createdAt: string;
  updatedAt: string;
}

export interface Arquivo {
  _id:            string;
  referenciaId:   string;
  model:          string;
  nome:           string;
  caminhoArquivo: string;
  tipoMime:       string;
  tamanho:        number;
}

export interface Servico {
  id:          string;
  _id?:        string; 
  titulo:      string;
  preco?:      number;
  duracao?:    number;
  arquivos?:   Arquivo[];
  descricao?:  string;
  status?:     string;
}

interface SalonState {
  salons:        Salon[];
  selectedSalon: Salon | null;
  servicos:      Servico[];
  loading:       boolean;
  error:         string | null;
}

const initialState: SalonState = {
  salons:        [],
  selectedSalon: null,
  servicos:      [],
  loading:       false,
  error:         null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchSalons = createAsyncThunk(
  'salon/fetchSalons',
  async ({ lat, lon }: { lat: number; lon: number }) => {
    const response = await api.get(`/salao?lat=${lat}&lon=${lon}`);
    return response.data.saloes;
  }
);

export const fetchSalonById = createAsyncThunk(
  'salon/fetchSalonById',
  async (id: string) => {
    const response = await api.get(`/salao/perfil/${id}`);
    return response.data.salao;
  }
);

export const fetchSalonServicos = createAsyncThunk(
  'salon/fetchSalonServicos',
  async (salaoId: string) => {
    const response = await api.get(`/salao/servico/${salaoId}`);
    // ✅ Retornamos o array de serviços completo que vem da API
    return response.data.servicos;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const salonSlice = createSlice({
  name: 'salon',
  initialState,
  reducers: {
    clearSelectedSalon: (state) => {
      state.selectedSalon = null;
      state.servicos = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Salons
      .addCase(fetchSalons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalons.fulfilled, (state, action) => {
        state.loading = false;
        state.salons = action.payload;
      })
      .addCase(fetchSalons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao buscar salões';
      })
      
      // Fetch Salon By Id
      .addCase(fetchSalonById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalonById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSalon = action.payload;
      })
      
      // Fetch Salon Servicos
      .addCase(fetchSalonServicos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalonServicos.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ SALVANDO O OBJETO COMPLETO:
        // Se a sua API retorna o ID como _id, vamos normalizar para id
        state.servicos = action.payload.map((s: any) => ({
          ...s,
          id: s._id || s.id // Garante que o campo 'id' exista para o componente
        }));
      })
      .addCase(fetchSalonServicos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao buscar serviços';
      });
  },
});

export const { clearSelectedSalon } = salonSlice.actions;
export default salonSlice.reducer;
