import types from './authTypes';

export function loginRequest(email, senha) {
  return {
    type: types.LOGIN_REQUEST,
    payload: { email, senha },
  };
}

export function loginSuccess(salao) {
  return {
    type: types.LOGIN_SUCCESS,
    payload: { salao },
  };
}

export function loginFailure(error) {
  return {
    type: types.LOGIN_FAILURE,
    payload: { error },
  };
}

export function logout() {
  return {
    type: types.LOGOUT,
  };
}
