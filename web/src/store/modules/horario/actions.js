import Types from "./types";

// ─────────────────────────────────────────────────────────
// LISTAR
// ─────────────────────────────────────────────────────────

/**
 * Busca todos os horários do salão (e opcionalmente filtra por colaborador/dia).
 * @param {string} salaoId
 * @param {Object} [filtros] - { colaboradorId?, diaSemana? }
 */
export const allHorarios = (salaoId, filtros = {}) => ({
  type: Types.ALL_HORARIOS_REQUEST,
  payload: { salaoId, ...filtros },
});

// ─────────────────────────────────────────────────────────
// CRIAR
// ─────────────────────────────────────────────────────────

/**
 * Cria um novo horário de trabalho para um colaborador.
 *
 * @param {Object} data
 * @param {string}   data.salaoId
 * @param {string}   data.colaboradorId
 * @param {number[]} data.diasSemana   - ex.: [1, 2, 3]  (0=dom … 6=sáb)
 * @param {string}   data.horaInicio  - "HH:mm"
 * @param {string}   data.horaFim     - "HH:mm"
 */
export const createHorario = (data) => ({
  type: Types.CREATE_HORARIO_REQUEST,
  payload: data,
});

// ─────────────────────────────────────────────────────────
// ATUALIZAR (pronto para quando a API tiver PUT)
// ─────────────────────────────────────────────────────────

/**
 * Atualiza um horário existente.
 *
 * @param {string} horarioId
 * @param {Object} data - mesmos campos do createHorario
 */
export const updateHorario = (horarioId, data) => ({
  type: Types.UPDATE_HORARIO_REQUEST,
  payload: { horarioId, ...data },
});

// ─────────────────────────────────────────────────────────
// UI — MODAL
// ─────────────────────────────────────────────────────────

/**
 * Abre o modal de criação/edição de horário.
 *
 * @param {Object} [slotData] - dados pré-preenchidos vindos do calendário
 * @param {string}   [slotData.colaboradorId]
 * @param {number[]} [slotData.diasSemana]
 * @param {string}   [slotData.horaInicio]
 * @param {string}   [slotData.horaFim]
 * @param {string}   [slotData.horarioId]  - presente quando é edição
 */
export const openHorarioModal = (slotData = {}) => ({
  type: Types.OPEN_HORARIO_MODAL,
  payload: slotData,
});

export const closeHorarioModal = () => ({
  type: Types.CLOSE_HORARIO_MODAL,
});

// ─────────────────────────────────────────────────────────
// UI — VIEW DO CALENDÁRIO
// ─────────────────────────────────────────────────────────

export const setCalendarView = (view) => ({
  type: Types.SET_CALENDAR_VIEW,
  payload: view,
});
