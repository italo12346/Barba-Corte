import * as types from './types'

const INITIAL_STATE = {
  user: null,
  loading: false,
  error: null,
}

export default function cadastro(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case types.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
      }

    case types.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    default:
      return state
  }
}
