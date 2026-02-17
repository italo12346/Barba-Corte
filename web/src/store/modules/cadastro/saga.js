import { call, put, takeLatest } from 'redux-saga/effects'
import * as types from './types'
import { registerSuccess, registerFailure } from './actions'

// simulação de API
function fakeApi(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 1000)
  })
}

function* register({ payload }) {
  try {
    const response = yield call(fakeApi, payload)

    yield put(registerSuccess(response))
    alert('Cadastro realizado com sucesso!')
  } catch (error) {
    yield put(registerFailure('Erro ao cadastrar'))
  }
}

export default function* authSaga() {
  yield takeLatest(types.REGISTER_REQUEST, register)
}
