const INITIAL_STATE = {
  data: [],
  loading: false,
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

    default:
      return state;
  }
}
