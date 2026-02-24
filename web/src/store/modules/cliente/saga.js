import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import consts from "../../../consts/consts";
import types from "./types";

/* =====================================================
   LISTAR CLIENTES
===================================================== */
function* listClientes() {
  try {
    const response = yield call(api.get, `/cliente/${consts.salaoId}`);

    yield put({
      type: types.GET_CLIENTES_SUCCESS,
      payload: response.data.clientes,
    });
  } catch (err) {
    yield put({
      type: types.GET_CLIENTES_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}

function* createCliente({ payload }) {
  try {
    const { salaoId } = consts;
    const { fotoFile, ...cliente } = payload;

    const formData = new FormData();

    formData.append("salaoId", salaoId);
    formData.append("cliente", JSON.stringify(cliente));

    if (fotoFile) {
      formData.append("file", fotoFile);
    }

    yield call(api.post, "/cliente/upload", formData);

    yield put({ type: types.CREATE_CLIENTE_SUCCESS });
    yield put({ type: types.GET_CLIENTES_REQUEST });
    yield put({
      type: types.LIST_CLIENTES_REQUEST,
      payload: salaoId,
    });
  } catch (err) {
    yield put({
      type: types.CREATE_CLIENTE_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}
/* =====================================================
   ATUALIZAR CLIENTE
===================================================== */
function* updateCliente({ payload }) {
  try {
    const { data } = yield call(api.put, `/cliente/${payload._id}`, payload);

    yield put({
      type: types.EDIT_CLIENTE_SUCCESS,
      payload: data.cliente,
    });

    yield put({
      type: types.GET_CLIENTES_REQUEST,
    });
  } catch (err) {
    yield put({
      type: types.EDIT_CLIENTE_FAILURE,
      payload: err.message,
    });
  }
}

/* =====================================================
   DELETAR CLIENTE
===================================================== */
function* deleteCliente({ payload }) {
  try {
    yield call(api.delete, `/cliente/${payload}`);

    yield put({
      type: types.DELETE_CLIENTE_SUCCESS,
    });

    // 🔁 reload lista
    yield put({
      type: types.GET_CLIENTES_REQUEST,
    });
  } catch (err) {
    yield put({
      type: types.DELETE_CLIENTE_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}

/* =====================================================
   AGENDAMENTOS DO CLIENTE
===================================================== */
function* getAgendamentosCliente({ payload }) {
  try {
    const response = yield call(api.get, `/agendamento/cliente/${payload}`);

    yield put({
      type: types.GET_AGENDAMENTOS_CLIENTE_SUCCESS,
      payload: response.data.agendamentos,
    });
  } catch (err) {
    yield put({
      type: types.GET_AGENDAMENTOS_CLIENTE_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}

/* =====================================================
   ROOT
===================================================== */
export default function* clienteSaga() {
  yield all([
    takeLatest(types.GET_CLIENTES_REQUEST, listClientes),

    takeLatest(types.CREATE_CLIENTE_REQUEST, createCliente),

    takeLatest(types.EDIT_CLIENTE_REQUEST, updateCliente),

    takeLatest(types.DELETE_CLIENTE_REQUEST, deleteCliente),

    takeLatest(types.GET_AGENDAMENTOS_CLIENTE_REQUEST, getAgendamentosCliente),
  ]);
}
