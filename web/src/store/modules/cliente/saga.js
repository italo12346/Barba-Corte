import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./types";

/* =====================================================
   LISTAR CLIENTES
===================================================== */
function* listClientes() {
  try {
    const response = yield call(api.get, `/cliente/`);

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
    const { fotoFile, ...cliente } = payload;

    const formData = new FormData();

    formData.append("cliente", JSON.stringify(cliente));

    if (fotoFile) {
      formData.append("file", fotoFile);
    }

    yield call(api.post, "/cliente/upload", formData);

    yield put({ type: types.CREATE_CLIENTE_SUCCESS });
    yield put({ type: types.GET_CLIENTES_REQUEST });
    yield put({
      type: types.LIST_CLIENTES_REQUEST,
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

    const formData = new FormData();

    formData.append("clienteId", payload._id);
    formData.append("cliente", JSON.stringify(payload));

    // ENVIA FOTO SOMENTE SE EXISTIR
    if (payload.fotoFile instanceof File) {
      formData.append("file", payload.fotoFile);
    }

    const { data } = yield call(api.post, "/cliente/upload", formData);

    yield put({
      type: types.EDIT_CLIENTE_SUCCESS,
      payload: data,
    });

    yield put({
      type: types.GET_CLIENTES_REQUEST,
    });

  } catch (err) {

    yield put({
      type: types.EDIT_CLIENTE_FAILURE,
      payload: err.response?.data?.message || err.message,
    });

  }
}

/* =====================================================
   DELETAR CLIENTE
===================================================== */
function* deleteCliente({ payload }) {
  try {
    yield call(api.delete, `/cliente/vinculo/${payload}`);

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
