import types from "./types";

const INITIAL_STATE = {
  lista: [],
  servicos: [],

  loadingLista: false,
  loadingServicos: false,

  form: {
    loading: false,
  },
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    /* ==========================================
       FORM
    ========================================== */
    case types.UPDATE_FORM:
      return {
        ...state,
        form: { ...state.form, ...action.payload },
      };

    /* ==========================================
       LISTAR COLABORADORES
    ========================================== */
    case types.LIST_COLABORADORES_REQUEST:
      return {
        ...state,
        loadingLista: true,
      };

    case types.LIST_COLABORADORES_SUCCESS:
      return {
        ...state,
        lista: action.payload,
        loadingLista: false,
      };

    case types.LIST_COLABORADORES_FAILURE:
      return {
        ...state,
        loadingLista: false,
      };

    /* ==========================================
       LISTAR SERVIÇOS DO SALÃO
    ========================================== */
    case types.LIST_SERVICOS_REQUEST:
      return {
        ...state,
        loadingServicos: true,
      };

    case types.LIST_SERVICOS_SUCCESS:
      return {
        ...state,
        servicos: action.payload,
        loadingServicos: false,
      };

    case types.LIST_SERVICOS_FAILURE:
      return {
        ...state,
        loadingServicos: false,
      };

    default:
      return state;
  }
}
