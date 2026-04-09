import moment from "moment-timezone";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import api from "../../../services/api"; 
import Types from "./types";

const TZ = "America/Sao_Paulo";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function horarioToEvents(horario, nomeColaborador = "") {
  const diasSemana = Array.isArray(horario.diasSemana) ? horario.diasSemana : [];
  const { horaInicio, horaFim, colaboradorId } = horario;
  
  const id = horario.id || horario._id;

  return diasSemana.map((dia) => {
    const base = moment.tz(TZ).startOf("week").day(dia);

    const [hIni, mIni] = horaInicio.split(":").map(Number);
    const [hFim, mFim] = horaFim.split(":").map(Number);

    const start = base.clone().hours(hIni).minutes(mIni).seconds(0).toISOString();
    const end   = base.clone().hours(hFim).minutes(mFim).seconds(0).toISOString();

    const title = nomeColaborador
      ? `${nomeColaborador} · ${horaInicio}–${horaFim}`
      : `${horaInicio}–${horaFim}`;

    return {
      id: `${id}_dia${dia}`,
      horarioId: id,
      colaboradorId,
      colaboradorNome: nomeColaborador,
      diaSemana: dia,
      horaInicio,
      horaFim,
      title,
      start,
      end,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTAR HORÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

function* allHorariosSaga() {
  try {
    const { data } = yield call(api.get, "/horario");

    const listaColaboradores = yield select(
      (state) => 
        state.colaborador?.lista || 
        state.colaboradores?.lista || 
        []
    );

    const eventos = (data.horarios || []).flatMap((horario) => {
      const cId = horario.colaboradorId?._id || horario.colaboradorId;
      const colaborador = listaColaboradores.find(
        (c) => String(c._id) === String(cId)
      );
      return horarioToEvents(horario, colaborador?.nome || "");
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
    const { data } = yield call(api.post, "/horario", payload);

    const listaColaboradores = yield select(
      (state) => state.colaborador?.lista || []
    );
    
    const cId = data.horario.colaboradorId?._id || data.horario.colaboradorId;
    const colaborador = listaColaboradores.find((c) => String(c._id) === String(cId));
    
    const novosEventos = horarioToEvents(data.horario, colaborador?.nome || "");

    const listaAtual = yield select((state) => state.horario.listaHorarios || []);
    
    yield put({ 
      type: Types.CREATE_HORARIO_SUCCESS, 
      payload: [...listaAtual, ...novosEventos] 
    });
    
    alert("Horário cadastrado com sucesso!");
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao cadastrar horário";
    yield put({ type: Types.CREATE_HORARIO_FAILURE, payload: msg });
    alert(msg);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXCLUIR HORÁRIO (CORRIGIDO)
// ─────────────────────────────────────────────────────────────────────────────

function* deleteHorarioSaga({ payload: horarioId }) {
  try {
    /**
     * GARANTIA EXTRA: O ID do horário não pode conter o sufixo do calendário (_diaX).
     * Se ele contiver, removemos para enviar apenas o ObjectId puro para a API.
     */
    let id = typeof horarioId === 'string' ? horarioId : (horarioId.id || horarioId._id || horarioId.horarioId);
    
    if (id && id.includes("_dia")) {
        id = id.split("_dia")[0];
    }

    if (!id || typeof id !== 'string') {
        throw new Error("ID de horário inválido para exclusão");
    }

    // Chamada para a API deletar (enviando apenas a string do ID na URL)
    yield call(api.delete, `/horario/${id}`);

    /**
     * CORREÇÃO: Enviamos apenas o ID puro para o Reducer.
     * O Reducer agora é responsável por filtrar a lista local.
     */
    yield put({ 
      type: Types.DELETE_HORARIO_SUCCESS, 
      payload: id 
    });
    
    alert("Horário removido com sucesso!");
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "Erro ao excluir horário";
    yield put({ type: Types.DELETE_HORARIO_FAILURE, payload: msg });
    alert(msg);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT SAGA
// ─────────────────────────────────────────────────────────────────────────────

export default function* horarioSagas() {
  yield all([
    takeLatest(Types.ALL_HORARIOS_REQUEST,    allHorariosSaga),
    takeLatest(Types.CREATE_HORARIO_REQUEST,  createHorarioSaga),
    takeLatest(Types.DELETE_HORARIO_REQUEST,  deleteHorarioSaga),
  ]);
}
