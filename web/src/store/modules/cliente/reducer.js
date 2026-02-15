const INITIAL_STATE = {
  data: [],
  loading: false,
  agendamentos: [],
  loadingAgendamentos: false,
};

export default function cliente(
  state = INITIAL_STATE,
  action
) {
  switch (action.type) {

    case "@clientes/GET_CLIENTES_REQUEST":
      return { ...state, loading: true };

    case "@clientes/GET_CLIENTES_SUCCESS":
      return {
        ...state,
        data: action.payload,
        loading: false,
      };

    case "@clientes/GET_CLIENTES_FAILURE":
      return { ...state, loading: false };
      case "@clientes/GET_AGENDAMENTOS_CLIENTE_REQUEST":
  return { ...state, loadingAgendamentos: true };

case "@clientes/GET_AGENDAMENTOS_CLIENTE_SUCCESS":
  return {
    ...state,
    agendamentos: action.payload,
    loadingAgendamentos: false,
  };

case "@clientes/GET_AGENDAMENTOS_CLIENTE_FAILURE":
  return { ...state, loadingAgendamentos: false };

    default:
      return state;
  }
}
