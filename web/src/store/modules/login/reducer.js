const INITIAL_STATE = {
  token: null,
  user: null,
  loading: false,
  error: null,
  authenticated: false
};

export default function auth(state = INITIAL_STATE, action) {
  switch (action.type) {

    case "LOGIN_REQUEST":
      return { ...state, loading: true };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        authenticated: true,
        user: { nome: "Usuário Teste" }
      };

    case "LOGOUT":
      return INITIAL_STATE;

    default:
      return state;
  }
}
