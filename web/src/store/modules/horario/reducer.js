import Types from "./types";

const INITIAL_STATE = {
  // ── Dados ────────────────────────────────────────────
  listaHorarios: [],

  // ── Loading / erro ───────────────────────────────────
  loading: false,
  error: null,

  // ── UI do componente ─────────────────────────────────
  components: {
    view: "week", // view atual do BigCalendar

    // Modal de criação / edição
    modalOpen: false,

    // Dados pré-preenchidos no modal (vindos do slot clicado)
    modalSlot: {
      horarioId: null,      // null → criação, string → edição
      colaboradorId: "",
      diasSemana: [],
      horaInicio: "",
      horaFim: "",
    },
  },
};

export default function horarioReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    // ────────────────────────────────────────────────────
    // LISTAR
    // ────────────────────────────────────────────────────
    case Types.ALL_HORARIOS_REQUEST:
      return { ...state, loading: true, error: null };

    case Types.ALL_HORARIOS_SUCCESS:
      return {
        ...state,
        loading: false,
        // A saga entrega os eventos já no formato { start, end, title, ... }
        listaHorarios: action.payload,
      };

    case Types.ALL_HORARIOS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ────────────────────────────────────────────────────
    // CRIAR
    // ────────────────────────────────────────────────────
    case Types.CREATE_HORARIO_REQUEST:
      return { ...state, loading: true, error: null };

    case Types.CREATE_HORARIO_SUCCESS:
      return {
        ...state,
        loading: false,
        // Adiciona o novo horário (já transformado) na lista
        listaHorarios: [...state.listaHorarios, ...action.payload],
        components: {
          ...state.components,
          modalOpen: false,
          modalSlot: INITIAL_STATE.components.modalSlot,
        },
      };

    case Types.CREATE_HORARIO_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ────────────────────────────────────────────────────
    // ATUALIZAR
    // ────────────────────────────────────────────────────
    case Types.UPDATE_HORARIO_REQUEST:
      return { ...state, loading: true, error: null };

    case Types.UPDATE_HORARIO_SUCCESS:
      return {
        ...state,
        loading: false,
        // Substitui o horário atualizado na lista
        listaHorarios: state.listaHorarios.map((h) =>
          h.id === action.payload.id ? action.payload : h
        ),
        components: {
          ...state.components,
          modalOpen: false,
          modalSlot: INITIAL_STATE.components.modalSlot,
        },
      };

    case Types.UPDATE_HORARIO_FAILURE:
      return { ...state, loading: false, error: action.payload };

      
    // ────────────────────────────────────────────────────
    // EXCLUIR (CORRIGIDO)
    // ────────────────────────────────────────────────────
    case Types.DELETE_HORARIO_REQUEST:
      return { ...state, loading: true, error: null };

    case Types.DELETE_HORARIO_SUCCESS:
      return {
        ...state,
        loading: false,
        /**
         * CORREÇÃO: Filtramos a lista local removendo todos os eventos 
         * que possuem o 'horarioId' igual ao ID deletado na API.
         * Isso garante que a página atualize automaticamente.
         */
        listaHorarios: state.listaHorarios.filter(
          (h) => h.horarioId !== action.payload
        ),
      };

    case Types.DELETE_HORARIO_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ────────────────────────────────────────────────────
    // UI — MODAL
    // ────────────────────────────────────────────────────
    case Types.OPEN_HORARIO_MODAL:
      return {
        ...state,
        components: {
          ...state.components,
          modalOpen: true,
          modalSlot: {
            ...INITIAL_STATE.components.modalSlot,
            ...action.payload, // sobrescreve com os dados do slot/evento
          },
        },
      };

    case Types.CLOSE_HORARIO_MODAL:
      return {
        ...state,
        components: {
          ...state.components,
          modalOpen: false,
          modalSlot: INITIAL_STATE.components.modalSlot,
        },
      };

    // ────────────────────────────────────────────────────
    // UI — VIEW
    // ────────────────────────────────────────────────────
    case Types.SET_CALENDAR_VIEW:
      return {
        ...state,
        components: {
          ...state.components,
          view: action.payload,
        },
      };

    default:
      return state;
  }
}
