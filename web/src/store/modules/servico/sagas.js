import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./types";

/* ======================================
   LISTAR SERVIÇOS
====================================== */
function* listServicos() {
  try {
    const { data } = yield call(api.get, `/servicos/servico/`);

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

// ===============================
// CREATE SERVICO
// ===============================
function* createServico({ payload }) {
  try {
    const formData = new FormData();

    formData.append("salaoId", payload.salaoId);

    formData.append(
      "servico",
      JSON.stringify({
        titulo: payload.titulo,
        descricao: payload.descricao,
        preco: payload.preco,
        comissao: payload.comissao,
        duracao: payload.duracao,
        status: payload.status || "A",
        recorrencia: payload.recorrencia || "UNICO",
      }),
    );

    // ✅ usa novaImagem (File direto) igual ao update
    if (payload.novaImagem) {
      formData.append("file", payload.novaImagem);
    }

    yield call(api.post, "/servicos/upload", formData);

    yield put({ type: types.CREATE_SERVICO_SUCCESS });

    yield put({
      type: types.LIST_SERVICOS_REQUEST,
      payload: payload.salaoId,
    });
  } catch (err) {
    console.error("❌ CREATE_SERVICO error:", err.response?.data || err);
    yield put({
      type: types.CREATE_SERVICO_FAILURE,
      error: err.response?.data || err,
    });
  }
}

/* ======================================
   ATUALIZAR SERVIÇO
====================================== */
function* updateServico({ payload }) {
  try {
    const { servico, salaoId } = payload;
    const { _id, arquivos, novaImagem, ...data } = servico;

    if (novaImagem) {
      const formData = new FormData();

      formData.append("servicoId", _id);
      formData.append("salaoId", salaoId);
      formData.append("servico", JSON.stringify(data));
      formData.append("file", novaImagem);

      yield call(api.post, "/servicos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {

    /* ==================================================
       SE NÃO TEM NOVA IMAGEM → PUT NORMAL
    ================================================== */
      yield call(api.put, `/servicos/${_id}`, data);
    }

    yield put({ type: types.UPDATE_SERVICO_SUCCESS });

    yield put({
      type: types.LIST_SERVICOS_REQUEST,
      payload: salaoId,
    });
  } catch (err) {
    yield put({
      type: types.UPDATE_SERVICO_FAILURE,
      error: err,
    });
  }
}

/* ======================================
   REMOVER SERVIÇO
====================================== */
function* deleteServico({ payload }) {
  try {
    const { id, salaoId } = payload;

    yield call(api.delete, `/servicos/${id}`);

    yield put({ type: types.DELETE_SERVICO_SUCCESS });

    yield put({
      type: types.LIST_SERVICOS_REQUEST,
      payload: salaoId,
    });
  } catch (err) {
    yield put({
      type: types.DELETE_SERVICO_FAILURE,
      error: err,
    });
  }
}

/* ======================================
   ROOT SAGA
====================================== */
export default function* servicoSaga() {
  yield all([
    takeLatest(types.LIST_SERVICOS_REQUEST, listServicos),
    takeLatest(types.CREATE_SERVICO_REQUEST, createServico),
    takeLatest(types.UPDATE_SERVICO_REQUEST, updateServico),
    takeLatest(types.DELETE_SERVICO_REQUEST, deleteServico),
  ]);
}
