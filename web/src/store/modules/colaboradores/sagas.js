import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./types";

/* =====================================================
   LISTAR COLABORADORES
===================================================== */
function* listColaboradores() {
  try {
    const { data } = yield call(api.get, `/colaborador/salao/`);

    yield put({
      type: types.LIST_COLABORADORES_SUCCESS,
      payload: data.colaboradores,
    });
  } catch (err) {
    yield put({
      type: types.LIST_COLABORADORES_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   CRIAR COLABORADOR
===================================================== */
function* createColaborador({ payload }) {
  try {
    const { fotoFile, ...colaborador } = payload; // ✅ sem salaoId

    const { data } = yield call(api.post, "/colaborador", { colaborador }); // ✅ sem salaoId no body

    if (fotoFile && data.colaboradorId) {
      const formData = new FormData();
      formData.append("colaboradorId", data.colaboradorId);
      formData.append("file", fotoFile);

      yield call(api.post, "/colaborador/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    yield put({
      type: types.CREATE_COLABORADOR_SUCCESS,
      payload: data,
    });

    yield put({ type: types.LIST_COLABORADORES_REQUEST });

  } catch (err) {
    yield put({
      type: types.CREATE_COLABORADOR_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}

/* =====================================================
   ATUALIZAR COLABORADOR
===================================================== */
function* updateColaborador({ payload }) {
  try {
    const { colaborador } = payload;

    if (!colaborador?._id) {
      throw new Error("Colaborador inválido");
    }

    const { _id, fotoFile, ...data } = colaborador;

    yield call(api.put, `/colaborador/${_id}`, data);

    if (fotoFile) {
      const formData = new FormData();
      formData.append("colaboradorId", _id);
      formData.append("file", fotoFile);

      yield call(api.post, "/colaborador/upload", formData);
    }

    yield put({ type: types.UPDATE_COLABORADOR_SUCCESS });
    yield put({ type: types.LIST_COLABORADORES_REQUEST }); // ✅ sem salaoId

  } catch (err) {
    yield put({
      type: types.UPDATE_COLABORADOR_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}

/* =====================================================
   REMOVER COLABORADOR
===================================================== */
function* unlikeColaborador({ payload }) {
  try {
    const { id } = payload; // ✅ sem salaoId

    yield call(api.delete, `/colaborador/vinculo/${id}`);

    yield put({ type: types.UNLIKE_COLABORADOR_SUCCESS });
    yield put({ type: types.LIST_COLABORADORES_REQUEST }); // ✅ sem salaoId

  } catch (err) {
    yield put({
      type: types.UNLIKE_COLABORADOR_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   LISTAR SERVIÇOS (para o select de especialidades)
===================================================== */
function* listServicos() {
  try {
    const { data } = yield call(api.get, `/servicos/servico/`); // ✅ sem salaoId na URL

    yield put({
      type: types.LIST_SERVICOS_SUCCESS,
      payload: data.servicos,
    });

  } catch (err) {
    yield put({
      type: types.LIST_SERVICOS_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   CARREGAR SERVIÇOS DO COLABORADOR
===================================================== */
function* loadServicosColaborador({ payload }) {
  try {
    const servicosData = {};

    for (const id of payload) {
      const response = yield call(api.get, `/servicos/${id}`);
      servicosData[id] = response.data.servico;
    }

    yield put({
      type: types.LOAD_SERVICOS_COLABORADOR_SUCCESS,
      payload: servicosData,
    });
  } catch (err) {
    yield put({
      type: types.LOAD_SERVICOS_COLABORADOR_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   ROOT SAGA DO MÓDULO
===================================================== */
export default function* colaboradorSaga() {
  yield all([
    takeLatest(types.LIST_COLABORADORES_REQUEST,        listColaboradores),
    takeLatest(types.CREATE_COLABORADOR_REQUEST,        createColaborador),
    takeLatest(types.UPDATE_COLABORADOR_REQUEST,        updateColaborador),
    takeLatest(types.UNLIKE_COLABORADOR_REQUEST,        unlikeColaborador),
    takeLatest(types.LIST_SERVICOS_REQUEST,             listServicos),
    takeLatest(types.LOAD_SERVICOS_COLABORADOR_REQUEST, loadServicosColaborador),
  ]);
}