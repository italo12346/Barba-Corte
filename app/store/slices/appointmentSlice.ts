import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Colaborador {
  _id: string;
  nome: string;
  foto?: string;
  especialidades: string[];
}

export interface SlotHorario {
  hora: string;
  status: 'livre' | 'reservado';
}

export interface DiaAgenda {
  data: string;
  disponibilidade: {
    colaboradorId: string;
    horarios: SlotHorario[];
  }[];
}

export interface Pix {
  qrBase64: string;
  qrCode: string;
  expiracao: string;
  link?: string;
}

export interface AgendamentoHistorico {
  _id: string;
  servico: string;
  colaborador: string;
  data: string;
  status: 'aguardando_pagamento' | 'confirmado' | 'cancelado';
  valor: number;
}

interface AgendamentoState {
  // Fluxo de criação
  colaboradores: Colaborador[];
  agenda: DiaAgenda[];
  agendamentoAtivoId: string | null;
  pix: Pix | null;

  // Histórico (tela de perfil)
  historico: AgendamentoHistorico[];

  // Loadings granulares
  loadingColaboradores: boolean;
  loadingAgenda: boolean;
  salvando: boolean;
  loadingPix: boolean;
  loadingHistorico: boolean;

  // Erros
  erro: string | null;
}

const initialState: AgendamentoState = {
  colaboradores: [],
  agenda: [],
  agendamentoAtivoId: null,
  pix: null,
  historico: [],
  loadingColaboradores: false,
  loadingAgenda: false,
  salvando: false,
  loadingPix: false,
  loadingHistorico: false,
  erro: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchColaboradoresSalao = createAsyncThunk(
  'agendamento/fetchColaboradores',
  async (salaoId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/colaborador/salao/', {
        headers: { salaoId },
      });
      return data.colaboradores as Colaborador[];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Erro ao buscar profissionais');
    }
  }
);

export const fetchDiasDisponiveis = createAsyncThunk(
  'agendamento/fetchDias',
  async (
    { salaoId, servicoId, data }: { salaoId: string; servicoId: string; data: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(
        '/agendamento/dias-disponiveis',
        { data, servicoId },
        { headers: { salaoId } }
      );
      return res.data.agenda as DiaAgenda[];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Erro ao buscar agenda');
    }
  }
);

export const criarAgendamento = createAsyncThunk(
  'agendamento/criar',
  async (
    payload: {
      salaoId: string;
      servicoId: string;
      clienteId: string;
      colaboradorId?: string;
      dataAgendamento: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { salaoId, ...body } = payload;
      const { data } = await api.post('/agendamento', body, {
        headers: { salaoId },
      });
      return data.agendamento._id as string;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Erro ao criar agendamento');
    }
  }
);

export const gerarPix = createAsyncThunk(
  'agendamento/gerarPix',
  async (agendamentoId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/agendamento/pix/${agendamentoId}`);
      return {
        qrBase64: data.qrBase64,
        qrCode: data.qrCode,
        expiracao: data.expiracao,
        link: data.link,
      } as Pix;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Erro ao gerar PIX');
    }
  }
);

export const fetchHistoricoCliente = createAsyncThunk(
  'agendamento/fetchHistorico',
  async (clienteId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/agendamento/cliente/${clienteId}`);
      return data.agendamentos as AgendamentoHistorico[];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message ?? 'Erro ao buscar histórico');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const agendamentoSlice = createSlice({
  name: 'agendamento',
  initialState,
  reducers: {
    resetFluxo(state) {
      state.agendamentoAtivoId = null;
      state.pix = null;
      state.erro = null;
    },
    limparErro(state) {
      state.erro = null;
    },
  },
  extraReducers: (builder) => {

    // ── fetchColaboradoresSalao ──────────────────────────────────────────────
    builder
      .addCase(fetchColaboradoresSalao.pending, (state) => {
        state.loadingColaboradores = true;
        state.erro = null;
      })
      .addCase(fetchColaboradoresSalao.fulfilled, (state, action) => {
        state.loadingColaboradores = false;
        state.colaboradores = action.payload;
      })
      .addCase(fetchColaboradoresSalao.rejected, (state, action) => {
        state.loadingColaboradores = false;
        state.erro = action.payload as string;
      });

    // ── fetchDiasDisponiveis ─────────────────────────────────────────────────
    builder
      .addCase(fetchDiasDisponiveis.pending, (state) => {
        state.loadingAgenda = true;
        state.erro = null;
      })
      .addCase(fetchDiasDisponiveis.fulfilled, (state, action) => {
        state.loadingAgenda = false;
        state.agenda = action.payload;
      })
      .addCase(fetchDiasDisponiveis.rejected, (state, action) => {
        state.loadingAgenda = false;
        state.erro = action.payload as string;
      });

    // ── criarAgendamento ─────────────────────────────────────────────────────
    builder
      .addCase(criarAgendamento.pending, (state) => {
        state.salvando = true;
        state.erro = null;
      })
      .addCase(criarAgendamento.fulfilled, (state, action) => {
        state.salvando = false;
        state.agendamentoAtivoId = action.payload;
      })
      .addCase(criarAgendamento.rejected, (state, action) => {
        state.salvando = false;
        state.erro = action.payload as string;
      });

    // ── gerarPix ─────────────────────────────────────────────────────────────
    builder
      .addCase(gerarPix.pending, (state) => {
        state.loadingPix = true;
        state.erro = null;
      })
      .addCase(gerarPix.fulfilled, (state, action) => {
        state.loadingPix = false;
        state.pix = action.payload;
      })
      .addCase(gerarPix.rejected, (state, action) => {
        state.loadingPix = false;
        state.erro = action.payload as string;
      });

    // ── fetchHistoricoCliente ────────────────────────────────────────────────
    builder
      .addCase(fetchHistoricoCliente.pending, (state) => {
        state.loadingHistorico = true;
        state.erro = null;
      })
      .addCase(fetchHistoricoCliente.fulfilled, (state, action) => {
        state.loadingHistorico = false;
        state.historico = action.payload;
      })
      .addCase(fetchHistoricoCliente.rejected, (state, action) => {
        state.loadingHistorico = false;
        state.erro = action.payload as string;
      });
  },
});

export const { resetFluxo, limparErro } = agendamentoSlice.actions;
export default agendamentoSlice.reducer;