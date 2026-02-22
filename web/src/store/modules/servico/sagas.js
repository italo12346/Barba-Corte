import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./types";

/* ======================================
   LISTAR SERVIÇOS
====================================== */
function* listServicos({ payload }) {
   const salaoId = payload.salaoId || payload;
  try {
    console.log({salaoId})
    const { data } = yield call(
      api.get,
      `/servicos/servico/${salaoId}`
    );
    console.log("Resposta API:", data);

    
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

    // 🔥 ADICIONE ISSO
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
      })
    );

    if (payload.arquivos?.length) {
      payload.arquivos.forEach((file, idx) => {
        formData.append(`arquivo_${idx + 1}`, file.blobFile);
      });
    }

    console.log("📦 Enviando FormData:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // 🚨 NÃO DEFINA Content-Type MANUALMENTE
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
    }

    /* ==================================================
       SE NÃO TEM NOVA IMAGEM → PUT NORMAL
    ================================================== */
    else {
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
