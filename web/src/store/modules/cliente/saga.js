import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../../services/api';
import consts from '../../../consts/consts';
import Types from './types';

import {
  getClientesSuccess,
  getClientesFailure,
  deleteClienteSuccess,
  deleteClienteFailure,
   getAgendamentosClienteSuccess,
  getAgendamentosClienteFailure,
} from './actions';

function* fetchClientes() {
  try {
    const response = yield call(
      api.get,
      `/cliente/${consts.salaoId}`
    );

    yield put(getClientesSuccess(response.data.clientes));
  } catch (error) {
    yield put(getClientesFailure(error.message));
  }
}

function* fetchAgendamentosCliente({ payload }) {
  try {
    const response = yield call(
      api.get,
      `/agendamento/cliente/${payload}`
    );

    yield put(
      getAgendamentosClienteSuccess(response.data.agendamentos)
    );
  } catch (error) {
    yield put(
      getAgendamentosClienteFailure(error.message)
    );
  }
}

function* deleteClienteSaga({ payload }) {
  try {
    yield call(api.delete, `/cliente/${payload}`);
    yield put(deleteClienteSuccess(payload));
  } catch (error) {
    yield put(deleteClienteFailure(error.message));
  }
}

export default function* clientesSaga() {
  yield takeLatest(
    Types.GET_CLIENTES_REQUEST,
    fetchClientes
  );

  yield takeLatest(
    Types.GET_AGENDAMENTOS_CLIENTE_REQUEST,
    fetchAgendamentosCliente
  );

  yield takeLatest(
    Types.DELETE_CLIENTE_REQUEST,
    deleteClienteSaga
  );
}
