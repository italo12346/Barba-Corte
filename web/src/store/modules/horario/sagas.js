import { takeLatest, all, call, put, select } from "redux-saga/effects";
import {
  updateHorario,
  resetHorario,
  allHorarios,
} from "./actions";
import types from "./types";
import api from "../../../services/api";
import consts from "../../../consts/consts";
import { Notification, toaster } from "rsuite";

// ========================================
// HELPERS
// ========================================

function notify(type, message) {
  toaster.push(
    <Notification type={type} header={type === "error" ? "Erro" : "Sucesso"} closable>
      {message}
    </Notification>,
    { placement: "topStart" }
  );
}

function mapToCalendarEvents(horarios) {
  return horarios.map((h) => ({
    _id: h._id,
    title: h.colaborador?.nome || "Disponível",
    start: new Date(h.dataInicio),
    end: new Date(h.dataFim),
    resource: h,
  }));
}

// ========================================
// CRIAR
// ========================================

export function* addHorario() {
  try {
    const { horario, form, components } = yield select(
      (state) => state.horario
    );

    yield put(updateHorario({ form: { ...form, saving: true } }));

    const { data: res } = yield call(api.post, "/horario", {
      ...horario,
      salaoId: consts.salaoId,
    });

    yield put(updateHorario({ form: { ...form, saving: false } }));

    if (res.error) {
      notify("error", res.message);
      return;
    }

    yield put(allHorarios());
    yield put(updateHorario({ components: { ...components, drawer: false } }));
    yield put(resetHorario());

    notify("success", "Horário salvo com sucesso!");
  } catch (err) {
    yield put(updateHorario({ form: { saving: false } }));
    notify("error", err.message);
  }
}

// ========================================
// LISTAR
// ========================================

export function* handleAllHorarios() {
  try {
    const { form } = yield select((state) => state.horario);

    yield put(updateHorario({ form: { ...form, filtering: true } }));

    const { data: res } = yield call(
      api.get,
      `/horario/salao/${consts.salaoId}`
    );

    yield put(updateHorario({ form: { ...form, filtering: false } }));

    if (res.error) {
      notify("error", res.message);
      return;
    }

    const eventos = mapToCalendarEvents(res.horarios);
    yield put(updateHorario({ horarios: eventos }));
  } catch (err) {
    yield put(updateHorario({ form: { filtering: false } }));
    notify("error", err.message);
  }
}

// ========================================
// ATUALIZAR
// ========================================

export function* saveHorario() {
  try {
    const { horario, form, components } = yield select(
      (state) => state.horario
    );

    yield put(updateHorario({ form: { ...form, saving: true } }));

    const { data: res } = yield call(
      api.put,
      `/horario/${horario._id}`,
      horario
    );

    yield put(updateHorario({ form: { ...form, saving: false } }));

    if (res.error) {
      notify("error", res.message);
      return;
    }

    yield put(allHorarios());
    yield put(updateHorario({ components: { ...components, drawer: false } }));
    yield put(resetHorario());

    notify("success", "Horário atualizado com sucesso!");
  } catch (err) {
    yield put(updateHorario({ form: { saving: false } }));
    notify("error", err.message);
  }
}

// ========================================
// REMOVER
// ========================================

export function* removeHorario() {
  try {
    const { horario, form, components } = yield select(
      (state) => state.horario
    );

    yield put(updateHorario({ form: { ...form, saving: true } }));

    const { data: res } = yield call(
      api.delete,
      `/horario/${horario._id}`
    );

    yield put(updateHorario({ form: { ...form, saving: false } }));

    if (res.error) {
      notify("error", res.message);
      return;
    }

    yield put(allHorarios());
    yield put(
      updateHorario({
        components: {
          ...components,
          drawer: false,
          confirmDelete: false,
        },
      })
    );

    notify("success", "Horário removido com sucesso!");
  } catch (err) {
    yield put(updateHorario({ form: { saving: false } }));
    notify("error", err.message);
  }
}

// ========================================
// WATCHERS
// ========================================

export default function* horarioSaga() {
  yield all([
    takeLatest(types.ADD_HORARIO, addHorario),
    takeLatest(types.ALL_HORARIOS, handleAllHorarios),
    takeLatest(types.SAVE_HORARIO, saveHorario),
    takeLatest(types.REMOVE_HORARIO, removeHorario),
  ]);
}
