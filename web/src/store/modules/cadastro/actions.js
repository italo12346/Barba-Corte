import * as types from './types'

export function registerRequest(data) {
  return {
    type: types.REGISTER_REQUEST,
    payload: data,
  }
}

export function registerSuccess(user) {
  return {
    type: types.REGISTER_SUCCESS,
    payload: user,
  }
}

export function registerFailure(error) {
  return {
    type: types.REGISTER_FAILURE,
    payload: error,
  }
}
