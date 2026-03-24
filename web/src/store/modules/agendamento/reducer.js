import types from "./types";
import { produce } from "immer";

const INITIAL = {
  agendamentos: [],
  loading: false,
  error: null,
};

export default function reducer(state = INITIAL, action) {
  switch (action.type) {

    // ========================= FILTER =========================

    case types.UPDATE_AGENDAMENTOS:
    case types.FILTER_AGENDAMENTOS_SUCCESS: {
      return produce(state, (draft) => {
        draft.agendamentos = action.payload.agendamentos || [];
        draft.loading = false;
      });
    }

    case types.FILTER_AGENDAMENTOS_ERROR: {
      return produce(state, (draft) => {
        draft.loading = false;
        draft.error = 'Erro ao filtrar agendamentos';
      });
    }

    // ========================= CREATE =========================

    case types.CREATE_AGENDAMENTO_SUCCESS: {
      return produce(state, (draft) => {
        draft.agendamentos.push(action.payload.agendamento);
        draft.loading = false;
      });
    }

    // ========================= UPDATE ONE =========================

    case types.UPDATE_AGENDAMENTO_SUCCESS: {
      return produce(state, (draft) => {
        const idx = draft.agendamentos.findIndex(
          (a) => a._id === action.payload.agendamento._id
        );
        if (idx !== -1) {
          draft.agendamentos[idx] = action.payload.agendamento;
        }
        draft.loading = false;
      });
    }

    // ========================= DELETE =========================

    case types.DELETE_AGENDAMENTO_SUCCESS: {
      return produce(state, (draft) => {
        draft.agendamentos = draft.agendamentos.filter(
          (a) => a._id !== action.payload.id
        );
        draft.loading = false;
      });
    }

    // ========================= LOADING / ERROR =========================

    case types.CREATE_AGENDAMENTO:
    case types.UPDATE_AGENDAMENTO:
    case types.DELETE_AGENDAMENTO: {
      return produce(state, (draft) => {
        draft.loading = true;
        draft.error = null;
      });
    }

    case types.CREATE_AGENDAMENTO_ERROR:
    case types.UPDATE_AGENDAMENTO_ERROR:
    case types.DELETE_AGENDAMENTO_ERROR: {
      return produce(state, (draft) => {
        draft.loading = false;
        draft.error = 'Ocorreu um erro. Tente novamente.';
      });
    }

    default:
      return state;
  }
}
