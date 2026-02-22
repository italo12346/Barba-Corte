import types from "./types";

const INITIAL_STATE = {
  lista: [],
  loading: false,
  error: null,

  form: {
    titulo: "",
    loading: false,
  },
};

export default function servico(state = INITIAL_STATE, action) {
  console.log("SERVICO ACTION:", action.type);

  switch (action.type) {
    // ==========================
    // LISTAR
    // ==========================
    case types.LIST_SERVICOS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case types.LIST_SERVICOS_SUCCESS:
      return {
        ...state,
        loading: false,
        lista: action.payload,
      };

    case types.LIST_SERVICOS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
      };

    // ==========================
    // CREATE
    // ==========================
    case types.CREATE_SERVICO_REQUEST:
      return {
        ...state,
        form: { ...state.form, loading: true },
      };

    case types.CREATE_SERVICO_SUCCESS:
      return {
        ...state,
        form: INITIAL_STATE.form,
      };

    case types.CREATE_SERVICO_FAILURE:
      return {
        ...state,
        form: { ...state.form, loading: false },
        error: action.error,
      };

    // ==========================
    // UPDATE
    // ==========================
    case types.UPDATE_SERVICO_REQUEST:
      return {
        ...state,
        form: { ...state.form, loading: true },
      };

    case types.UPDATE_SERVICO_SUCCESS:
      return {
        ...state,
        form: INITIAL_STATE.form,
      };

    case types.UPDATE_SERVICO_FAILURE:
      return {
        ...state,
        form: { ...state.form, loading: false },
        error: action.error,
      };

    // ==========================
    // DELETE
    // ==========================
    case types.DELETE_SERVICO_FAILURE:
      return {
        ...state,
        error: action.error,
      };

    // ==========================
    // FORM
    // ==========================
    case types.UPDATE_FORM:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
      };

    case types.RESET_FORM:
      return {
        ...state,
        form: INITIAL_STATE.form,
      };

    default:
      return state;
  }
}
