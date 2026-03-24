import types from './types';

// ========================= FILTER =========================

export const filterAgendamentos = (start, end) => ({
  type: types.FILTER_AGENDAMENTOS,
  payload: { start, end },
});

export const updateAgendamento = (agendamentos) => ({
  type: types.UPDATE_AGENDAMENTOS,
  payload: { agendamentos },
});

// ========================= CREATE =========================

export const createAgendamento = (data) => ({
  type: types.CREATE_AGENDAMENTO,
  payload: data,
});

// ========================= UPDATE ONE =========================

export const updateOneAgendamento = (id, data) => ({
  type: types.UPDATE_AGENDAMENTO,
  payload: { id, data },
});

// ========================= DELETE =========================

export const deleteAgendamento = (id) => ({
  type: types.DELETE_AGENDAMENTO,
  payload: { id },
});
