import types from "./types";

const INITIAL_STATE = {
  data: [],
  loading: false,
  error: null,

  agendamentos: [],
  loadingAgendamentos: false,

  form: {
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: null,
    sexo: "",
    senha: "",
    fotoFile: null,
    fotoPreview: null,
    documento: {
      tipo: "CPF",
      numero: "",
    },
  },
};

export default function cliente(state = INITIAL_STATE, action) {
  switch (action.type) {
    /* =====================================================
       LISTAR CLIENTES
    ===================================================== */
    case types.GET_CLIENTES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.GET_CLIENTES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload || [],
      };

    case types.GET_CLIENTES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    /* =====================================================
       CRIAR CLIENTE
    ===================================================== */
    case types.CREATE_CLIENTE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.CREATE_CLIENTE_SUCCESS:
      return {
        ...state,
        loading: false,
        form: INITIAL_STATE.form,
      };

    case types.CREATE_CLIENTE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    /* =====================================================
       ATUALIZAR CLIENTE
    ===================================================== */
    case types.EDIT_CLIENTE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.EDIT_CLIENTE_SUCCESS:
      return {
        ...state,
        loading: false,
        form: INITIAL_STATE.form,
      };

    case types.EDIT_CLIENTE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    /* =====================================================
       DELETAR CLIENTE
    ===================================================== */
    case types.DELETE_CLIENTE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.DELETE_CLIENTE_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case types.DELETE_CLIENTE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    /* =====================================================
       SET FORM (EDITAR CLIENTE)
    ===================================================== */
    case types.SET_CLIENTE_FORM:
      return {
        ...state,
        form: {
          ...action.payload,

          // garante estrutura consistente
          fotoFile: null,
          fotoPreview: action.payload?.foto || null,

          documento: {
            tipo: action.payload?.documento?.tipo || "CPF",
            numero: action.payload?.documento?.numero || "",
          },
        },
      };

    /* =====================================================
       AGENDAMENTOS DO CLIENTE
    ===================================================== */
    case types.GET_AGENDAMENTOS_CLIENTE_REQUEST:
      return {
        ...state,
        loadingAgendamentos: true,
      };

    case types.GET_AGENDAMENTOS_CLIENTE_SUCCESS:
      return {
        ...state,
        loadingAgendamentos: false,
        agendamentos: action.payload || [],
      };

    case types.GET_AGENDAMENTOS_CLIENTE_FAILURE:
      return {
        ...state,
        loadingAgendamentos: false,
      };

    default:
      return state;
  }
}