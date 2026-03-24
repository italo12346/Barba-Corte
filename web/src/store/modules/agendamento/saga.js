import { takeLatest, all, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import consts from '../../../consts/consts';
import types from './types';
import { updateAgendamento } from './actions';

// ========================= FILTER =========================

export function* filterAgendamentos(action) {
  try {
    const { start, end } = action.payload;

    const { data: response } = yield call(api.post, '/agendamento/filter', {
      salaoId: consts.salaoId,
      range: { start, end },
    });

    if (response.error) throw new Error(response.error);

    yield put(updateAgendamento(response.agendamentos));
  } catch (err) {
    console.error('Erro filter:', err);
    yield put({ type: types.FILTER_AGENDAMENTOS_ERROR });
  }
}

// ========================= CREATE =========================

export function* createAgendamento(action) {
  try {
    const { data: response } = yield call(api.post, '/agendamento', {
      ...action.payload,
      salaoId: consts.salaoId,
    });

    if (response.error) throw new Error(response.error);

    yield put({
      type: types.CREATE_AGENDAMENTO_SUCCESS,
      payload: { agendamento: response.agendamento },
    });
  } catch (err) {
    console.error('Erro create:', err);
    yield put({ type: types.CREATE_AGENDAMENTO_ERROR });
  }
}

// ========================= UPDATE ONE =========================

export function* updateOneAgendamento(action) {
  try {
    const { id, data } = action.payload;

    const { data: response } = yield call(api.put, `/agendamento/${id}`, data);

    if (response.error) throw new Error(response.error);

    yield put({
      type: types.UPDATE_AGENDAMENTO_SUCCESS,
      payload: { agendamento: response.agendamento },
    });
  } catch (err) {
    console.error('Erro update:', err);
    yield put({ type: types.UPDATE_AGENDAMENTO_ERROR });
  }
}

// ========================= DELETE =========================

export function* deleteAgendamento(action) {
  try {
    const { id } = action.payload;

    const { data: response } = yield call(api.delete, `/agendamento/${id}`);

    if (response.error) throw new Error(response.error);

    yield put({
      type: types.DELETE_AGENDAMENTO_SUCCESS,
      payload: { id },
    });
  } catch (err) {
    console.error('Erro delete:', err);
    yield put({ type: types.DELETE_AGENDAMENTO_ERROR });
  }
}

// ========================= ROOT SAGA =========================

export default all([
  takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamentos),
  takeLatest(types.CREATE_AGENDAMENTO, createAgendamento),
  takeLatest(types.UPDATE_AGENDAMENTO, updateOneAgendamento),
  takeLatest(types.DELETE_AGENDAMENTO, deleteAgendamento),
]);
