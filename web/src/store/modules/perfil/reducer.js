import types from "../auth/authTypes";

const token = localStorage.getItem("token");

const INITIAL_STATE = {
  token: token || null,
  salao: null,
  loading: false,
  error: null,
  autenticado: !!token,
};

export default function profileReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case types.UPDATE_PERFIL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.UPDATE_PERFIL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        salao: action.payload,
      };

    case types.UPDATE_PERFIL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}