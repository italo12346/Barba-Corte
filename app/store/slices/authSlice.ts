import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Documento {
  tipo:   'CPF' | 'CNPJ';
  numero: string;
}

export interface Endereco {
  cidade?: string;
  uf?:     string;
  cep?:    string;
  numero?: string;
  pais?:   string;
}

export interface Cliente {
  _id:            string;
  nome:           string;
  email:          string;
  foto?:          string | null;
  telefone?:      string | null;
  dataNascimento?: string | null;
  sexo?:          'M' | 'F' | 'O' | null;
  documento:      Documento;
  endereco?:      Endereco | null;
  status:         'ATIVO' | 'INATIVO';
}

interface AuthState {
  cliente:         Cliente | null;
  token:           string | null;
  loading:         boolean;
  error:           string | null;
  isAuthenticated: boolean;
}

// ── Interfaces de payload ─────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  senha: string;
}

interface RegisterPayload {
  nome:            string;
  email:           string;
  senha:           string;
  telefone?:       string;
  dataNascimento?: string;
  sexo?:           'M' | 'F' | 'O';
  documento:       Documento;
  endereco?:       Endereco;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: AuthState = {
  cliente:         null,
  token:           null,
  loading:         false,
  error:           null,
  isAuthenticated: false,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

/** POST /auth/cliente/login */
export const loginCliente = createAsyncThunk(
  'auth/login',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/cliente/login', credentials);
      if (data.error) throw new Error(data.message);
      await AsyncStorage.setItem('@token', data.token);
      return { token: data.token, cliente: data.cliente };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** POST /auth/cliente/register */
export const registerCliente = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/cliente/register', payload);
      if (data.error) throw new Error(data.message);
      await AsyncStorage.setItem('@token', data.token);
      return { token: data.token, cliente: data.cliente };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** GET /auth/cliente/me — valida token salvo e carrega o cliente */
export const loadClienteFromToken = createAsyncThunk(
  'auth/loadFromToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Token não encontrado');

      const { data } = await api.get('/auth/cliente/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.error) throw new Error(data.message);
      return { token, cliente: data.cliente };
    } catch (error: any) {
      await AsyncStorage.removeItem('@token');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** POST /auth/cliente/google — envia accessToken para busca na userinfo do Google */
export const loginGoogle = createAsyncThunk(
  'auth/google',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/cliente/google', { token: accessToken });
      if (data.error) throw new Error(data.message);
      await AsyncStorage.setItem('@token', data.token);
      return { token: data.token, cliente: data.cliente };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.cliente         = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
      AsyncStorage.removeItem('@token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    // ── google ────────────────────────────────────────────────────────────
    builder
      .addCase(loginGoogle.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginGoogle.fulfilled, (state, action) => {
        state.loading         = false;
        state.token           = action.payload.token;
        state.cliente         = action.payload.cliente;
        state.isAuthenticated = true;
      })
      .addCase(loginGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── login ────────────────────────────────────────────────────────────
    builder
      .addCase(loginCliente.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginCliente.fulfilled, (state, action) => {
        state.loading         = false;
        state.token           = action.payload.token;
        state.cliente         = action.payload.cliente;
        state.isAuthenticated = true;
      })
      .addCase(loginCliente.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── register ─────────────────────────────────────────────────────────
    builder
      .addCase(registerCliente.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerCliente.fulfilled, (state, action) => {
        state.loading         = false;
        state.token           = action.payload.token;
        state.cliente         = action.payload.cliente;
        state.isAuthenticated = true;
      })
      .addCase(registerCliente.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── loadFromToken ─────────────────────────────────────────────────────
    builder
      .addCase(loadClienteFromToken.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loadClienteFromToken.fulfilled, (state, action) => {
        state.loading         = false;
        state.token           = action.payload.token;
        state.cliente         = action.payload.cliente;
        state.isAuthenticated = true;
      })
      .addCase(loadClienteFromToken.rejected, (state) => {
        state.loading         = false;
        state.isAuthenticated = false;
        state.token           = null;
        state.cliente         = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;