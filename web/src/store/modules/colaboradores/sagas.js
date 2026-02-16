import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./types";

/* =====================================================
   LISTAR COLABORADORES
===================================================== */
function* listColaboradores({ payload: salaoId }) {
  try {
    const response = yield call(api.get, `/colaborador/salao/${salaoId}`);

    const { data } = response;

    // Se for array, mostrar item por item
    if (Array.isArray(data)) {
      console.log("=== LISTA ITEM POR ITEM ===");
      data.forEach((item, index) => {
        console.log(`Item ${index}:`, item);
      });
    }

    console.log("======================================");

    yield put({
      type: types.LIST_COLABORADORES_SUCCESS,
      payload: data.colaboradores,
    });
  } catch (err) {
    console.error("Erro ao listar colaboradores:", err);

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
    yield call(api.post, "/colaborador", payload);

    yield put({
      type: types.CREATE_COLABORADOR_SUCCESS,
    });

    yield put({
      type: types.LIST_COLABORADORES_REQUEST,
      payload: payload.salaoId,
    });

  } catch (err) {
    yield put({
      type: types.CREATE_COLABORADOR_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   ATUALIZAR COLABORADOR
===================================================== */
function* updateColaborador({ payload }) {
  try {
    yield call(api.put, `/colaborador/${payload._id}`, payload);

    yield put({
      type: types.UPDATE_COLABORADOR_SUCCESS,
    });

    if (payload?.salaoId) {
      yield put({
        type: types.LIST_COLABORADORES_REQUEST,
        payload: payload.salaoId,
      });
    }
  } catch (err) {
    console.error("Erro ao atualizar colaborador:", err);

    yield put({
      type: types.UPDATE_COLABORADOR_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   REMOVER COLABORADOR
===================================================== */
function* unlikeColaborador({ payload }) {
  try {
    const { id, salaoId } = payload;

    yield call(api.delete, `/colaborador/vinculo/${id}`);

    yield put({
      type: types.UNLIKE_COLABORADOR_SUCCESS,
    });

    if (salaoId) {
      yield put({
        type: types.LIST_COLABORADORES_REQUEST,
        payload: salaoId,
      });
    }
  } catch (err) {
    console.error("Erro ao remover colaborador:", err);

    yield put({
      type: types.UNLIKE_COLABORADOR_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   LISTAR SERVIÇOS
===================================================== */
function* listServicos({ payload: salaoId }) {
  try {
    const { data } = yield call(api.get, `/salao/servico/${salaoId}`);

    yield put({
      type: types.LIST_SERVICOS_SUCCESS,
      payload: data,
    });
  } catch (err) {
    console.error("Erro ao listar serviços:", err);

    yield put({
      type: types.LIST_SERVICOS_FAILURE,
      error: err,
    });
  }
}

/* =====================================================
   ROOT SAGA DO MÓDULO
===================================================== */
export default function* colaboradorSaga() {
  yield all([
    takeLatest(types.LIST_COLABORADORES_REQUEST, listColaboradores),

    takeLatest(types.CREATE_COLABORADOR_REQUEST, createColaborador),

    takeLatest(types.UPDATE_COLABORADOR_REQUEST, updateColaborador),

    takeLatest(types.UNLIKE_COLABORADOR_REQUEST, unlikeColaborador),

    takeLatest(types.LIST_SERVICOS_REQUEST, listServicos),
  ]);
}
