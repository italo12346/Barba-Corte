import moment from "moment-timezone";
import { call, put, select, takeLatest } from "redux-saga/effects";
import api from "../../../services/api"; // ajuste o caminho conforme seu projeto
import Types from "./types";

const TZ = "America/Sao_Paulo";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converte um horário da API em eventos do BigCalendar.
 *
 * - start/end são guardados como ISO string no Redux (serializável)
 *   e convertidos para Date apenas no useMemo do componente.
 * - nomeColaborador é opcional: se fornecido, aparece no title do evento.
 *
 * Ex.: diasSemana=[1,3], horaInicio="08:30", horaFim="15:30"
 *   → gera dois eventos: segunda-feira 08:30-15:30 e quarta-feira 08:30-15:30
 *     da semana atual.
 */
function horarioToEvents(horario, nomeColaborador = "") {
  const { diasSemana, horaInicio, horaFim, colaboradorId } = horario;

  return diasSemana.map((dia) => {
    const base = moment.tz(TZ).startOf("week").day(dia);

    const [hIni, mIni] = horaInicio.split(":").map(Number);
    const [hFim, mFim] = horaFim.split(":").map(Number);

    // ✅ ISO string → serializável no Redux, sem warnings
    const start = base.clone().hours(hIni).minutes(mIni).seconds(0).toISOString();
    const end   = base.clone().hours(hFim).minutes(mFim).seconds(0).toISOString();

    const title = nomeColaborador
      ? `${nomeColaborador} · ${horaInicio}–${horaFim}`
      : `${horaInicio}–${horaFim}`;

    return {
      id: `${horario.id}_dia${dia}`,
      horarioId: horario.id,
      colaboradorId,
      diaSemana: dia,
      horaInicio,
      horaFim,
      title,
      start,  // ISO string
      end,    // ISO string
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTAR HORÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

function* allHorariosSaga({ payload }) {
  try {
    const { salaoId, colaboradorId, diaSemana } = payload;

    const params = { salaoId };
    if (colaboradorId) params.colaboradorId = colaboradorId;
    if (diaSemana !== undefined) params.diaSemana = diaSemana;

    const { data } = yield call(api.get, "/horario", { params });

    // Pega a lista de colaboradores do store para montar o title
    const listaColaboradores = yield select(
      (state) =>
        state.colaboradores?.listaColaboradores ??
        state.colaboradores?.colaboradores ??
        state.colaboradores?.data ??
        []
    );

    const eventos = (data.horarios || []).flatMap((horario) => {
      const colaborador = listaColaboradores.find(
        (c) => c._id === String(horario.colaboradorId)
      );
      const nome = colaborador?.nome || "";
      return horarioToEvents(horario, nome);
    });

    yield put({ type: Types.ALL_HORARIOS_SUCCESS, payload: eventos });
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao buscar horários";
    yield put({ type: Types.ALL_HORARIOS_FAILURE, payload: msg });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRIAR HORÁRIO
// ─────────────────────────────────────────────────────────────────────────────

function* createHorarioSaga({ payload }) {
  try {
    const { salaoId, colaboradorId, diasSemana, horaInicio, horaFim } = payload;

    const { data } = yield call(api.post, "/horario", {
      salaoId,
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim,
    });

    // Busca nome do colaborador para o title do evento
    const listaColaboradores = yield select(
      (state) =>
        state.colaboradores?.listaColaboradores ??
        state.colaboradores?.colaboradores ??
        state.colaboradores?.data ??
        []
    );
    const colaborador = listaColaboradores.find((c) => c._id === colaboradorId);
    const nome = colaborador?.nome || "";

    const novosEventos = horarioToEvents(data.horario, nome);

    yield put({ type: Types.CREATE_HORARIO_SUCCESS, payload: novosEventos });
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Erro ao cadastrar horário";
    yield put({ type: Types.CREATE_HORARIO_FAILURE, payload: msg });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ATUALIZAR HORÁRIO  (pronto para quando a API tiver PUT /horario/:id)
// ─────────────────────────────────────────────────────────────────────────────

function* updateHorarioSaga({ payload }) {
  try {
    const { horarioId, salaoId, colaboradorId, diasSemana, horaInicio, horaFim } =
      payload;

    const { data } = yield call(api.put, `/horario/${horarioId}`, {
      salaoId,
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim,
    });

    const listaColaboradores = yield select(
      (state) =>
        state.colaboradores?.listaColaboradores ??
        state.colaboradores?.colaboradores ??
        state.colaboradores?.data ??
        []
    );
    const colaborador = listaColaboradores.find((c) => c._id === colaboradorId);
    const nome = colaborador?.nome || "";

    // Remove os eventos antigos desse horário e insere os novos
    const listaAtual = yield select((state) => state.horario.listaHorarios);
    const semAntigos = listaAtual.filter((e) => e.horarioId !== horarioId);
    const novosEventos = horarioToEvents(data.horario, nome);

    yield put({
      type: Types.UPDATE_HORARIO_SUCCESS,
      payload: [...semAntigos, ...novosEventos],
    });
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Erro ao atualizar horário";
    yield put({ type: Types.UPDATE_HORARIO_FAILURE, payload: msg });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT SAGA
// ─────────────────────────────────────────────────────────────────────────────

export default function* horarioSagas() {
  yield takeLatest(Types.ALL_HORARIOS_REQUEST,    allHorariosSaga);
  yield takeLatest(Types.CREATE_HORARIO_REQUEST,  createHorarioSaga);
  yield takeLatest(Types.UPDATE_HORARIO_REQUEST,  updateHorarioSaga);
}