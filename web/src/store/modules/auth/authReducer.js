// store/modules/auth/reducer.js
import types from "./authTypes";

const token = localStorage.getItem("token");

const INITIAL_STATE = {
  token: token || null,
  salao: null,
  loading: false,
  error: null,
  autenticado: !!token,
};

export default function authReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case types.LOGIN_REQUEST:
    case types.REGISTER_REQUEST:
    case types.VERIFY_TOKEN_REQUEST:
      return { ...state, loading: true, error: null };

    case types.LOGIN_SUCCESS:
    case types.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        salao: action.payload.salao,
        autenticado: true,
      };

    case types.VERIFY_TOKEN_SUCCESS:
      return {
        ...state,
        loading: false,
        salao: action.payload,
        autenticado: true,
      };

    case types.LOGIN_FAILURE:
    case types.REGISTER_FAILURE:
    case types.VERIFY_TOKEN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        autenticado: false,
        token: null,
        salao: null,
      };

    case types.LOGOUT:
      return {
        ...INITIAL_STATE,
        token: null,
        autenticado: false,
      };

    default:
      return state;
  }
}
