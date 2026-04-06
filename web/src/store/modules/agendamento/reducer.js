import types from "./types";

const initialState = {
  agendamentos: [],
  loading: false,
  error: null,
  success: false, 
};

const agendamentoReducer = (state = initialState, action) => {
  switch (action.type) {

    // ── Loading genérico ──────────────────────────────────────────────────
    case types.FILTER_AGENDAMENTOS:
    case types.CREATE_AGENDAMENTO:
    case types.UPDATE_AGENDAMENTO:
    case types.DELETE_AGENDAMENTO:
      return { ...state, loading: true, error: null, success: false };

    // ── Filtrar ───────────────────────────────────────────────────────────
    case types.FILTER_AGENDAMENTOS_SUCCESS:
      // payload já chega como array limpo (extraído na saga)
      return { ...state, loading: false, agendamentos: action.payload };

    // ── Criar ─────────────────────────────────────────────────────────────
    case types.CREATE_AGENDAMENTO_SUCCESS:
      // payload = agendamento recém-criado (objeto único)
      return {
        ...state,
        loading: false,
        success: true,
        agendamentos: [...state.agendamentos, action.payload],
      };

    // ── Editar ────────────────────────────────────────────────────────────
    case types.UPDATE_AGENDAMENTO_SUCCESS:
      // payload = agendamento atualizado e populado (objeto único)
      return {
        ...state,
        loading: false,
        success: true,
        agendamentos: state.agendamentos.map((a) =>
          a._id === action.payload._id ? action.payload : a
        ),
      };

    // ── Deletar ───────────────────────────────────────────────────────────
    case types.DELETE_AGENDAMENTO_SUCCESS:
      // payload = { id }
      return {
        ...state,
        loading: false,
        success: true,
        agendamentos: state.agendamentos.filter(
          (a) => a._id !== action.payload.id
        ),
      };

    // ── Erros ─────────────────────────────────────────────────────────────
    case types.FILTER_AGENDAMENTOS_FAILURE:
    case types.CREATE_AGENDAMENTO_FAILURE:
    case types.UPDATE_AGENDAMENTO_FAILURE:
    case types.DELETE_AGENDAMENTO_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default agendamentoReducer;