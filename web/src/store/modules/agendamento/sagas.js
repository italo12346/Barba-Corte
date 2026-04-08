import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import api from "../../../services/api";
import types from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────
const agendamentoService = {
  filter: (start, end) =>
    api.post("/agendamento/filter", { range: { start, end } }),

  create: (dados) => api.post("/agendamento", dados),

  update: (id, dados) => api.put(`/agendamento/${id}`, dados),

  remove: (id) => api.delete(`/agendamento/${id}`),
};

// ── Workers ────────────────────────────────────────────────────────────────

function* filterAgendamentosSaga({ payload }) {
  try {
    const { start, end } = payload;
    const { data } = yield call(agendamentoService.filter, start, end);

    yield put({
      type: types.FILTER_AGENDAMENTOS_SUCCESS,
      payload: data.agendamentos || [],
    });
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao buscar agendamentos";
    yield put({ type: types.FILTER_AGENDAMENTOS_FAILURE, payload: msg });
  }
}

function* createAgendamentoSaga({ payload }) {
  try {
    const { data } = yield call(agendamentoService.create, payload); // ✅ sem salaoId

    yield put({
      type: types.CREATE_AGENDAMENTO_SUCCESS,
      payload: data.agendamento,
    });
    toast.success("Agendamento criado com sucesso!");
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao criar agendamento";
    yield put({ type: types.CREATE_AGENDAMENTO_FAILURE, payload: msg });
    toast.error(msg);
  }
}

function* updateAgendamentoSaga({ payload }) {
  try {
    const { id, dados } = payload;
    const { data } = yield call(agendamentoService.update, id, dados);

    yield put({
      type: types.UPDATE_AGENDAMENTO_SUCCESS,
      payload: data.agendamento,
    });
    toast.success("Agendamento atualizado!");
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao atualizar agendamento";
    yield put({ type: types.UPDATE_AGENDAMENTO_FAILURE, payload: msg });
    toast.error(msg);
  }
}

function* deleteAgendamentoSaga({ payload }) {
  try {
    const { id } = payload;
    yield call(agendamentoService.remove, id);

    yield put({ type: types.DELETE_AGENDAMENTO_SUCCESS, payload: { id } });
    toast.success("Agendamento removido!");
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao remover agendamento";
    yield put({ type: types.DELETE_AGENDAMENTO_FAILURE, payload: msg });
    toast.error(msg);
  }
}

// ── Watcher ────────────────────────────────────────────────────────────────
export default function* agendamentoSaga() {
  yield takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamentosSaga);
  yield takeLatest(types.CREATE_AGENDAMENTO,  createAgendamentoSaga);
  yield takeLatest(types.UPDATE_AGENDAMENTO,  updateAgendamentoSaga);
  yield takeLatest(types.DELETE_AGENDAMENTO,  deleteAgendamentoSaga);
}