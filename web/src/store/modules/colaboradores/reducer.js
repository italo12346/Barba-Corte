import types from "./types";

const INITIAL_STATE = {
  lista: [],
  servicos: [],
  form: {
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    servicos: [],
    loading: false,
  },
  error: null,
};

export default function colaborador(state = INITIAL_STATE, action) {
  console.log("ACTION:", action.type);

  switch (action.type) {
    // =============================
    // LISTAR COLABORADORES
    // =============================
    case types.LIST_COLABORADORES_REQUEST:
      return {
        ...state,
        form: { ...state.form, loading: true },
      };

    case types.LIST_COLABORADORES_SUCCESS:
      console.log("✅ Lista carregada:", action.payload);

      return {
        ...state,
        lista: action.payload,
        form: { ...state.form, loading: false },
      };

    // =============================
    // SERVIÇOS
    // =============================
    case types.SERVICOS_SUCCESS:
      return {
        ...state,
        servicos: action.payload,
      };

    // =============================
    // UPDATE FORM
    // =============================
    case types.UPDATE_FORM:
      console.log("📝 Atualizando form:", action.payload);

      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
      };

    // =============================
    // CREATE
    // =============================
    case types.CREATE_COLABORADOR_REQUEST:
      return {
        ...state,
        form: { ...state.form, loading: true },
        error: null,
      };

    case types.CREATE_COLABORADOR_SUCCESS:
      return {
        ...state,
        form: INITIAL_STATE.form,
      };

    case types.CREATE_COLABORADOR_FAILURE:
      return {
        ...state,
        form: { ...state.form, loading: false },
        error: action.error,
      };

    default:
      return state;
  }
}
