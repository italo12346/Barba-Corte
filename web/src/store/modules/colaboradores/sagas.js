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
console.log({data});

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
    const { salaoId, fotoFile, ...data } = payload;

    if (!salaoId) {
      throw new Error("salaoId obrigatório");
    }

    const formData = new FormData();
    formData.append("salaoId", salaoId);
    formData.append("colaborador", JSON.stringify(data));

    if (fotoFile) {
      formData.append("file", fotoFile);
    }

    yield call(api.post, "/colaborador/upload", formData);

    yield put({ type: types.CREATE_COLABORADOR_SUCCESS });

    yield put({
      type: types.LIST_COLABORADORES_REQUEST,
      payload: salaoId,
    });

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
    const { colaborador, salaoId } = payload;

    if (!colaborador?._id) {
      throw new Error("Colaborador inválido");
    }

    const { _id, fotoFile, ...data } = colaborador;

    // =========================
    // Atualiza dados base
    // =========================
    yield call(api.put, `/colaborador/${_id}`, data);

    // =========================
    // Se tiver nova foto → upload separado
    // =========================
    if (fotoFile) {
      const formData = new FormData();
      formData.append("colaboradorId", _id);
      formData.append("file", fotoFile);

      yield call(api.post, "/colaborador/upload", formData);
    }

    yield put({ type: types.UPDATE_COLABORADOR_SUCCESS });

    yield put({
      type: types.LIST_COLABORADORES_REQUEST,
      payload: salaoId,
    });

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
    const { data } = yield call(
      api.get,
      `/salao/servico/${salaoId}`
    );

    yield put({
      type: types.LIST_SERVICOS_SUCCESS,
      payload: data.servicos, // ajuste se necessário
    });

  } catch (err) {
    yield put({
      type: types.LIST_SERVICOS_FAILURE,
      error: err,
    });
  }
}

function* loadServicosColaborador({ payload }) {
  try {
    // payload = array de IDs de serviços
    const servicosData = {};

    for (const id of payload) {
      const response = yield call(api.get, `/servicos/${id}`);
      servicosData[id] = response.data.servico; // pegando objeto completo do serviço
    }

    yield put({
      type: types.LOAD_SERVICOS_COLABORADOR_SUCCESS,
      payload: servicosData,
    });
  } catch (err) {
    console.error("Erro ao carregar serviços do colaborador:", err);
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
    takeLatest(types.LIST_COLABORADORES_REQUEST, listColaboradores),

    takeLatest(types.CREATE_COLABORADOR_REQUEST, createColaborador),

    takeLatest(types.UPDATE_COLABORADOR_REQUEST, updateColaborador),

    takeLatest(types.UNLIKE_COLABORADOR_REQUEST, unlikeColaborador),

    takeLatest(types.LIST_SERVICOS_REQUEST, listServicos),
    takeLatest(types.LOAD_SERVICOS_COLABORADOR_REQUEST, loadServicosColaborador),
  ]);
}
